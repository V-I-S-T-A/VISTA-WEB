import { convertImageToWebP } from "./fileOptimizer";

/**
 * Shared helpers for services that need to switch between a plain JSON
 * payload and multipart/form-data when a file (e.g. a profile image) is
 * included in the request.
 */

/**
 * True if any value in the payload is a File/Blob — signals that the
 * request needs to go out as multipart/form-data instead of JSON.
 */
export function hasFileField(data) {
  return Object.values(data ?? {}).some(
    (value) => value instanceof File || value instanceof Blob,
  );
}

/**
 * Converts a flat object into FormData. Skips undefined/null/"" values so
 * callers can pass a full form object without accidentally sending empty
 * strings that would overwrite existing values on the backend.
 */
export function toFormData(data) {
  const formData = new FormData();
  Object.entries(data ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });
  return formData;
}

export async function toRequestConfig(data) {
  if (hasFileField(data)) {
    const entries = await Promise.all(Object.entries(data).map(async ([key, value]) => [
      key,
      value instanceof Blob && value.type.startsWith("image/") ? await convertImageToWebP(value) : value,
    ]));
    return {
      data: toFormData(Object.fromEntries(entries)),
      config: {
        headers: {
          "Content-Type": undefined,
        },
      },
    };
  }
  return { data, config: {} };
}
