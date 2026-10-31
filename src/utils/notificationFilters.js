export const NOTIFICATION_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'priority', label: 'Priority' },
];

export function filterNotifications(notifications, filter) {
  if (filter === 'unread') return notifications.filter(item => !item.is_read);
  if (filter === 'priority') {
    return notifications.filter(item => item.is_priority || item.type === 'submission_priority_changed');
  }
  return notifications;
}

export function notificationEmptyState(filter) {
  if (filter === 'unread') return ['No unread notifications', 'You’ve read all your recent updates.'];
  if (filter === 'priority') return ['No priority updates', 'Updates for priority submissions will appear here.'];
  return ["You're all caught up", 'Submission updates will appear here.'];
}

export function notificationActivity(item) {
  const actor = item.actor_name?.trim() || 'VISTA';
  const title = item.submission_title || `Submission ${item.submission_id?.slice(0, 8) || ''}`;
  if (item.type === 'review_reply_created') return `${actor} replied to your review: ${title}`;
  const action = item.type === 'submission_created' ? 'added a new submission'
    : item.type === 'submission_priority_changed' ? 'marked as priority' : 'updated';
  return `${actor} ${action}: ${title}`;
}

export function groupNotifications(items, now = new Date()) {
  const localDay = date => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const groups = new Map();
  for (const item of items) {
    const date = new Date(item.created_at);
    const days = Math.max(0, Math.round((localDay(now) - localDay(date)) / 86_400_000));
    const label = !Number.isFinite(days) || days === 1 ? 'Earlier' : days === 0 ? 'New' : `${days} days ago`;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(item);
  }
  return Array.from(groups, ([label, items]) => ({ label, items }));
}
