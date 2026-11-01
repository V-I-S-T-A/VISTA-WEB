import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { createRealtimeClient, websocketUrl } from '../src/services/realtimeService.js';
import { realtimeChanges, refreshRealtimeQueries, createRealtimeQueryRefresher } from '../src/services/realtimeQueries.js';

test('slow tracker snapshots coalesce newer events into one follow-up read without blocking personal work', async () => {
  let release;const batches=[];
  const refresher=createRealtimeQueryRefresher(async events=>{batches.push(events);if(batches.length===1)await new Promise(done=>{release=done;});},()=>true);
  refresher.enqueue([{type:'submission.updated',status:'approved'}]);
  for(let i=0;i<30;i++)refresher.enqueue([{type:'submission.updated',status:'under_review',event_id:i}]);
  assert.equal(batches.length,1);
  release();await settle();assert.equal(batches.length,2);assert.equal(batches[1].length,30);
  assert.equal(batches[1].at(-1).status,'under_review');refresher.stop();
});

test('logout discards pending tracker refreshes after a slow prior-account read',async()=>{
  let release;let calls=0;
  const refresher=createRealtimeQueryRefresher(async()=>{calls++;await new Promise(done=>{release=done;});},()=>true);
  refresher.enqueue([{}]);refresher.enqueue([{}]);refresher.stop();release();await settle();assert.equal(calls,1);
});

const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function harness(overrides = {}) {
  const sockets = [], batches = [], statuses = [], timers = new Map();
  let timerId = 0, now = 0, tokenCalls = 0, refreshes = 0, current = true;
  class Socket {
    constructor(url) { this.url = url; this.sent = []; sockets.push(this); }
    send(data) { this.sent.push(JSON.parse(data)); }
    frame(event) { this.onmessage?.({ data: JSON.stringify(event) }); }
    close(code = 1006) { this.onclose?.({ code }); }
  }
  const client = createRealtimeClient({
    url: 'wss://api.example.test/ws/notifications/', userId: 'student',
    getToken: async () => { tokenCalls++; return 'access-token'; },
    refreshToken: async () => { refreshes++; }, isCurrent: () => current,
    onBatch: events => { batches.push(events); }, onStatus: value => statuses.push(value),
    Socket, random: () => 0.5,
    schedule: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, at: now + ms }); return id; },
    unschedule: id => timers.delete(id), ...overrides,
  });
  async function advance(ms) {
    const end = now + ms;
    for (;;) {
      const next = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].fn(); await settle();
    }
    now = end; await settle();
  }
  return { client, sockets, batches, statuses, advance, timers,
    get tokenCalls() { return tokenCalls; }, get refreshes() { return refreshes; },
    switchAccount() { current = false; },
  };
}

test('configured HTTPS and same-origin proxy map to socket path without leaking URL parameters', () => {
  assert.equal(websocketUrl('https://backend.test/api?token=bad', 'https://web.test'), 'wss://backend.test/ws/notifications/');
  assert.equal(websocketUrl('/api', 'http://localhost:5173/staff/review'), 'ws://localhost:5173/ws/notifications/');
});

test('one connection, first-frame authentication, ready gating, v1 dedup and batched REST recovery', async () => {
  const h = harness(); h.client.start(); h.client.start(); await settle();
  assert.equal(h.sockets.length, 1);
  const ws = h.sockets[0]; ws.onopen();
  assert.deepEqual(ws.sent, [{ token: 'access-token' }]);
  ws.frame({ version: 1, type: 'submission.updated', submission_id: 'private' });
  await h.advance(200); assert.equal(h.batches.length, 0);
  ws.frame({ type: 'ready', user_id: 'student' });
  const reply = { version: 1, event_id: 'same', type: 'review_reply.created', submission_id: 's', review_log_id: 'l' };
  for (let i = 0; i < 100; i++) ws.frame(reply);
  ws.frame({ version: 2, type: 'submission.updated' });
  ws.frame({ version: 1, type: 'unrecognized' });
  await h.advance(200);
  assert.deepEqual(h.batches[0].map(event => event.type), ['reconnected', 'review_reply.created']);
  assert.ok(h.statuses.includes('connected'));
  h.client.stop(); assert.equal(h.timers.size, 0);
});

