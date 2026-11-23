import test from 'node:test';
import assert from 'node:assert/strict';
import { isUserActivityInactive, userActivityPage } from '../src/utils/userActivity.js';

test('Web activity status separates login history from account permission without mutating either', () => {
  const users = [
    { is_active: true, last_login: null, must_change_password: true },
    { is_active: true, last_login: null, must_change_password: false },
    { is_active: true, last_login: '2026-11-23T00:00:00Z' },
    { is_active: false, last_login: null },
    { is_active: false, last_login: '2026-11-23T00:00:00Z' },
  ];
  const original = structuredClone(users);
  assert.deepEqual(users.map(isUserActivityInactive), [true, true, false, true, true]);
  assert.equal(users.filter(isUserActivityInactive).length, 4, 'a disabled account with no history counts once');
  assert.deepEqual(users, original);
});

test('activity filtering paginates the complete match set and clamps an obsolete last page', () => {
  const users = Array.from({ length: 18 }, (_, i) => ({ user_id: i, is_active: i < 16, last_login: i < 12 || i === 16 ? null : '2026-11-23T00:00:00Z' }));
  const first = userActivityPage(users, { activityStatus: 'inactive', page: 1, pageSize: 8 });
  assert.equal(first.count, 14); assert.equal(first.total_pages, 2);
  assert.deepEqual(first.results.map(user => user.user_id), [0, 1, 2, 3, 4, 5, 6, 7]);
  const last = userActivityPage(users, { activityStatus: 'inactive', page: 99, pageSize: 8 });
  assert.equal(last.current_page, 2); assert.equal(last.count, 14);
  assert.deepEqual(last.results.map(user => user.user_id), [8, 9, 10, 11, 16, 17]);
  const active = userActivityPage(users, { activityStatus: 'active', page: 1, pageSize: 8 });
  assert.equal(active.count, 4);
  assert.deepEqual(active.results.map(user => user.user_id), [12, 13, 14, 15]);
  assert.equal(userActivityPage([], { activityStatus: 'inactive', page: 3, pageSize: 8 }).current_page, 1);
});
