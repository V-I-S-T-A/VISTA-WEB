import test from "node:test";
import assert from "node:assert/strict";
import { processRegistrationUpload, createRegistrationSaver } from "../src/utils/registrationUpload.js";

const original = { name: "request.pdf", type: "application/pdf" };
const converted = { name: "request.webp", type: "image/webp" };
const draft = { data: { status: "draft_pending_review", suggested_org_id: "ucs" } };

test('aborted scans cannot restore a cleared file or OCR draft', async () => {
  const controller = new AbortController();
  let release;
  const result = processRegistrationUpload(original, {
    signal: controller.signal, prepare: () => new Promise(resolve => { release = resolve; }),
    read: async () => { controller.abort(); return draft; },
    onPrepared: () => assert.fail('Restored cancelled file'), onRead: () => assert.fail('Restored cancelled OCR'),
  });
  await new Promise(resolve => setImmediate(resolve));
  release(converted);
  await result;
});

test('attachment retry reuses the saved submission and already uploaded asset', async () => {
  const save = createRegistrationSaver();
  let creates = 0, uploads = 0, attaches = 0;
  const options = { payload: { title: 'One entry' }, file: original,
    create: async () => { creates++; return 'saved-id'; },
    upload: async () => { uploads++; return { secure_url: 'https://example.test/file' }; },
    findAttachment: async () => attaches > 0,
    attach: async () => { attaches++; throw new Error('Lost document response after persistence'); },
  };
  await assert.rejects(save(options), /saved.*attachment/);
  assert.equal(await save(options), 'saved-id');
  assert.deepEqual([creates, uploads, attaches], [1, 1, 1]);
});

test('an ambiguous create failure cannot blindly create another submission', async () => {
  const save = createRegistrationSaver();
  let creates = 0;
  const options = { payload: {}, file: null, create: async () => { creates++; throw new Error('Timeout'); } };
  await assert.rejects(save(options), /uncertain/);
  await assert.rejects(save(options), /uncertain/);
  assert.equal(creates, 1);
});

test('concurrent clicks cannot submit the registration twice', async () => {
  const save = createRegistrationSaver();
  let resolve;
  const first = save({ payload: {}, file: null, create: () => new Promise(done => { resolve = done; }) });
  await assert.rejects(save({ payload: {}, file: null }), /already being saved/);
  resolve('one-id');
  assert.equal(await first, 'one-id');
});

test("a missing conversion endpoint cannot block OCR or discard the original", async () => {
  let attached = original;
  let suggestion;
  const failure = { response: { status: 404 } };
  const result = await processRegistrationUpload(original, {
    prepare: async () => { throw failure; },
    read: async file => { assert.equal(file, original); return draft; },
    onPrepared: file => { attached = file; },
    onRead: data => { suggestion = data; },
  });
  assert.equal(result.preparationError, failure);
  assert.equal(result.readingError, null);
  assert.equal(attached, original);
  assert.equal(suggestion, draft);
});

test("OCR results appear while slow conversion is still pending", async () => {
  let finishConversion;
  let receivedDraft;
  let attached = original;
  const conversion = new Promise(resolve => { finishConversion = resolve; });
  const completed = processRegistrationUpload(original, {
    prepare: () => conversion,
    read: async () => draft,
    onPrepared: file => { attached = file; },
    onRead: data => { receivedDraft = data; },
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(receivedDraft, draft);
  assert.equal(attached, original);
  finishConversion(converted);
  assert.deepEqual(await completed, { preparationError: null, readingError: null });
  assert.equal(attached, converted);
});

test("OCR errors do not discard a successfully converted attachment", async () => {
  let attached = original;
  const failure = { response: { status: 500 } };
  const result = await processRegistrationUpload(original, {
    prepare: async () => converted,
    read: async () => { throw failure; },
    onPrepared: file => { attached = file; },
    onRead: () => assert.fail("Failed OCR must not apply suggestions"),
  });
  assert.equal(attached, converted);
  assert.equal(result.preparationError, null);
  assert.equal(result.readingError, failure);
});

test("synchronous conversion failure still allows the OCR request", async () => {
  let read = false;
  const result = await processRegistrationUpload(original, {
    prepare: () => { throw new Error("Invalid preview response"); },
    read: async () => { read = true; return draft; },
    onPrepared: () => assert.fail("No preview was generated"),
    onRead: response => assert.equal(response, draft),
  });
  assert.equal(read, true);
  assert.match(result.preparationError.message, /Invalid preview/);
  assert.equal(result.readingError, null);
});

test("prepareAttachment helper catches conversion errors and safely returns the original file", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    cacheDir: "node_modules/.vite-tests/prep-attach",
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] },
    logLevel: "error",
  });
  try {
    const { prepareAttachment } = await server.ssrLoadModule("/src/utils/prepareAttachment.js");
    const testFile = new File(["%PDF"], "document.pdf", { type: "application/pdf" });
    const result = await prepareAttachment(testFile, undefined, { post: async () => { throw new Error("Simulated unavailable conversion"); } });
    assert.equal(result, testFile);
  } finally {
    await server.close();
  }
});
