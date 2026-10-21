const FIELD_LABELS = {
  email: "Email address",
  first_name: "First name",
  last_name: "Last name",
  org_id: "Organization",
  doc_type_id: "Document type",
  category_id: "Category",
  academic_year_id: "Academic year",
  submitted_by: "Submitted by",
  old_password: "Current password",
  new_password: "New password",
  code: "Verification code",
  image: "Photo",
};
const MESSAGE_KEYS = new Set(["detail", "message", "error", "errors", "non_field_errors"]);
const TECHNICAL_MESSAGE = /request failed with status code|network error|timeout of \d+ms|<!doctype|<html|traceback|axioserror/i;

function readableText(value) {
  return typeof value === "string" && value.trim() && !TECHNICAL_MESSAGE.test(value)
    ? value.trim()
    : "";
}

function validationMessages(value, path = [], depth = 0) {
  if (depth > 5) return [];
  const text = readableText(value);
  if (text) return [path.length ? `${path.join(" / ")}: ${text}` : text];
  if (Array.isArray(value)) {
    return value.flatMap((item) => validationMessages(item, path, depth + 1));
  }
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, item]) => {
    if (["status", "status_code", "success"].includes(key) || (key === "code" && !Array.isArray(item))) return [];
    const label = FIELD_LABELS[key] || key.replace(/_id$/, "").replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase());
    return validationMessages(item, MESSAGE_KEYS.has(key) ? path : [...path, label], depth + 1);
  });
}

export function getApiErrorMessage(error, fallback = "We couldn't complete this action. Please try again.") {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to perform this action. Contact your administrator if you need access.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again later.";
  if (status >= 400 && status < 500) {
    const messages = validationMessages(error.response.data);
    if (messages.length) return [...new Set(messages)].join(" ");
    if (status === 400 || status === 422) return `${fallback} Check the entered details and required fields.`;
    if (status === 404) return "This record could not be found. It may have been removed. Refresh the page and try again.";
    if (status === 409) return "This action conflicts with an existing record. Refresh the page and check your changes.";
    if (status === 413) return "The selected file is too large. Choose a smaller file and try again.";
    if (status === 429) return "Too many requests. Please wait a moment before trying again.";
    return fallback;
  }
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "The server took too long to respond. Check whether your action completed before trying again.";
  }
  if (error?.isAxiosError || error?.request) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return readableText(error?.message) || fallback;
}
