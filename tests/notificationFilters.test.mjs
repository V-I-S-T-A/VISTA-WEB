import test from 'node:test';
import assert from 'node:assert/strict';
import { filterNotifications, notificationActivity, groupNotifications } from '../src/utils/notificationFilters.js';

const notifications = [
  { notification_id: 'read', is_read: true },
  { notification_id: 'unread', is_read: false },
  { notification_id: 'priority-status', is_read: true, is_priority: true, type: 'submission_status_changed' },
  { notification_id: 'priority-event', is_read: false, is_priority: false, type: 'submission_priority_changed' },
];

test('All retains API order and Unread does not change read state', () => {
  const snapshot = structuredClone(notifications);
  assert.deepEqual(filterNotifications(notifications, 'all'), notifications);
  assert.deepEqual(filterNotifications(notifications, 'unread').map(item => item.notification_id), ['unread', 'priority-event']);
  assert.deepEqual(notifications, snapshot);
});

test('activity summaries distinguish creation, status updates and priority without losing the actor or title', () => {
  const item = { actor_name: 'Lenbert', submission_title: 'Local off campus' };
  assert.equal(notificationActivity({ ...item, type: 'submission_created' }), 'Lenbert added a new submission: Local off campus');
  assert.equal(notificationActivity({ ...item, type: 'submission_status_changed' }), 'Lenbert updated: Local off campus');
  assert.equal(notificationActivity({ ...item, type: 'submission_priority_changed' }), 'Lenbert marked as priority: Local off campus');
  assert.equal(notificationActivity({ ...item, actor_name: null }), 'VISTA updated: Local off campus');
});

test('date groups use local calendar days and preserve notification order', () => {
  const now = new Date(2026, 9, 30, 12);
  const items = [
    { created_at: new Date(2026, 9, 30, 1).toISOString() },
    { created_at: new Date(2026, 9, 29, 23).toISOString() },
    { created_at: new Date(2026, 9, 27, 23).toISOString() },
    { created_at: 'invalid' },
  ];
  const groups = groupNotifications(items, now);
  assert.deepEqual(groups.map(group => group.label), ['New', 'Earlier', '3 days ago']);
  assert.deepEqual(groups[1].items, [items[1], items[3]]);
  assert.deepEqual(groupNotifications([], now), []);
});

test('Priority includes updates to priority entries and explicit priority events, without duplicates', () => {
  const both = { notification_id: 'both', is_priority: true, type: 'submission_priority_changed' };
  assert.deepEqual(filterNotifications([...notifications, both], 'priority').map(item => item.notification_id),
    ['priority-status', 'priority-event', 'both']);
});

test('filtering before the preview limit finds updates beyond the first nine records', () => {
  const manyRead = Array.from({ length: 12 }, (_, i) => ({ notification_id: `old-${i}`, is_read: true }));
  const unread = { notification_id: 'new-unread', is_read: false };
  assert.deepEqual(filterNotifications([...manyRead, unread], 'unread').slice(0, 9), [unread]);
  assert.deepEqual(filterNotifications([], 'priority'), []);
});
