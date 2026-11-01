// Tracker events and REST history must never become personal toast alerts.
export function createNotificationToasts({ loadNotifications, show, isCurrent, isVisible = () => true }) {
  const seen = new Set();
  const inFlight = new Set();
  const waiting = new Set();
  let stopped = false;
  const current = () => !stopped && isCurrent();
  const display = (data, discardMissing = false) => {
    const items = new Map((data?.results || []).map(item => [String(item.notification_id), item]));
    for (const id of waiting) {
      if (!current() || !isVisible()) return;
      const item = items.get(id);
      if (!item && !discardMissing) continue;
      waiting.delete(id);
      if (item && !item.is_read && item.submission_id) show(item);
    }
  };
  return {
    async receive(events) {
      if (!current()) return;
      const ids = new Set();
      for (const event of events) {
        if (event.version === 1 && event.type === 'notification.read' && event.notification_id) {
          const id = String(event.notification_id);
          waiting.delete(id);
          seen.add(id);
        }
        if (event.version !== 1 || event.type !== 'notification.created' || !event.notification_id) continue;
        const id = String(event.notification_id);
        if (seen.has(id) || inFlight.has(id)) continue;
        ids.add(id);
      }
      if (!ids.size) return;
      ids.forEach(id => inFlight.add(id));
      // Shared batch verification, with at most one fresh-snapshot retry;
      // never one API request per event.
      try {
        let data = await loadNotifications();
        if (!current()) return;
        // An already-running REST snapshot may predate the committed event.
        // Verify once afresh instead of permanently deduplicating an unseen ID.
        if ([...ids].some(id => !data?.results?.some(item => String(item.notification_id) === id))) {
          data = await loadNotifications({ fresh: true });
          if (!current()) return;
        }
        for (const item of data?.results || []) {
          const id = String(item.notification_id);
          if (ids.has(id) && !seen.has(id)) {
            seen.add(id);
            if (!item.is_read && item.submission_id) waiting.add(id);
          }
        }
        display(data);
      } catch {
        // Unverified IDs remain eligible for a later live-event retry.
      } finally {
        ids.forEach(id => inFlight.delete(id));
      }
    },
    async reveal() {
      if (!current() || !isVisible() || !waiting.size) return;
      try {
        const data = await loadNotifications({ fresh: true });
        if (current() && isVisible()) display(data, true);
      } catch { /* Keep live pending IDs for the next foreground attempt. */ }
    },
    stop() { stopped = true; seen.clear(); inFlight.clear(); waiting.clear(); },
  };
}