test('expiry shares refresh, retries with backoff and ignores old sockets after account changes', async () => {
  const h = harness(); h.client.start(); await settle();
  h.sockets[0].frame({ type: 'ready', user_id: 'student' }); await h.advance(200);
  h.sockets[0].close(4401); await settle();
  assert.equal(h.refreshes, 1); await h.advance(1000); assert.equal(h.sockets.length, 2);
  h.sockets[1].frame({ type: 'ready', user_id: 'student' });
  h.sockets[0].frame({ version: 1, type: 'submission.updated', event_id: 'stale' });
  h.switchAccount(); await h.advance(200);
  assert.equal(h.batches.length, 1);
  h.client.stop();
});

test('logout cancels queued updates and in-flight authentication; wrong ready account is rejected', async () => {
  let resolve;
  const h = harness({ getToken: () => new Promise(done => { resolve = done; }) });
  h.client.start(); h.client.stop(); resolve('old-token'); await settle();
  assert.equal(h.sockets.length, 0);
  const other = harness(); other.client.start(); await settle();
  other.sockets[0].frame({ type: 'ready', user_id: 'different-account' });
  await other.advance(1000);
  assert.equal(other.statuses.at(-1), 'disconnected'); assert.equal(other.batches.length, 0);
});

test('reconnect and visibility recovery fetch missed REST state and coalesce wakeups', async () => {
  const h = harness(); h.client.start(); await settle();
  h.sockets[0].frame({ type: 'ready', user_id: 'student' }); await h.advance(200);
  h.client.recover(); h.client.recover(); await h.advance(200);
  assert.equal(h.batches.length, 2); assert.equal(h.batches[1].length, 1);
  await h.advance(1000); h.sockets[1].frame({ type: 'ready', user_id: 'student' });
  await h.advance(200); assert.equal(h.batches[2][0].type, 'reconnected'); h.client.stop();
});

test('actual query keys refresh once for bursts while unrelated detail queries stay untouched', async () => {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const keys = [['notifications', 'student'], ['student-notifications'], ['submission', 's'], ['submission', 'other'],
    ['review-logs', { submissionId: 's' }], ['review-logs', { submissionId: 'other' }],
    ['review-replies', 'l'], ['review-replies', 'student', 'l'], ['submissions', { page: 1 }], ['submission-statistics'], ['priority-submissions']];
  const calls = keys.map(() => 0), subscriptions = [];
  try {
    const observers = keys.map((queryKey, index) => new QueryObserver(cache, { queryKey, queryFn: async () => ++calls[index] }));
    observers.forEach(observer => subscriptions.push(observer.subscribe(() => {})));
    await settle();
    const event = { version: 1, type: 'review_reply.created', submission_id: 's', review_log_id: 'l' };
    await refreshRealtimeQueries(cache, Array(100).fill(event));
    assert.deepEqual(calls, [1, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2]);
    await refreshRealtimeQueries(cache, [{ version: 1, type: 'notification.created' }, { version: 1, type: 'notification.read' }]);
    assert.deepEqual(calls.slice(0, 4), [2, 2, 2, 1]);
    await refreshRealtimeQueries(cache, [{ type: 'reconnected' }]);
    assert.equal(calls[3], 2);
  } finally { subscriptions.forEach(unsubscribe => unsubscribe()); cache.clear(); }
});

test('legacy production frames reconcile identifier-poor events through REST', () => {
  const change = realtimeChanges([{ type: 'review_reply.created', id: 'reply', review_log_id: 'log' }]);
  assert.equal(change.recover, true);
  assert.equal(change.predicate({ queryKey: ['submission', 'open'] }), true);
  assert.equal(change.predicate({ queryKey: ['me'] }), false);
});

test('heartbeats stay singular and an unresponsive v1 socket reconnects', async () => {
  const h = harness(); h.client.start(); await settle();
  const ws = h.sockets[0]; ws.frame({ type: 'ready', user_id: 'student' });
  await h.advance(25_000);
  assert.deepEqual(ws.sent, [{ type: 'ping' }]);
  ws.frame({ type: 'pong' });
  await h.advance(25_000);
  assert.equal(ws.sent.length, 2);
  ws.frame({ type: 'pong' });
  await h.advance(25_000);
  assert.equal(ws.sent.length, 3);
  await h.advance(10_000); await h.advance(1000);
  assert.equal(h.sockets.length, 2);
  h.client.stop(); assert.equal(h.timers.size, 0);
});
