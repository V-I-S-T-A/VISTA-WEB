import test from 'node:test';
import assert from 'node:assert/strict';
import { presentAuditEvent, parseAuditChanges, auditValue, sanitizeAuditData, readableAuditFields, isAuditTechnicalField } from '../src/modules/admin/auditlogs/auditPresentation.js';
import { auditEvents } from './fixtures/admin-audit-data.mjs';

test('login and logout identify the account from actual actor data, without inventing snapshots or event IDs', () => {
  for (const action of ['login', 'logout']) {
    const event = presentAuditEvent({ ...auditEvents[0], action });
    assert.equal(event.entityLabel, 'Account involved');
    assert.equal(event.entityName, 'Sample Administrator');
    assert.equal(event.entityId, 'sample-admin');
    assert.equal(event.entityEmail, 'admin@example.test');
    assert.equal(event.before, null); assert.equal(event.after, null);
    assert.match(event.summary, /VISTA/); assert.doesNotMatch(event.summary, /Unknown Record/);
    assert.match(event.dateTime, /11:24:18.*PHT/);
  }
});
test('CRUD records use affected snapshots, never the acting administrator as the affected person', () => {
  const update = presentAuditEvent(auditEvents[1]);
  assert.equal(update.entityName, 'Current');
  assert.notEqual(update.entityName, update.actor);
  assert.deepEqual(update.fieldChanges.map(c => c.key), ['first_name', 'is_active', 'preferences']);
  assert.equal(update.fieldChanges[1].after, false);
  assert.equal(presentAuditEvent(auditEvents[2]).entityName, 'Former Campus Society');
  assert.equal(presentAuditEvent(auditEvents[2]).before.org_id, 'deleted-org');
});

test('audit account photos use the correct identity and never substitute the actor for an edited account', () => {
  assert.equal(presentAuditEvent({ ...auditEvents[0], performed_by_image: 'https://example.test/actor.png' }).entityImageUrl, 'https://example.test/actor.png');
  assert.equal(presentAuditEvent(auditEvents[0]).entityImageUrl, '');
  assert.equal(presentAuditEvent({ ...auditEvents[1], performed_by_image: 'https://example.test/actor.png' }).entityImageUrl, '');
  assert.equal(presentAuditEvent({ ...auditEvents[1], changes: { new: { first_name: 'Member', image_url: 'https://example.test/member.png' } } }).entityImageUrl, 'https://example.test/member.png');
  assert.equal(presentAuditEvent({ ...auditEvents[2], performed_by_image: 'https://example.test/actor.png' }).entityImageUrl, '');
});
test('status change uses canonical statuses and complete record ID, and create keeps its full snapshot', () => {
  const event = presentAuditEvent(auditEvents[3]);
  assert.deepEqual(event.fieldChanges, [{ key: 'status', before: 'under_review', after: 'approved' }]);
  assert.equal(event.entityId, 'sample-submission');
  assert.equal(auditValue('under_review', 'status'), 'On Process');
  assert.equal(presentAuditEvent(auditEvents[4]).after.title, 'Campus activity report');
});
test('unresolved, malformed and legacy JSON data have honest fallbacks', () => {
  assert.equal(presentAuditEvent(auditEvents[5]).entityName, 'Organization identity not recorded');
  assert.equal(presentAuditEvent({ action: 'update', table_name: 'tbl_Users', audit_id: 'log-only' }).entityId, '');
  assert.equal(presentAuditEvent({ changes: '{malformed' }).invalid, true);
  assert.equal(presentAuditEvent({ performed_at: 'bad' }).dateTime, 'Time not recorded');
  assert.deepEqual(parseAuditChanges('{"deleted":{"name":"Former"}}').data.deleted, { name: 'Former' });
  assert.equal(auditValue(null), 'None'); assert.equal(auditValue(undefined), 'Not recorded');
  assert.equal(auditValue(false), 'No'); assert.match(auditValue({ nested: [1, 2] }), /nested/);
  assert.equal(presentAuditEvent({ action: 'login', performed_by: 'System' }).entityName, 'Account identity not recorded');
  assert.deepEqual(presentAuditEvent(auditEvents[5]).fieldChanges, []);
});

test('human-readable fields exclude nested machine references without changing the original evidence', () => {
  const original = { user_id: 'full-reference', preferences: { theme: 'dark', updated_at: '2026-11-20T00:00:00Z' }, is_active: false, nested: [{ org_id: 'org-reference', name: 'Campus' }] };
  const copy = structuredClone(original);
  assert.deepEqual(readableAuditFields(original), { preferences: { theme: 'dark' }, is_active: false, nested: [{ name: 'Campus' }] });
  assert.deepEqual(original, copy);
  assert.equal(isAuditTechnicalField('submission_id'), true);
  assert.equal(isAuditTechnicalField('first_name'), false);
  const event = presentAuditEvent(auditEvents[5]);
  assert.equal(event.entityId, 'unresolved-org');
  assert.ok(!event.summary.includes(event.entityId));
});
test('technical payloads retain nested audit evidence but redact credential fields', () => {
  const additional = { related_events: [{ audit_id: 'related-event', action: 'update', changes: { old: { name: 'Before' }, new: { name: 'After' } } }] };
  assert.deepEqual(sanitizeAuditData(additional), additional, 'additional supplied events remain intact in the disclosure payload');
  const value = sanitizeAuditData({ changes: '{"new":{"password":"private","token":"private","name":"Member","nested":{"is_active":false}}}' });
  assert.equal(value.changes.new.password, '[Redacted sensitive value]');
  assert.equal(value.changes.new.token, '[Redacted sensitive value]');
  assert.equal(value.changes.new.name, 'Member');
  assert.equal(value.changes.new.nested.is_active, false);
  assert.equal(sanitizeAuditData({ must_change_password: true }).must_change_password, true);
  assert.equal(sanitizeAuditData({ old_password: 'private', temporary_password: 'private', new_password: 'private' }).old_password, '[Redacted sensitive value]');
  assert.equal(sanitizeAuditData({ old_password: 'private', temporary_password: 'private', new_password: 'private' }).temporary_password, '[Redacted sensitive value]');
  assert.equal(sanitizeAuditData({ old_password: 'private', temporary_password: 'private', new_password: 'private' }).new_password, '[Redacted sensitive value]');
});
