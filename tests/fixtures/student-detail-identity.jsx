// Isolated, fictional API adapter: no application request reaches a real service.
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '../../src/lib/axios';
import { authService } from '../../src/services/authService';
import Sidebar from '../../src/components/Sidebar';
import { ToastProvider } from '../../src/components/ToastProvider';
import ReviewTrackerDetails from '../../src/modules/student/reviewtracker/ReviewTrackerDetails';
import StaffProfileForm from '../../src/modules/staff/profile/components/Profileform';
import StudentProfileForm from '../../src/modules/student/profile/components/Profileform';
import AdminProfileForm from '../../src/modules/admin/profile/components/Profileform';
import { organizationAvatar, submitterAvatar } from './avatar-images';
import '../../src/index.css';
import '../../src/responsive.css';
import '../../src/components/ResponsiveTables.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const params = new URLSearchParams(location.search);
const profileMode = params.has('profile');
const role = params.get('role') || 'student';
const organizationViewer = params.has('viewer');
const forbidden = params.has('forbidden');
const accountKey = `vista-detail-identity-${role}`;
const replyKey = 'vista-detail-replies';
const initialUser = { user_id: `fixture-${role}`, first_name: 'Sample', last_name: role === 'staff' ? 'Staff' : role === 'admin' ? 'Admin' : 'Student', role, org_id: 'fictional-org', email: 'sample@example.test', phone_number: '', birth_date: null, gender: '', must_change_password: false };
let user = JSON.parse(localStorage.getItem(accountKey) || 'null') || initialUser;
let replies = JSON.parse(localStorage.getItem(replyKey) || 'null') || [
  { reply_id: 'first', author_name: 'Sample Staff', message: 'Please clarify the date.', created_at: '2026-11-20T08:00:00Z' },
  { reply_id: 'second', author_name: 'Sample Student', message: 'The event is on Friday.', parent_reply: 'first', reply_to_name: 'Sample Staff', created_at: '2026-11-20T09:00:00Z' },
];
localStorage.setItem('access_token', 'fictional-local-token');
user.image_url = submitterAvatar;
const telemetry = { reads: [], writes: [], freshProfile: () => authService.me() };
window.studentIdentityFixture = telemetry;
const detail = {
  submission_id: 'abcdef12-fictional', title: 'Fictional activity request', status: 'under_review',
  submitted_by: organizationViewer ? 'another-student' : 'fixture-student',
  submitted_by_name: 'Sample Student', submitted_by_email: 'student@example.test',
  org_name: 'Example Student Organization', category_name: 'In-Campus',
  org_image_url: organizationAvatar,
  doc_type_name: 'Student Activity Request Form (SARF)', submitted_at: '2026-11-20T08:00:00Z',
  // Deliberately present to verify the Student renderer never exposes these.
  documents: [{ file_name: 'private-file.pdf', file_url: 'https://example.test/staff-only-document' }],
  drive_archives: [{ drive_view_link: 'https://example.test/staff-only-archive' }],
};
apiClient.defaults.adapter = async config => {
  const isGet = config.method === 'get';
  (isGet ? telemetry.reads : telemetry.writes).push({ url: config.url, data: config.data });
  const response = data => ({ data, status: 200, headers: {}, config });
  if (config.url.includes('/auth/me')) {
    if (!isGet) {
      if (config.method !== 'patch') throw new Error('Only fictional profile PATCH allowed');
      user = { ...user, ...JSON.parse(config.data) };
      localStorage.setItem(accountKey, JSON.stringify(user));
    }
    return response({ ...user });
  }
  if (config.url.includes('/submissions/')) {
    if (!isGet) throw new Error('Submission writes prohibited');
    if (params.has('loading')) await new Promise(resolve => { telemetry.releaseDetails = resolve; });
    if (forbidden) throw Object.assign(new Error('Fictional denied access'), { response: { status: 403 } });
    return response(detail);
  }
  if (config.url.includes('/replies/')) {
    if (!isGet) {
      if (organizationViewer || forbidden || role !== 'student') throw new Error('Read-only viewer cannot reply');
      const payload = JSON.parse(config.data);
      let saved = replies.find(reply => reply.client_request_id === payload.client_request_id);
      if (!saved) {
        saved = { ...payload, reply_id: crypto.randomUUID(), author_name: 'Sample Student', created_at: new Date().toISOString(), reply_to_name: replies.find(reply => reply.reply_id === payload.parent_reply)?.author_name };
        replies = [...replies, saved];
        localStorage.setItem(replyKey, JSON.stringify(replies));
      }
      return response(saved);
    }
    return response({ results: [...replies], count: replies.length, current_page: 1, total_pages: 1, next: null });
  }
  if (!isGet) throw new Error('Unexpected write in isolated fixture');
  if (config.url.includes('/review-logs/')) return response({ results: [{ log_id: 'fictional-review', submission_id: detail.submission_id, old_status: 'pending', new_status: 'under_review', remarks_text: 'Please verify the activity details.', changed_by_name: 'Sample Staff', changed_at: '2026-11-20T08:00:00Z', reply_count: replies.length, can_reply: !organizationViewer }], count: 1 });
  return response({ results: [], count: 0, unread_count: 0 });
};

const profileForm = role === 'staff' ? <StaffProfileForm /> : role === 'admin' ? <AdminProfileForm /> : <StudentProfileForm />;
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={client}><ToastProvider><MemoryRouter initialEntries={[profileMode ? `/${role}/profile` : '/student/review-tracker/abcdef12-fictional']}>
    <Routes>
      <Route path="/student/review-tracker/:id" element={<ReviewTrackerDetails />} />
      <Route path="/:role/profile" element={<div className="flex min-h-screen"><Sidebar role={role} /><main className="dashboard-main flex-1" style={{ padding: 24 }}>{profileForm}</main></div>} />
    </Routes>
  </MemoryRouter></ToastProvider></QueryClientProvider>,
);
