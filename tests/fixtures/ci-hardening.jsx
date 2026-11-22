import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddOrgModal from '../../src/modules/admin/dashboard/modals/AddOrgModal';
import EditOrgModal from '../../src/modules/admin/dashboard/modals/EditOrgModal';
import ConfigEntryModal from '../../src/modules/admin/registrationconfig/modals/ConfigEntryModal';
import DeleteConfirmModal from '../../src/modules/admin/registrationconfig/modals/DeleteConfirmModal';
import ChangePasswordSection from '../../src/components/ChangePasswordSection';
import LoginPage from '../../src/modules/LoginPage';
import GdriveCallback from '../../src/modules/staff/gdrive/GdriveCallback';
import StaffNotificationToasts from '../../src/components/StaffNotificationToasts';
import { ToastContext } from '../../src/components/toastContext';
import { notificationService } from '../../src/services/notificationService';
import { driveService } from '../../src/services/driveService';
import api from '../../src/lib/axios';
import '../../src/index.css';
import '../../src/workspace.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
const events = { toasts: [], reads: [], exchanges: [], blocked: [], deletes: 0 };
// Every unmocked API call fails locally; this fixture never reaches Railway.
api.defaults.adapter = async config => { events.blocked.push(config.url); throw new Error('Isolated fixture rejects unmocked API'); };
api.delete = async () => { events.deletes++; throw new Error('Fictional protected entry'); };
notificationService.getNotifications = async () => ({ results: [] });
notificationService.getStaffReviewSubmission = async id => { events.reads.push(id); return { submission_id: id }; };
notificationService.markAsRead = async id => { events.reads.push(id); };
driveService.completeAuth = async data => { events.exchanges.push(data); };
const showToast = (...args) => events.toasts.push(args);
const noop = () => {};
const root = createRoot(document.getElementById('root'));
const screens = { add: AddOrgModal, edit: EditOrgModal, config: ConfigEntryModal, delete: DeleteConfirmModal, password: ChangePasswordSection, login: LoginPage, drive: GdriveCallback, notifications: StaffNotificationToasts };
export function Location() { return <output id="route">{useLocation().pathname}</output>; }
window.hardening = {
  events,
  render(screen, props = {}, initialEntry = '/') {
    const Component = screens[screen];
    root.render(<QueryClientProvider client={queryClient}><MemoryRouter key={screen} initialEntries={[initialEntry]}><ToastContext.Provider value={{ showToast }}><Component key={screen} isOpen onClose={noop} onSave={noop} onSuccess={noop} {...props} /><Location /></ToastContext.Provider></MemoryRouter></QueryClientProvider>);
  },
  account(id) {
    localStorage.setItem('access_token', `fixture.${btoa(JSON.stringify({ user_id: id }))}.fixture`);
    queryClient.setQueryData(['current_user'], { user_id: id, role: 'staff' });
    queryClient.setQueryData(['notifications', id], { results: [] });
  },
  notify(id) {
    const user = queryClient.getQueryData(['current_user']);
    queryClient.setQueryData(['notifications', user.user_id], { results: [{ notification_id: id, submission_id: 'fictional-submission', type: 'review_reply_created', is_read: false, created_at: new Date(Date.now() + 1000).toISOString(), message: 'Fictional student reply' }] });
  },
};
