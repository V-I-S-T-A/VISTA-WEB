// Full application router with an isolated, read-only fictional API adapter.
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../src/App';
import ProcessAttachmentsModal from '../../src/modules/staff/review-panel/components/modals/ProcessAttachmentsModal';
import apiClient from '../../src/lib/axios';
import { ToastProvider } from '../../src/components/ToastProvider';
import { organizationAvatar, submitterAvatar } from './avatar-images';
import '../../src/index.css';
import '../../src/responsive.css';
import '../../src/components/ResponsiveTables.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const params = new URLSearchParams(location.search);
const id = '194f7b2a-ec37-4d7b-8a84-c99e8ac14f2a';
const secondId = '294f7b2a-ec37-4d7b-8a84-c99e8ac14f2a';
const role = params.get('role') || 'staff';
const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jT1kAAAAASUVORK5CYII=';
const documents = [{ document_id: 'new-file', file_name: 'Updated attachment.png', file_url: imageUrl, mime_type: 'image/png', is_current: true }];
const detail = { submission_id: id, title: 'Persisted activity request', status: 'under_review', submitted_at: '2026-11-20T08:00:00Z', org_name: 'Example Student Organization', org_image_url: organizationAvatar, submitted_by: 'fictional-student', submitted_by_name: 'Sample Student', submitted_by_email: 'student@example.test', category_name: 'In-Campus', doc_type_name: 'Activity request', documents, drive_archives: [] };
const logs = [
  { log_id: 'new-review', submission_id: id, new_status: 'under_review', old_status: 'under_review', attachment_change: { action: 'replaced', previous_files: ['Old attachment.pdf'], new_files: ['Updated attachment.png'] } },
  { log_id: 'old-review', submission_id: id, new_status: 'under_review', old_status: 'under_review', attachment_change: { action: 'added', previous_files: [], new_files: ['Old attachment.pdf'] } },
].map(log => ({ ...log, changed_by_name: 'Sample Staff', changed_at: '2026-11-20T08:00:00Z', remarks_text: '', reply_count: 0, can_reply: false }));
const telemetry = { reads: [], writes: [], id, secondId, boot: crypto.randomUUID() };
window.staffRouteFixture = telemetry;
localStorage.setItem('access_token', 'fictional-local-token');
if (params.has('legacy')) history.replaceState({ usr: { submission: { id, title: 'Stale route title' } }, key: 'fixture', idx: 0 }, '', location.href);

apiClient.defaults.adapter = async config => {
  if (config.method !== 'get') { telemetry.writes.push(config.url); throw new Error('Writes are prohibited in the route fixture'); }
  telemetry.reads.push(config.url);
  let data = { results: [], count: 0, unread_count: 0 };
  if (config.url.includes('/auth/me')) data = { user_id: 'fixture-staff', first_name: 'Sample', last_name: 'Reviewer', image_url: submitterAvatar, role, must_change_password: false };
  else if (config.url.includes('/users/')) data = { results: [{ user_id: 'fictional-student', image_url: submitterAvatar }] };
  else if (config.url.includes('/review-logs/')) data = { results: logs, count: logs.length };
  else if (config.url.includes('/submissions/')) {
    if (config.url.includes(id) || config.url.includes(secondId)) {
      if (params.has('denied')) throw Object.assign(new Error('Fictional denied detail'), { response: { status: 403 } });
      if (params.has('missing')) throw Object.assign(new Error('Fictional missing detail'), { response: { status: 404 } });
      data = config.url.includes(secondId) ? { ...detail, submission_id: secondId, title: 'Second persisted request' } : detail;
    } else data = { results: [detail, { ...detail, submission_id: secondId, title: 'Second persisted request' }], count: 2, total_pages: 1, current_page: 1 };
  }
  return { data, status: 200, headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(params.has('modal') ? (
  <ProcessAttachmentsModal
    isOpen
    onClose={() => { telemetry.closed = true; }}
    onConfirm={() => { telemetry.writes.push('unexpected-confirm'); return false; }}
    submission={{ id }}
    submissionDetails={{ ...detail, documents: [...documents, { document_id: 'unavailable-file', file_name: 'Unavailable attachment.pdf' }] }}
  />
) : <QueryClientProvider client={client}><ToastProvider><BrowserRouter><App /></BrowserRouter></ToastProvider></QueryClientProvider>);
