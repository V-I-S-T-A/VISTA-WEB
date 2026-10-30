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

export function getPostLoginTarget(response, next) {
  const role = response?.user?.role;
  const first = typeof response?.is_first_login === 'boolean'
    ? response.is_first_login : response?.user?.must_change_password === true;
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'staff') return first ? '/staff/profile' : '/staff/dashboard';
  if (role === 'student') return getSafeStudentSubmissionTarget(next) || (first ? '/student/profile' : '/student/dashboard');
  return '/login';
}
