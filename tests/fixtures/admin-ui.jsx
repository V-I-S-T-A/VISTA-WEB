// Full application routes with fictional local records. Never uses real accounts,
// credentials, delivery providers or the production backend.
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../src/App';
import api from '../../src/lib/axios';
import { ToastProvider } from '../../src/components/ToastProvider';
import { auditEvents } from './admin-audit-data.mjs';
import { organizationAvatar, submitterAvatar } from './avatar-images';
import '../../src/index.css';
import '../../src/responsive.css';
import '../../src/components/ResponsiveTables.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const params = new URLSearchParams(location.search);
const auditPhoto = params.get('auditPhoto');
const auditRecords = auditEvents.map(entry => entry.action === 'login' && auditPhoto ? { ...entry, performed_by_image: auditPhoto === 'photo' ? submitterAvatar : auditPhoto === 'broken' ? 'data:image/png,invalid' : null } : entry);
const route = params.get('route') || (/^\/(admin|student|staff)\//.test(location.pathname) ? location.pathname : '/admin/dashboard');
const role = route.startsWith('/student/') ? 'student' : route.startsWith('/staff/') ? 'staff' : 'admin';
const scenario = params.get('scenario') || params.get('fixtureScenario') || 'populated';
const admin = { user_id: 'sample-admin', first_name: 'Sample', last_name: 'Administrator', email: 'admin@example.test', role, image_url: submitterAvatar, is_active: true, must_change_password: false, birth_date: '2001-06-15', gender: 'prefer_not_to_say', phone_number: '' };
const organization = { org_id: 'sample-org', name: 'Campus Scholars', acronym: 'CS', description: 'Fictional campus organization', image_url: organizationAvatar, is_active: true, created_at: '2026-01-01T00:00:00Z' };
let users = Array.from({ length: 12 }, (_, i) => ({ user_id: `sample-user-${i}`, first_name: 'Sample', last_name: `Member ${i + 1}`, email: `member${i + 1}@example.test`, role: i === 1 ? 'staff' : 'student', is_active: i !== 2, org_id: organization.org_id, org_name: organization.name, image_url: submitterAvatar, must_change_password: i === 0, last_login: i === 0 ? null : '2026-11-20T00:00:00Z', created_at: '2026-01-01T00:00:00Z' }));
if (scenario === 'activity') users = Array.from({ length: 18 }, (_, i) => ({ ...users[0], user_id: `sample-user-${i}`, email: `member${i + 1}@example.test`, last_name: `Member ${i + 1}`, role: i < 6 ? 'staff' : 'student', is_active: i < 16, last_login: i < 12 || i === 16 ? null : '2026-11-20T00:00:00Z', must_change_password: i < 12 }));
const submission = { submission_id: 'sample-submission', title: 'Campus activity report', org_name: organization.name, doc_type_name: 'Activity Report', category_name: 'In-Campus', submitted_by: 'sample-user-0', submitted_by_name: 'Sample Member 1', submitted_by_email: 'member1@example.test', status: 'approved', submitted_at: '2026-11-20T05:30:00Z', documents: [] };
const config = { 'academic-years': [{ academic_year_id: 'sample-year', year: '2026–2027', is_active: true }], 'document-types': [{ doc_type_id: 'sample-type', name: 'Activity Report', code: 'AR', description: 'Fictional report', is_active: true }], categories: [{ category_id: 'sample-category', name: 'In-Campus', is_active: true }] };
const page = (items, count = items.length) => ({ results: items, count, current_page: 1, total_pages: Math.ceil(count / 10), next: null, previous: null });
const telemetry = { reads: [], writes: [], requests: [] };
window.adminUIFixture = telemetry;
window.WebSocket = class { static OPEN = 1; readyState = 1; send() {} close() {} };
localStorage.setItem('access_token', 'fictional-fixture-token');
api.defaults.adapter = async request => {
  const url = new URL(request.url, 'http://fixture.invalid');
  const endpoint = url.pathname;
  telemetry.requests.push({ url: endpoint, method: request.method, params: request.params });
  const fail = (status, message) => { const error = new Error(message); error.config = request; error.response = { status, data: { detail: message } }; throw error; };
  let data = page([]);
  if (request.method !== 'get') {
    telemetry.writes.push({ url: endpoint, method: request.method, data: request.data });
    if (scenario === 'pending') await new Promise(resolve => setTimeout(resolve, 800));
    if (scenario !== 'success') return fail(503, 'Fictional save failure. No external request was made.');
    const payload = typeof request.data === 'string' ? JSON.parse(request.data) : request.data;
    if (endpoint === '/users/' && request.method === 'post') { data = { ...payload, user_id: 'created-user', welcome_email_sent: true }; users = [data, ...users]; }
    else if (endpoint.startsWith('/users/') && request.method === 'patch') { users = users.map(u => endpoint.includes(u.user_id) ? { ...u, ...payload } : u); data = users.find(u => endpoint.includes(u.user_id)); }
    else if (endpoint.startsWith('/users/') && request.method === 'delete') { users = users.filter(u => !endpoint.includes(u.user_id)); data = {}; }
    else data = { detail: 'Fictional success', ...payload };
  } else {
    telemetry.reads.push(endpoint);
    if (endpoint === '/auth/me/') data = admin;
    else if (scenario === 'error') return fail(503, 'Fictional network error');
    else if (scenario === 'loading') await new Promise(resolve => setTimeout(resolve, 20000));
    else if (scenario === 'empty') data = endpoint.endsWith('/summary/') ? { total: 0, staff: 0, students: 0, inactive: 0 } : page([]);
    else if (endpoint === '/users/summary/') {
      if (params.has('failSummary')) return fail(503, 'Fictional unavailable summary');
      data = scenario === 'activity' ? { total: 18, staff: 6, students: 12, inactive: 2 } : { total: 36, staff: 4, students: 30, inactive: 2 };
    }
    else if (endpoint === '/users/') {
      const query = request.params?.search?.toLowerCase();
      const filtered = users.filter(u => (!query || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(query)) && (request.params?.is_active == null || String(u.is_active) === String(request.params.is_active)));
      const number = Number(request.params?.page || 1), requestedSize = Number(request.params?.page_size || 10), size = scenario === 'activity' ? Math.min(requestedSize, 8) : requestedSize;
      if (scenario === 'activity' && params.has('failSummaryPage') && requestedSize === 100 && number === 2) return fail(503, 'Fictional incomplete summary');
      data = { ...page(filtered.slice((number - 1) * size, number * size), filtered.length), current_page: number, total_pages: Math.ceil(filtered.length / size), next: scenario === 'activity' && number * size < filtered.length ? `/users/?page=${number + 1}` : null };
    }
    else if (endpoint.startsWith('/users/')) data = users.find(u => endpoint.includes(u.user_id)) || admin;
    else if (endpoint === '/organizations/') data = page([organization]);
    else if (endpoint.startsWith('/organizations/')) data = organization;
    else if (endpoint === '/audit-logs/') data = page(auditRecords.map(entry => Object.fromEntries(Object.entries(entry).filter(([key]) => !['changes', 'user_id'].includes(key)))));
    else if (endpoint.startsWith('/audit-logs/')) data = auditRecords.find(event => endpoint.includes(event.audit_id));
    else if (endpoint === '/submissions/statistics/') data = { total: 12, status_counts: { under_review: 4, approved: 5, rejected: 2, resubmission_required: 1 }, category_data: [], doc_type_data: [], monthly_trend: [], recent_activity: [] };
    else if (endpoint === '/submissions/sample-submission/') data = submission;
    else if (endpoint === '/submissions/') data = page([submission]);
    else if (endpoint.split('/')[1] in config) data = page(config[endpoint.split('/')[1]]);
    else if (endpoint === '/notifications/') data = { ...page([]), unread_count: 0 };
  }
  return { data, status: 200, statusText: 'OK', headers: {}, config: request };
};
history.replaceState({}, '', `${route}?fixtureScenario=${encodeURIComponent(scenario)}`);
const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
telemetry.recordLogin = async id => {
  users = users.map(user => user.user_id === id ? { ...user, last_login: '2026-11-23T04:00:00Z' } : user);
  await client.invalidateQueries({ queryKey: ['users'] });
};
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><ToastProvider><BrowserRouter><App /></BrowserRouter></ToastProvider></QueryClientProvider>);
