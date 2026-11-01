import test from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationToasts } from '../src/services/notificationToasts.js';

const frame = (id, extra = {}) => ({ version: 1, type: 'notification.created', notification_id: id, ...extra });
const item = (id, extra = {}) => ({ notification_id: id, submission_id: 'entry', message: id, is_read: false, ...extra });
function harness(results = [item('new')]) {
  const shown = []; let requests = 0, active = true;
  const handler = createNotificationToasts({ isCurrent: () => active, show: row => shown.push(row),
    loadNotifications: async () => { requests++; return { results }; } });
  return { handler, shown, get requests() { return requests; }, switchAccount() { active = false; } };
}

test('only new v1 personal-created IDs confirmed by the signed-in REST list produce toasts', async () => {
  const h = harness([item('old'), item('new'), item('read', { is_read: true })]);
  await h.handler.receive([{type:'reconnected'}, frame('old', {type:'submission.updated'}), frame('old', {type:'review_reply.created'}), frame('old', {type:'notification.changed'}), frame('old', {type:'notification.read'}), frame('old', {version:2})]);
  assert.equal(h.requests, 0); assert.deepEqual(h.shown, []);
  await h.handler.receive([frame('new'), frame('foreign'), frame('read')]);
  assert.equal(h.requests, 2); assert.deepEqual(h.shown.map(row => row.notification_id), ['new']);
});

test('duplicate notification IDs across event IDs, batches and reconnects never duplicate a toast', async () => {
  const h = harness();
  await h.handler.receive(Array.from({length:100}, (_, id) => frame('new', {event_id:id})));
  for (let i=0;i<5;i++) await h.handler.receive([{type:'reconnected'}, frame('new', {event_id:'different'})]);
  assert.equal(h.requests, 1); assert.equal(h.shown.length, 1);
});

test('one list request handles several personal events without replaying history', async () => {
  const h = harness([item('old'), item('one'), item('two')]);
  await h.handler.receive([frame('one'), frame('two'), {type:'reconnected'}]);
  assert.equal(h.requests, 1); assert.deepEqual(h.shown.map(row => row.notification_id), ['one','two']);
});

test('logout/account switch and stopped async work cannot show cross-account notifications', async () => {
  let resolve; let active = true; const shown = [];
  const handler = createNotificationToasts({ isCurrent: () => active, loadNotifications: () => new Promise(done => { resolve=done; }), show: row => shown.push(row) });
  const pending = handler.receive([frame('new')]);
  active = false; handler.stop(); resolve({results:[item('new')]}); await pending;
  await handler.receive([frame('another')]);
  assert.deepEqual(shown, []);
});

test('new account starts fresh dedup state and failed REST verification never displays unverified data', async () => {
  const first = harness(); await first.handler.receive([frame('new')]); first.handler.stop();
  const second = harness(); await second.handler.receive([frame('new')]); assert.equal(second.shown.length,1);
  const shown = [];
  const failed = createNotificationToasts({isCurrent:()=>true, loadNotifications:async()=>{throw Error('offline');}, show:row=>shown.push(row)});
  await failed.receive([frame('new')]); assert.deepEqual(shown,[]);
});

test('a pre-commit REST snapshot is refreshed once and does not permanently suppress the live ID', async () => {
  let calls=0; const shown=[];
  const handler=createNotificationToasts({isCurrent:()=>true,show:row=>shown.push(row),loadNotifications:async options=>{
    calls++;
    if(calls===1)return {results:[item('history')]};
    assert.equal(options.fresh,true); return {results:[item('history'),item('new')]};
  }});
  await handler.receive([frame('new')]); await handler.receive([frame('new')]);
  assert.equal(calls,2); assert.deepEqual(shown.map(row=>row.notification_id),['new']);
});

test('failed notification verification can retry a live ID without duplicate display', async () => {
  let calls=0; const shown=[];
  const handler=createNotificationToasts({isCurrent:()=>true,show:row=>shown.push(row),loadNotifications:async()=>{
    if(++calls===1)throw Error('temporary outage'); return {results:[item('new')]};
  }});
  await handler.receive([frame('new')]); await handler.receive([frame('new')]); await handler.receive([frame('new')]);
  assert.equal(calls,2); assert.equal(shown.length,1);
});

test('live arrivals in a hidden page wait for foreground, revalidate unread state and never replay REST history', async () => {
  let visible=false; const shown=[]; let results=[item('new'),item('old')];
  const handler=createNotificationToasts({isCurrent:()=>true,isVisible:()=>visible,show:row=>shown.push(row),loadNotifications:async()=>({results})});
  await handler.receive([frame('new')]); assert.equal(shown.length,0);
  visible=true; await handler.reveal(); await handler.reveal();
  assert.deepEqual(shown.map(row=>row.notification_id),['new']);
  visible=false; results.push(item('read-elsewhere')); await handler.receive([frame('read-elsewhere')]);
  results=results.map(row=>row.notification_id==='read-elsewhere'?{...row,is_read:true}:row);
  visible=true; await handler.reveal(); assert.equal(shown.length,1);
  await handler.receive([{type:'reconnected'}]); assert.equal(shown.length,1);
});

test('logout or a read event discards queued background alerts', async () => {
  let visible=false; const shown=[];
  const make=()=>createNotificationToasts({isCurrent:()=>true,isVisible:()=>visible,show:row=>shown.push(row),loadNotifications:async()=>({results:[item('new')]})});
  const handler=make(); await handler.receive([frame('new')]);
  await handler.receive([frame('new',{type:'notification.read'})]); visible=true; await handler.reveal();
  assert.equal(shown.length,0);
  visible=false; const second=make(); await second.receive([frame('new')]); second.stop(); visible=true; await second.reveal();
  assert.equal(shown.length,0);
});
