import staffDashboard from '../assets/public/manual/staff-dashboard.webp';
import staffSubmissions from '../assets/public/manual/staff-submissions.webp';
import staffAddDocument from '../assets/public/manual/staff-add-document.webp';
import staffEntry from '../assets/public/manual/staff-document-entry.webp';
import staffExtracted from '../assets/public/manual/staff-extracted-details.webp';
import staffConfirm from '../assets/public/manual/staff-confirm-submission.webp';
import studentDashboard from '../assets/public/manual/student-dashboard.webp';
import studentTracker from '../assets/public/manual/student-review-tracker.webp';
import studentTicket from '../assets/public/manual/student-submission-ticket.webp';
import studentConversation from '../assets/public/manual/student-conversation.webp';
import studentNotifications from '../assets/public/manual/student-notifications.webp';

export const MOBILE_GUIDES = {
  staff: {
    label: 'Staff',
    description: 'Register a document, check its details, and follow the review.',
    steps: [
      {
        id: 'dashboard', title: 'Start at your dashboard', image: staffDashboard,
        alt: 'VISTA Mobile Staff Dashboard with four summary cards and recent submissions',
        intro: 'Use the dashboard to see what needs your attention.',
        instructions: ['Sign in with your existing Staff account.', 'Check the Total, Pending, Approved, and Rejected summary cards.', 'Open a recent submission, or continue to document entry to register a new one.'],
        tip: 'The bell at the top opens your notifications.',
      },
      {
        id: 'add-document', title: 'Scan or choose a document', image: staffAddDocument,
        alt: 'Add document sheet offering Scan with Camera and Choose File',
        intro: 'Bring the document into VISTA using the option that suits your file.',
        instructions: ['Tap the scan button in the bottom navigation to open Add document.', 'Choose Scan with Camera for a paper document, or Choose File for an existing file.', 'Follow the capture or file-picker prompts, then review the document before continuing.'],
        tip: 'Use clear, well-lit pages so the document is easy to read.',
      },
      {
        id: 'document-entry', title: 'Complete the entry details', image: staffEntry,
        alt: 'Document Entry form with academic year, submitter, optional attachment, and Submit button',
        intro: 'Check the registration fields before opening the submission preview.',
        instructions: ['Select the organization, document type, and category, and enter the document title.', 'Choose the academic year and the student who submitted the document.', 'Attach a document if needed and check whether the priority setting is appropriate.'],
        tip: 'An attachment is optional. Use the priority setting only when the submission needs escalation.',
      },
      {
        id: 'extracted-details', title: 'Verify the detected details', image: staffExtracted,
        alt: 'Document Entry showing detected form information and an attached file',
        intro: 'A scan can suggest information, but your review is still important.',
        instructions: ['Compare the detected document information with the original page.', 'Correct the title, organization, document type, academic year, or submitter when necessary.', 'Preview the attachment and replace it if the wrong file was selected. Tap Submit to open the ticket preview when the details are correct.'],
        tip: 'Detected information is a starting point. Verify it before confirming a submission.',
      },
      {
        id: 'confirm', title: 'Confirm the submission ticket', image: staffConfirm,
        alt: 'Submission ticket preview with attachment and Confirm and submit button',
        intro: 'This is your final check before creating the submission.',
        instructions: ['Read the ticket and check the organization, submitter, document title, and date.', 'Check the attached file, or go back if you need to edit anything.', 'Tap Confirm and submit once, and wait for the save to finish.'],
        tip: 'A successfully created submission starts On Process. A preview alone has not created a record.',
      },
      {
        id: 'submissions', title: 'Find and review submissions', image: staffSubmissions,
        alt: 'Staff Submission History with status tabs, search, Filter, and submission records',
        intro: 'Return to the submission list to continue the review workflow.',
        instructions: ['Open Submission History and use the status tabs, search, or Filter to find a record.', 'Tap a submission to read its ticket, inspect permitted attachments, and review the conversation.', 'Use the status action to record your decision and remarks, or Reply to follow up on a conversation.'],
        tip: 'Check the saved history after updating a record. Digital attachments remain restricted to authorized Staff.',
      },
    ],
  },
  student: {
    label: 'Student',
    description: 'Find your organization’s submissions, read updates, and reply to Staff.',
    steps: [
      {
        id: 'dashboard', title: 'Check your dashboard', image: studentDashboard,
        alt: 'Student Organization Dashboard with four summary cards and recent submissions',
        intro: 'Your dashboard gives you a quick view of submission progress.',
        instructions: ['Sign in with your existing Student account.', 'Check the Total, Pending, Approved, and Rejected summary cards.', 'Tap a recent submission to open its details, or open the Review Tracker for more records.'],
        tip: 'You only see the submissions available to your account and organization.',
      },
      {
        id: 'tracker', title: 'Find a submission', image: studentTracker,
        alt: 'Student Review Tracker with search, status tabs, Filter, and submission cards',
        intro: 'Use the Review Tracker to find the record you want to follow.',
        instructions: ['Open Review Tracker from the bottom navigation.', 'Use search to find a submission, or narrow the list with a status tab or Filter.', 'Tap the matching submission to open Track Details.'],
        tip: 'A priority marker identifies an escalated submission; the status tells you its review progress.',
      },
      {
        id: 'ticket', title: 'Read the submission ticket', image: studentTicket,
        alt: 'Track Details displaying the purple submission ticket, status, organization, and submitter',
        intro: 'The ticket brings the key submission details into one place.',
        instructions: ['Check the document title, organization, submission date, and original submitter.', 'Read the current status to see where the submission stands.', 'Scroll down to the conversation for the review history and Staff remarks.'],
        tip: 'Students track physical submissions here. Digital documents are restricted to OSA Staff.',
      },
      {
        id: 'conversation', title: 'Read remarks and reply', image: studentConversation,
        alt: 'Submission conversation showing Staff feedback, nested replies, and the reply composer',
        intro: 'Keep your follow-up connected to the relevant Staff feedback.',
        instructions: ['Read the latest review update and any remarks in the conversation.', 'If you are the original submitter and Reply is available, tap it on the message you want to answer.', 'Write your response, check the reply target, and send it.'],
        tip: 'Other organization members have view-only access. Reply availability follows the submission’s permissions.',
      },
      {
        id: 'notifications', title: 'Follow your notifications', image: studentNotifications,
        alt: 'Notifications sheet with All, Unread, and Priority filters and submission updates',
        intro: 'Use notifications to return to records that have new updates.',
        instructions: ['Tap the bell at the top of the screen to open Notifications.', 'Use All, Unread, or Priority to choose which updates to view.', 'Tap an update to open its submission, then read the latest status and remarks.'],
        tip: 'To receive Android push alerts, allow notifications on your device. You can still check updates inside VISTA.',
      },
    ],
  },
};
