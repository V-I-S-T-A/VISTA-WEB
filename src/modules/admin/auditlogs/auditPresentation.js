import { getSubmissionPresentation } from '../../../config/submissionPresentation.js';

const TABLES = { tbl_Users: 'User account', tbl_Organizations: 'Organization', tbl_Submissions: 'Submission', tbl_ReviewLogs: 'Review log', tbl_AcademicYears: 'Academic year', tbl_DocumentTypes: 'Document type', tbl_Categories: 'Category' };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
const text = value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
const first = (...values) => values.map(text).find(Boolean) || '';
export const auditFieldLabel = key => ({ is_active: 'Account active', org_id: 'Organization ID', user_id: 'User ID', submission_id: 'Submission ID', record_id: 'Record ID', old_status: 'Previous status', new_status: 'New status' })[key] || key.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase());

export function parseAuditChanges(value) {
  if (typeof value !== 'string') return { data: object(value) || {}, invalid: value != null && !object(value) };
  try { const parsed = JSON.parse(value); return { data: object(parsed) || {}, invalid: !object(parsed) }; }
  catch { return { data: {}, invalid: true }; }
}

export function auditValue(value, key = '') {
  if (value === undefined) return 'Not recorded';
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key.endsWith('status') && typeof value === 'string') return getSubmissionPresentation(value).label || value;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

// References and machine metadata remain available in Technical details.
export const isAuditTechnicalField = key => /(^id$|_id$|_ids$|_at$|^password$|password|token|secret|credentials|authorization|api_key|private_key)/i.test(key);

export function readableAuditFields(value) {
  if (Array.isArray(value)) return value.map(readableAuditFields);
  if (!object(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !isAuditTechnicalField(key)).map(([key, entry]) => [key, readableAuditFields(entry)]));
}

export function sanitizeAuditData(value) {
  if (Array.isArray(value)) return value.map(sanitizeAuditData);
  if (!object(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, /(?:^|_)(password|hashed_password|password_hash|token|secret|api_key|private_key|credentials|authorization)$/i.test(key) && typeof entry !== 'boolean' ? '[Redacted sensitive value]' : key === 'changes' && typeof entry === 'string' && !parseAuditChanges(entry).invalid ? sanitizeAuditData(parseAuditChanges(entry).data) : sanitizeAuditData(entry)]));
}

// The API owns identities and history. This mapper only describes evidence that
// is present; the actor is the affected account only for login/logout events.
export function presentAuditEvent(log) {
  const { data: changes, invalid } = parseAuditChanges(log.changes);
  const action = text(log.action).toLowerCase().replaceAll(' ', '_');
  const isAuth = ['login', 'logout'].includes(action);
  const type = TABLES[log.table_name] || 'Record';
  const before = object(log.old_data) || object(changes.old_data) || object(changes.old) || object(changes.deleted);
  const after = object(log.new_data) || object(changes.new_data) || object(changes.new);
  const directSnapshot = !before && !after && !isAuth && ['create', 'delete'].includes(action) && Object.keys(changes).length ? changes : null;
  const oldData = before || (action === 'delete' ? directSnapshot : null);
  const newData = after || (action !== 'delete' ? directSnapshot : null);
  const snapshot = { ...oldData, ...newData };
  const fullName = [text(snapshot.first_name), text(snapshot.last_name)].filter(Boolean).join(' ');
  const actor = first(log.performed_by) || 'Actor not recorded';
  const entityId = first(log.record_id, log.object_id, changes.record_id, changes.submission_id, snapshot.submission_id, snapshot.user_id, snapshot.org_id, snapshot.academic_year_id, snapshot.doc_type_id, snapshot.category_id, snapshot.id, isAuth ? log.user_id : '');
  const accountKnown = actor !== 'Actor not recorded' && !(actor === 'System' && !log.user_id);
  const entityName = isAuth ? accountKnown ? actor : 'Account identity not recorded' : first(snapshot.title, snapshot.name, fullName, snapshot.email, snapshot.year, log.object_repr) || `${type} identity not recorded`;
  const entityLabel = isAuth ? 'Account involved' : log.table_name === 'tbl_Submissions' ? 'Affected submission' : log.table_name === 'tbl_Users' ? 'Affected account' : 'Affected record';
  const entityImageUrl = isAuth ? first(log.performed_by_image) : type === 'User account' ? first(snapshot.image_url) : '';
  const manualArchive = action === 'create' && snapshot.action === 'manual_drive_archive' && (snapshot.status === 'success' || (!snapshot.status && snapshot.drive_file_id));
  const title = manualArchive ? 'File uploaded successfully to Google Drive' : ({ login: 'Signed in', logout: 'Signed out', create: `${type} created`, update: `${type} updated`, delete: `${type} deleted`, status_change: `${type} status changed` })[action] || (text(log.action).replaceAll('_', ' ') || 'Unspecified event');
  const timestamp = log.performed_at ? new Date(log.performed_at) : null;
  const dateTime = timestamp && !Number.isNaN(timestamp.getTime()) ? new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(timestamp) + ' PHT' : 'Time not recorded';
  const fieldChanges = action === 'status_change' && ('old_status' in changes || 'new_status' in changes)
    ? [{ key: 'status', before: changes.old_status, after: changes.new_status }]
    : Object.keys({ ...oldData, ...newData }).filter(key => JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])).map(key => ({ key, before: oldData?.[key], after: newData?.[key] }));
  return { action, isAuth, actor, title, type, entityLabel, entityId, entityName, entityImageUrl, entityEmail: isAuth ? first(log.performed_by_email) : first(snapshot.email), dateTime, before: oldData, after: newData, fieldChanges, changes, invalid, summary: isAuth ? `${actor} ${action === 'login' ? 'signed in to' : 'signed out of'} VISTA.` : `${title}: ${entityName}.` };
}
