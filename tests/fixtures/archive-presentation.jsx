import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '../../src/lib/axios';
import SubmissionReviewDetails from '../../src/modules/staff/review-panel/components/SubmissionReviewDetails';
import { organizationAvatar, submitterAvatar } from './avatar-images';
import '../../src/index.css';
import '../../src/responsive.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const scenario = new URLSearchParams(location.search).get('scenario');
const archive = { archive_id: 'persisted-archive', drive_file_id: 'saved-drive-id', archived_at: '2026-11-19T04:00:00Z', file_name: 'Accomplishment_Report_With_A_Very_Long_Unbroken_Filename_And_All_Required_Information.pdf', root_folder_name: 'OSA', folder_path: ['2026–2027', 'Example Student Organization', 'Accomplishment Report'], upload_kind: 'report', drive_view_link: 'https://drive.google.com/file/d/fictional/view', archived_by_name: 'Sample Staff' };
const detail = { submission_id: 'example', title: 'Fictional activity request', status: scenario === 'approved' ? 'approved' : 'under_review', submitted_by: null, documents: scenario === 'both' || scenario === 'current' ? [{ document_id: 'current-document', file_name: 'Current attachment.pdf', file_url: '' }] : [], drive_archives: ['archived', 'both', 'linkless'].includes(scenario) ? [{ ...archive, ...(scenario === 'linkless' ? { drive_view_link: '' } : {}) }] : [], drive_view_link: scenario === 'pending' ? 'https://drive.google.com/arbitrary' : null };
if (scenario === 'preview') detail.documents = [{ document_id: 'preview-document', file_name: 'Preview attachment.png', mime_type: 'image/png', file_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jT1kAAAAASUVORK5CYII=' }];
Object.assign(detail, { org_image_url: organizationAvatar, submitted_by: 'fictional-student', submitted_by_email: 'student@example.test', submitted_by_name: 'Sample Student' });
if (scenario === 'broken-avatar') detail.org_image_url = 'data:image/png,broken';
if (scenario === 'missing-avatar') detail.org_image_url = null;
window.__fixtureRelease = {};
const hold = key => new Promise(resolve => { window.__fixtureRelease[key] = resolve; });
window.__fixtureReads = [];
window.__fixtureWrites = [];
apiClient.defaults.adapter = async config => {
  if (config.method !== 'get') { window.__fixtureWrites.push(config.url); throw new Error('Writes prohibited in presentation fixture'); }
  window.__fixtureReads.push(config.url);
  if (config.url.includes('/submissions/')) {
    if (scenario === 'staged') await hold('details');
    if (scenario === 'loading') await new Promise(resolve => setTimeout(resolve, 30000));
    if (scenario === 'failed') throw new Error('Fictional detail failure');
    return { data: detail, status: 200, headers: {}, config };
  }
  if (config.url.includes('/users/')) {
    if (scenario === 'staged') await hold('submitter');
    return { data: { results: [{ user_id: 'fictional-student', image_url: scenario === 'broken-avatar' ? 'data:image/png,broken' : scenario === 'missing-avatar' ? null : submitterAvatar }] }, status: 200, headers: {}, config };
  }
  const logs = config.url.includes('/review-logs/') && !config.url.includes('/replies/');
  if (logs && scenario === 'staged') await hold('history');
  return { data: logs ? { results: [{ log_id: 'review', old_status: 'pending', new_status: 'under_review', changed_at: '2026-11-19T04:00:00Z', changed_by_name: 'Sample Staff', remarks_text: 'Please review the attached activity details. Your earlier documents and conversation remain available.', reply_count: 0, can_reply: true }], count: 1 } : config.url.includes('/auth/me') ? { user_id: 'staff', role: 'staff' } : { results: [], count: 0 }, status: 200, headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main className="dashboard-main" style={{ padding: 24 }}><SubmissionReviewDetails submission={{ id: 'example', title: detail.title, submittedDate: 'Nov 19, 2026', documentType: 'Activity request', site: 'Example Student Organization', contactEmail: 'Sample Reviewer (sample.reviewer.with.a.long.address@example.test)' }} onBack={() => {}} /></main></QueryClientProvider>);
