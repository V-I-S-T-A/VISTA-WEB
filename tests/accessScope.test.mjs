import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { accessScope, reconcileAccessScope } from '../src/utils/accessScope.js';

const user = { user_id: 'alice', role: 'student', org_id: 'a', org_joined_at: '2026-10-01T08:00:00Z' };

test('membership and account changes cancel requests and discard every sensitive query', async () => {
  for (const change of [{ org_id: 'b' }, { org_id: null }, { org_joined_at: null },
    { org_joined_at: '2026-10-31T00:00:00Z' }, { user_id: 'bob' }, { role: 'staff' }]) {
    const client = new QueryClient();
    client.setQueryData(['current_user'], user);
    for (const key of ['submissions', 'submission', 'review-logs', 'review-replies', 'documents', 'audit-logs', 'student-notifications', 'me']) {
      client.setQueryData([key, 'private'], { text: 'old account data' });
    }
    let aborted = false;
    const pending = client.fetchQuery({ queryKey: ['documents', 'inflight'], queryFn: ({ signal }) => new Promise(resolve => {
      signal.addEventListener('abort', () => { aborted = true; resolve('stale document'); });
    }) }).catch(() => undefined);
    await reconcileAccessScope(client, { ...user, ...change });
    await pending;
    assert.equal(aborted, true);
    assert.deepEqual(client.getQueryCache().getAll().map(query => query.queryKey), [['current_user']]);
    client.clear();
  }
});

test('ordinary profile edits and unchanged memberships preserve query data', async () => {
  const client = new QueryClient();
  client.setQueryData(['current_user'], user);
  client.setQueryData(['submission', 'owned'], 'persisted detail');
  const updated = { ...user, first_name: 'Alice updated', updated_at: 'later' };
  assert.equal(await reconcileAccessScope(client, updated), updated);
  assert.equal(client.getQueryData(['submission', 'owned']), 'persisted detail');
  assert.equal(accessScope(user), accessScope(updated));
  assert.notEqual(accessScope(user), accessScope(null));
  client.clear();
});
