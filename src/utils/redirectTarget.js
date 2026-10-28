const STUDENT_SUBMISSION_PATH = /^\/student\/review-tracker\/[0-9a-f-]{36}\/?$/i;

export function getSafeStudentSubmissionTarget(target) {
  if (typeof target !== "string" || !target.startsWith("/" ) || target.startsWith("//")) return "";
  const path = target.split(/[?#]/, 1)[0];
  return STUDENT_SUBMISSION_PATH.test(path) ? path.replace(/\/$/, "") : "";
}

export function getLoginRedirectPath(target) {
  const safeTarget = getSafeStudentSubmissionTarget(target);
  return safeTarget ? `/login?next=${encodeURIComponent(safeTarget)}` : "/login";
}
