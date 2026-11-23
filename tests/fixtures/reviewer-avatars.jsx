import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SubmissionReviewDetails from '../../src/modules/staff/review-panel/components/SubmissionReviewDetails';
import DetailsStatusHistory from '../../src/modules/student/reviewtracker/components/DetailsStatusHistory';
import DetailsStaffRemarks from '../../src/modules/student/reviewtracker/components/DetailsStaffRemarks';
import DriveArchiveCard from '../../src/modules/staff/review-panel/components/DriveArchiveCard';
import ReviewReplyThread from '../../src/modules/shared/ReviewReplyThread';
import apiClient from '../../src/lib/axios';
import defaultAvatar from '../../src/assets/shared/default_user.webp';
import { submitterAvatar } from './avatar-images';
import '../../src/index.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

// Isolated fictional API only. No user lookup or production requests allowed.
const mode = new URLSearchParams(location.search).get('avatar');
const image = mode === 'photo' ? submitterAvatar : mode === 'broken' ? 'data:image/png,invalid' : null;
const log = { log_id: 'review', changed_by: 'reviewer', changed_by_name: 'Sample Reviewer', changed_by_image_url: image, old_status: 'under_review', new_status: 'approved', changed_at: '2026-11-23T01:00:00Z', remarks_text: 'Saved review remarks', reply_count: 1, can_reply: false };
const telemetry = { reads: [], writes: [], expectedPhoto: submitterAvatar, defaultAvatar };
window.reviewerAvatars = telemetry;
apiClient.defaults.adapter = async config => {
  if (config.method !== 'get') { telemetry.writes.push(config.url); throw new Error('No writes permitted'); }
  telemetry.reads.push(config.url);
  let data = { results: [], count: 0 };
  if (config.url.includes('/submissions/')) data = { submission_id: 'sample', title: 'Sample request', status: 'approved', documents: [], drive_archives: [] };
  else if (config.url.includes('/replies/')) data = { results: [{ reply_id: 'reply', author_name: 'Sample Reviewer', author_image_url: image, message: 'Saved reply', created_at: log.changed_at }], count: 1, current_page: 1, total_pages: 1 };
  else if (config.url.includes('/review-logs/')) data = { results: [log], count: 1 };
  return { data, status: 200, headers: {}, config };
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{ padding: 24 }}>
  <div data-avatar-review="staff"><SubmissionReviewDetails submission={{ id: 'sample', title: 'Sample request' }} onBack={() => {}} /></div>
  <div data-avatar-review="student"><DetailsStatusHistory submissionId="sample" /></div>
  <div data-avatar-review="remarks"><DetailsStaffRemarks submissionId="sample" /></div>
  <div data-avatar-review="drive"><DriveArchiveCard handledBy={log} /></div>
  <div data-avatar-review="reply"><ReviewReplyThread log={log} /></div>
</main></QueryClientProvider>);
