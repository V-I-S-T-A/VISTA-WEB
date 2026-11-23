// Fictional API responses only: never connect to Google or the deployed API.
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Gdrive from '../../src/modules/staff/Gdrive';
import { ToastProvider } from '../../src/components/ToastProvider';
import apiClient from '../../src/lib/axios';
import '../../src/index.css';
import '../../src/responsive.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const scenario = new URLSearchParams(location.search).get('scenario');
const healthy = scenario === 'healthy';
let connection = {
  connected: true, google_account_email: 'previous-drive@example.test',
  folder_id: healthy ? '' : 'saved-folder', folder_name: 'Saved Mobile Archive',
};
if (scenario === 'missing') connection = { connected: true };
if (scenario === 'disconnected') connection = { connected: false };
const telemetry = { calls: [], authFails: true };
window.driveReconnectFixture = telemetry;
localStorage.setItem('access_token', 'fictional-local-token');
apiClient.defaults.adapter = async config => {
  telemetry.calls.push({ method: config.method, url: config.url, params: config.params, data: config.data });
  let data = { results: [], count: 0, unread_count: 0 };
  if (config.url.includes('/auth/me')) data = { user_id: 'fixture-staff', first_name: 'Sample', last_name: 'Staff', role: 'staff', email: 'vista-login@example.test' };
  else if (config.url === '/drive/connection/') data = connection;
  else if (config.url === '/drive/folders/') {
    if (!healthy) throw Object.assign(new Error('Drive connection expired'), { response: { status: 403, data: { code: 'drive_reauth_required' } } });
    data = { folders: [{ id: 'existing-folder', name: 'Existing Archive' }] };
  } else if (config.url === '/drive/auth/start/') {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (telemetry.authFails) throw new Error('Fictional auth-start failure');
    data = { authorization_url: `${location.origin}/mock-google-auth?state=fictional` };
  } else if (config.url === '/drive/folders/select/' || config.url === '/drive/folders/create/') {
    const payload = JSON.parse(config.data);
    connection = { ...connection, folder_id: payload.folder_id || 'created-folder', folder_name: payload.folder_name };
    data = connection;
  } else if (config.method !== 'get') throw new Error('Unexpected write in Drive fixture');
  return { data, status: 200, headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><ToastProvider><BrowserRouter><Gdrive /></BrowserRouter></ToastProvider></QueryClientProvider>);
