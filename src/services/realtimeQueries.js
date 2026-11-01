export const REALTIME_UPDATE = 'vista:realtime-notification';
const all = new Set([
  'notifications', 'student-notifications', 'submission', 'submissions',
  'submission-statistics', 'priority-submissions', 'review-logs', 'review-replies', 'audit-logs',
]);

export function realtimeChanges(events) {
  const recover = events.some(event => event.type === 'reconnected' || (event.version == null && event.type !== 'notification.unread_count_changed'));
  const submissionIds = new Set(events.map(event => event.submission_id).filter(Boolean).map(String));
  const logIds = new Set(events.map(event => event.review_log_id).filter(Boolean).map(String));
  const notifications = events.some(event => event.type.startsWith('notification.'));
  const submissions = events.some(event => event.type.startsWith('submission.'));
  const reviews = events.some(event => event.type.startsWith('review_'));
  return { recover, submissionIds: [...submissionIds], predicate: query => {
    const [key, id] = query.queryKey;
    if (recover) return all.has(key);
    if (['notifications', 'student-notifications'].includes(key)) return notifications;
    if (key === 'submission') return submissionIds.has(String(id));
    if (key === 'review-replies') return reviews && query.queryKey.slice(1).some(value => logIds.has(String(value)));
    if (key === 'review-logs') return reviews && (!id?.submissionId || submissionIds.has(String(id.submissionId)));
    return (submissions || reviews) && ['submissions', 'submission-statistics', 'priority-submissions', 'audit-logs'].includes(key);
  } };
}

export async function refreshRealtimeQueries(queryClient, events, notify) {
  const change = realtimeChanges(events);
  notify?.({ recover: change.recover, submissionIds: change.submissionIds });
  // Refetch active observers only; inactive pages become stale for their next visit.
  await queryClient.invalidateQueries({ predicate: change.predicate }, { cancelRefetch: false });
}

// Personal alerts run independently, while tracker reads retain their original
// serial/coalesced behavior so a slow old snapshot cannot swallow newer events.
export function createRealtimeQueryRefresher(refresh, isCurrent) {
  let pending = [], running = false, stopped = false;
  const current = () => !stopped && isCurrent();
  async function drain() {
    running = true;
    while (current() && pending.length) {
      const events = pending;
      pending = [];
      try { await refresh(events); } catch { /* Query observers retain their existing error UI. */ }
    }
    running = false;
  }
  return {
    enqueue(events) {
      if (!current()) return;
      pending.push(...events);
      if (!running) void drain();
    },
    stop() { stopped = true; pending = []; },
  };
}
