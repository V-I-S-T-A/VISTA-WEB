// OCR always reads the original; preview conversion must never prevent that read.
export async function processRegistrationUpload(file, { prepare, read, onPrepared, onRead, signal }) {
  const apply = callback => value => { if (!signal?.aborted) callback(value); };
  const [preparation, reading] = await Promise.allSettled([
    Promise.resolve().then(() => prepare(file)).then(apply(onPrepared)),
    Promise.resolve().then(() => read(file)).then(apply(onRead)),
  ]);
  return {
    preparationError: preparation.status === "rejected" ? preparation.reason : null,
    readingError: reading.status === "rejected" ? reading.reason : null,
  };
}

// Keep confirmed progress through attachment retries; never blindly repeat an
// ambiguous create request. Durable cross-reload idempotency needs server support.
export function createRegistrationSaver() {
  let id, uploaded, saved = false, running = false, uncertain = false, signature, source;
  return async ({ payload, file, create, upload, attach, findAttachment }) => {
    if (running) throw new Error('This submission is already being saved.');
    if (uncertain) throw new Error('The creation result is uncertain. Check the review panel before creating another entry.');
    if (id && (signature !== JSON.stringify(payload) || source !== file)) {
      throw new Error('This entry was already created. Retry its original attachment or open it in the review panel; do not create another entry.');
    }
    running = true;
    try {
      if (!id) {
        signature = JSON.stringify(payload);
        source = file;
        try {
          id = await create(payload);
          if (!id) throw new Error('Missing submission confirmation.');
        } catch (error) {
          const status = error.response?.status;
          uncertain = !status || status >= 500 || status === 408;
          throw uncertain ? new Error('The creation result is uncertain. Check the review panel before creating another entry.', { cause: error }) : error;
        }
      }
      if (file && !saved) {
        uploaded ||= await upload(file);
        if (!await findAttachment(id, uploaded.secure_url)) await attach(id, file, uploaded);
        saved = true;
      }
      return id;
    } catch (error) {
      if (id) throw new Error(`Submission ${id} is saved, but its attachment is not confirmed. Retry to finish the same entry. ${error.message}`, { cause: error });
      throw error;
    } finally { running = false; }
  };
}
