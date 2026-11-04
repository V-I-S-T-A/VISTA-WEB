import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const id = '11111111-2222-4333-8444-555555555555';
async function withService(run) {
  const server = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-tests/staff-navigation',
    server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  try {
    const { notificationService } = await server.ssrLoadModule('/src/services/notificationService.js');
    const { submissionService } = await server.ssrLoadModule('/src/services/submissionService.js');
    await run(notificationService, submissionService);
  } finally { await server.close(); }
}

test('Staff notification targets hydrate the existing review-page metadata from authorized REST', async () => withService(async (notifications, submissions) => {
  let requested;
  submissions.getSubmissionById = async value => {
    requested = value;
    return { submission_id: id, title: 'Exact entry', org_name: 'Exact organization', submitted_by_name: 'Submitter',
      submitted_by_email: 'submitter@example.test', doc_type_name: 'Document', submitted_at: '2026-11-01T01:00:00Z', status: 'under_review' };
  };
  const selected = await notifications.getStaffReviewSubmission(id);
  assert.equal(requested, id);
  assert.equal(selected.id, id); assert.equal(selected.title, 'Exact entry');
  assert.equal(selected.site, 'Exact organization'); assert.equal(selected.contactEmail, 'Submitter (submitter@example.test)');
  assert.equal(selected.documentType, 'Document'); assert.equal(selected.status, 'under_review');
  assert.ok(selected.submittedDate);
}));

test('missing or malformed Staff targets never issue an API request', async () => withService(async (notifications, submissions) => {
  submissions.getSubmissionById = async () => assert.fail('Invalid targets must not be fetched');
  for (const value of [null, undefined, '', '../private', 'not-a-submission', { id }]) {
    await assert.rejects(notifications.getStaffReviewSubmission(value), /Invalid submission target/);
  }
}));

test('inaccessible or deleted Staff targets preserve the API rejection instead of opening another record', async () => withService(async (notifications, submissions) => {
  for (const status of [403, 404]) {
    const error = Object.assign(new Error('Unavailable'), { response: { status } });
    submissions.getSubmissionById = async () => { throw error; };
    await assert.rejects(notifications.getStaffReviewSubmission(id), value => value === error);
  }
}));

test('a Staff detail response for another submission cannot become a navigation target', async () => withService(async (notifications, submissions) => {
  submissions.getSubmissionById = async () => ({ submission_id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' });
  await assert.rejects(notifications.getStaffReviewSubmission(id), /Submission target mismatch/);
}));
