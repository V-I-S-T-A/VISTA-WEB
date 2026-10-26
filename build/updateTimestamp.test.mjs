import test from 'node:test';
import assert from 'node:assert/strict';
import { getUpdateTimestamp } from './updateTimestamp.mjs';

test('uses the latest commit timestamp when Git metadata is available', () => {
  assert.equal(getUpdateTimestamp({ readCommitDate: () => '2026-10-26T23:30:00+08:00' }), '2026-10-26T15:30:00.000Z');
});
test('uses build time when deployed without Git metadata', () => {
  assert.equal(getUpdateTimestamp({ readCommitDate: () => { throw new Error('No git'); }, now: () => new Date('2026-10-27T02:00:00Z') }), '2026-10-27T02:00:00.000Z');
});
test('ignores invalid Git output and accepts an explicit release timestamp', () => {
  assert.equal(getUpdateTimestamp({ readCommitDate: () => '', now: () => new Date('2026-10-27T02:00:00Z') }), '2026-10-27T02:00:00.000Z');
  assert.equal(getUpdateTimestamp({ override: '2026-10-28T00:00:00+08:00' }), '2026-10-27T16:00:00.000Z');
  assert.throws(() => getUpdateTimestamp({ override: 'not-a-date' }), /valid ISO date/);
});
