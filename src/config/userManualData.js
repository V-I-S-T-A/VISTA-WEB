import staffDashboard from "../assets/public/manual/staff-dashboard.webp";
import staffAddDocument from "../assets/public/manual/staff-add-document.webp";
import staffExtracted from "../assets/public/manual/staff-extracted-details.webp";
import staffConfirm from "../assets/public/manual/staff-confirm-submission.webp";
import staffSubmissions from "../assets/public/manual/staff-submissions.webp";
import studentDashboard from "../assets/public/manual/student-dashboard.webp";
import studentTracker from "../assets/public/manual/student-review-tracker.webp";
import studentConversation from "../assets/public/manual/student-conversation.webp";
import webStaffDashboard from "../assets/public/user-manual/web-staff-dashboard.png";
import webStaffRegistration from "../assets/public/user-manual/web-staff-registration.png";
import webStaffAnalysisResults from "../assets/public/user-manual/web-staff-analysis-results.png";
import webStaffReviewPanel from "../assets/public/user-manual/web-staff-review-panel.png";
import webStaffDecisionDialog from "../assets/public/user-manual/web-staff-decision-dialog.png";
import webStaffGdrive from "../assets/public/user-manual/web-staff-gdrive.png";
import mobileSignin from "../assets/public/user-manual/mobile-signin.png";
import mobileStaffGdrive from "../assets/public/user-manual/mobile-staff-gdrive.png";
import webStudentDashboard from "../assets/public/user-manual/web-student-dashboard.png";
import webStudentTracker from "../assets/public/user-manual/web-student-tracker.png";
import webStudentHistory from "../assets/public/user-manual/web-student-history.png";
import webStudentReply from "../assets/public/user-manual/web-student-reply.png";
import webAdminDashboard from "../assets/public/user-manual/web-admin-dashboard.png";
import webAdminAddUser from "../assets/public/user-manual/web-admin-add-user.png";
import webAdminEditUser from "../assets/public/user-manual/web-admin-edit-user.png";
import webAdminRegConfig from "../assets/public/user-manual/web-admin-reg-config.png";
import webAdminAuditLogs from "../assets/public/user-manual/web-admin-audit-logs.png";
import mobilePushBanner from "../assets/public/user-manual/mobile-push-banner.png";
import mobilePushShade from "../assets/public/user-manual/mobile-push-shade.jpg";

export const MANUAL_ROLE_ORDER = ["student-org", "osa-staff", "administrator"];

export const USER_MANUAL_ROLES = {
  "osa-staff": {
    id: "osa-staff",
    label: "OSA Staff",
    shortLabel: "OSA Staff",
    partLabel: "OSA Staff Guide",
    description: "Register incoming event documents, review submissions, record official decisions, and archive approved files to Google Drive on Web and Mobile.",
    icon: "briefcase",
    modules: [
      {
        id: "01-web-sign-in",
        title: "Web Portal: Sign In & Workspace",
        platform: "Web Portal",
        icon: "log-in",
        overview: "Access the VISTA web portal provided by the Office of Student Affairs (OSA) and locate the Registration and Review Panel tools.",
        steps: [
          {
            number: 1,
            title: "Sign in to the staff workspace",
            image: webStaffDashboard,
            screenLabel: "Web Portal · Staff Dashboard",
            screenAlt: "VISTA Web Portal Staff Dashboard with sidebar navigation for Dashboard, Registration, Review Panel, Audit Logs, and GDrive Sync",
            instructions: [
              "Open the VISTA web portal provided by the Office of Student Affairs (OSA).",
              "Enter your registered staff email and password, then select SIGN IN.",
              "Check the sidebar for Registration and Review Panel.",
            ],
            callout: {
              type: "note",
              label: "Workspace Navigation",
              text: "Use Registration for a new document and Review Panel for a document that already has a tracking record.",
            },
          },
        ],
      },
      {
        id: "02-web-register-document",
        title: "Web Portal: Register a Document",
        platform: "Web Portal",
        icon: "file-plus",
        overview: "Register new incoming documents using OCR suggestions or manual entry, verify extracted details, and create the tracking record.",
        steps: [
          {
            number: 1,
            title: "Attach or enter document details",
            image: webStaffRegistration,
            screenLabel: "Web Portal · Registration — Document Entry",
            screenAlt: "Document Entry form with Organization, Submitted By, Academic Year, Document Type, Category, Document Title, and Secure File Upload",
            instructions: [
              "Select Registration. If you have a scanned copy, attach it and wait for optical character recognition (OCR) to suggest values. You can also enter the details manually.",
              "Select the Organization first, then choose the person in Submitted By.",
              "Enter the Academic Year, Document Type, Category, and Document Title. Compare every suggested value with the original document.",
            ],
            callout: {
              type: "tip",
              label: "Tip",
              text: "Always select the organization first so the Submitted By field populates with that organization's representatives.",
            },
          },
          {
            number: 2,
            title: "Final review and create tracking record",
            image: webStaffAnalysisResults,
            screenLabel: "Web Portal · Registration — Review Extracted Details",
            screenAlt: "Review Extracted Details summary with Redo and Approve actions",
            instructions: [
              "Select Next: Final Review.",
              "On Review Extracted Details, verify the details and the attached filename. Select Redo if anything needs correction.",
              "Select Approve to create the tracking record. Find the new entry on the dashboard.",
            ],
            callout: {
              type: "warning",
              label: "Upload Warning",
              text: "If an Upload Warning says the record was created, check the existing entry before registering it again. The attachment may still need attention. Staff record the decision about the document itself later in Review Panel.",
            },
          },
        ],
      },
      {
        id: "03-web-review-decision",
        title: "Web Portal: Review & Record Decision",
        platform: "Web Portal",
        icon: "clipboard-check",
        overview: "Open submissions in Review Panel, evaluate attachments, record official decisions with remarks, and confirm Drive delivery.",
        steps: [
          {
            number: 1,
            title: "Inspect submission and choose a decision",
            image: webStaffReviewPanel,
            screenLabel: "Web Portal · Review Panel & Decision Panel",
            screenAlt: "Review Panel showing Submission Details, Attached Files, Status History, and Decision Panel",
            instructions: [
              "Open Review Panel and find the submission. Open its details and check the title, organization, current status, and available attachments.",
              "In Decision Panel, choose On Process to continue reviewing, Approved to accept the document, or Returned to send it back.",
              "In Reviewer Remarks, explain the decision and state what the organization should do next.",
            ],
            callout: {
              type: "note",
              label: "Returned Submissions",
              text: "A previously returned entry requires an approved document before it can be marked Approved.",
            },
          },
          {
            number: 2,
            title: "Submit official decision and verify",
            image: webStaffDecisionDialog,
            screenLabel: "Web Portal · Review Panel — Confirmation & Status History",
            screenAlt: "Official decision confirmation dialog and updated Status History",
            instructions: [
              "Select SUBMIT OFFICIAL DECISION.",
              "For On Process, review the attachment options. For Approved, review the final files and Drive destination in the confirmation window.",
              "For Returned, read the warning before confirming. Type RETURNED and select Return Submission.",
              "Reopen the entry and check its status and remarks. If files were queued for Drive, check the archive status separately to confirm delivery.",
            ],
            callout: {
              type: "warning",
              label: "Returning a Document",
              text: "Returning the document removes its active attachment links and preserves its review history. Always read the warning before confirming.",
            },
          },
        ],
      },
      {
        id: "04-web-gdrive-sync",
        title: "Web Portal: Google Drive Archive",
        platform: "Web Portal",
        icon: "cloud",
        overview: "Authorize the institutional Google account in GDrive Sync and select the destination folder for approved document archiving.",
        steps: [
          {
            number: 1,
            title: "Set the Google Drive archive folder",
            image: webStaffGdrive,
            screenLabel: "Web Portal · Google Drive Sync",
            screenAlt: "Google Drive Sync screen with Sign in with Google and destination folder connection card",
            instructions: [
              "Open GDrive Sync in the sidebar.",
              "Select Sign in with Google and authorize the institutional account used for archiving.",
              "Select the destination folder and verify its name on the connection screen.",
            ],
            callout: {
              type: "tip",
              label: "Verify Archiving",
              text: "When checking an approved document, open its archive details in Review Panel to confirm delivery.",
            },
          },
        ],
      },
      {
        id: "05-mobile-staff-signin",
        title: "Mobile App: Install & Sign In",
        platform: "Mobile App",
        icon: "smartphone",
        overview: "Download and install the VISTA Android APK, complete onboarding, and sign in with your registered staff account.",
        steps: [
          {
            number: 1,
            title: "Install VISTA and sign in",
            image: mobileSignin,
            screenLabel: "Mobile App · Staff Sign In",
            screenAlt: "VISTA Mobile sign-in screen with Email address, Password, Forgot password?, and Sign in button",
            instructions: [
              "On an Android phone, open the VISTA website’s app download page and tap Download for Android. Open the downloaded APK and follow the installation prompts.",
              "Open VISTA, continue through the introductory screens, and tap Sign in after entering your registered staff email and password.",
              "If you have forgotten your password, tap Forgot password? on the sign-in screen. Enter your registered email, tap Send code, and use the six-digit email code to set a new password.",
            ],
            callout: {
              type: "note",
              label: "Existing Account",
              text: "Sign in using your existing registered OSA staff email and password.",
            },
          },
        ],
      },
      {
        number: 6,
        id: "06-mobile-scan-register",
        title: "Mobile App: Scan & Register",
        platform: "Mobile App",
        icon: "scan-line",
        overview: "Scan paper originals or choose saved files in Document Entry, verify OCR-suggested values, and confirm submission.",
        steps: [
          {
            number: 1,
            title: "Scan or choose a document",
            image: staffAddDocument,
            screenLabel: "Mobile App · Document Entry — Add Document",
            screenAlt: "VISTA Mobile Add Document sheet with Scan with Camera and Choose File options",
            instructions: [
              "Open Document Entry with the pencil icon in the bottom navigation bar and tap Attach Document (Optional).",
              "Choose Scan with Camera for a paper original or Choose File (PDF/Image) for a saved copy.",
              "For a camera scan, include all four corners and make sure the text is legible.",
            ],
            callout: {
              type: "tip",
              label: "Clear Scans",
              text: "Ensure even lighting and include all four corners of the page so OCR can read the document accurately.",
            },
          },
          {
            number: 2,
            title: "Verify detected details and submit",
            image: staffExtracted,
            screenLabel: "Mobile App · Document Entry — Detected Details",
            screenAlt: "VISTA Mobile Document Entry showing detected fields and attached file preview",
            instructions: [
              "Check the attachment preview.",
              "Correct the suggested organization, document type, category, and title against the original.",
              "Check the academic year and submitter, then tap Submit to open Review Submission.",
            ],
            callout: {
              type: "note",
              label: "Verify OCR Values",
              text: "Always compare detected values against the original physical or digital document before submitting.",
            },
          },
          {
            number: 3,
            title: "Confirm and save the submission",
            image: staffConfirm,
            screenLabel: "Mobile App · Review Submission",
            screenAlt: "VISTA Mobile Review Submission confirmation ticket with Confirm and submit button",
            instructions: [
              "On Review Submission, go back to correct a field or replace a file if anything needs updating.",
              "When the summary matches the original, tap Confirm and submit.",
              "Wait for the record and file to save. If the record was created but the file failed, tap Retry attachment upload on the confirmation screen, or locate the existing record in Review Panel.",
            ],
            callout: {
              type: "warning",
              label: "Retry Attachment Upload",
              text: "If the record saves but the file upload fails, use Retry attachment upload instead of creating a duplicate submission.",
            },
          },
        ],
      },
      {
        id: "07-mobile-review-update",
        title: "Mobile App: Post Review Updates",
        platform: "Mobile App",
        icon: "message-square",
        overview: "Review submissions on mobile, post remarks-only updates or official status decisions, and verify the saved history.",
        steps: [
          {
            number: 1,
            title: "Open a submission and post an update",
            image: staffSubmissions,
            screenLabel: "Mobile App · Submission History & Track Details",
            screenAlt: "VISTA Mobile Staff Submission History with status tabs, search, and submission cards",
            instructions: [
              "Open Review Panel, find the document, and tap its card. Read the conversation and inspect the available files.",
              "Tap Status (optional) to open New submission update. Choose Keep current status to post remarks only, or select the new decision.",
              "Write the next action for the organization, then tap Post update.",
            ],
            callout: {
              type: "warning",
              label: "Return & Approval Rules",
              text: "For a return, read the warning about removing active attachment links, type RETURNED, and tap Return Submission. For approval, check the final files, add the approved copy if the entry was previously returned, then tap Confirm Approved.",
            },
          },
          {
            number: 2,
            title: "Check the saved submission history",
            image: staffDashboard,
            screenLabel: "Mobile App · Staff Dashboard & History",
            screenAlt: "VISTA Mobile Staff Dashboard showing submission summary cards and recent submissions",
            instructions: [
              "Check the decision in the submission history.",
              "If the app says an update was not confirmed, check that history before trying again.",
            ],
            callout: {
              type: "tip",
              label: "Avoid Duplicate Updates",
              text: "Checking the submission history confirms whether a previous update already persisted before retrying.",
            },
          },
        ],
      },
      {
        id: "08-mobile-gdrive-verify",
        title: "Mobile App: Drive Sync & Upload Check",
        platform: "Mobile App",
        icon: "cloud-check",
        overview: "Connect your institutional Google account in the mobile staff workspace and verify that approved files finished uploading.",
        steps: [
          {
            number: 1,
            title: "Connect Drive and verify an upload",
            image: mobileStaffGdrive,
            screenLabel: "Mobile App · Google Drive Sync",
            screenAlt: "VISTA Mobile Google Drive Sync screen with Sign in with Google button",
            instructions: [
              "Open Google Drive Sync in the staff workspace and connect the authorized institutional account.",
              "Choose the archive folder and check the destination displayed.",
              "Open the approved submission and check its Drive archive status. A queued file is still waiting for delivery; recheck the archive status to confirm the upload finished.",
            ],
            callout: {
              type: "note",
              label: "Queued Uploads",
              text: "A queued status means delivery is still in progress. Recheck the submission's archive status to confirm completion.",
            },
          },
        ],
      },
    ],
  },

  "student-org": {
    id: "student-org",
    label: "Student Organization",
    shortLabel: "Student Org",
    partLabel: "Student Organization Guide",
    description: "Find your organization's submissions, track review status, read dated staff remarks, reply to OSA feedback, and manage alerts.",
    icon: "users",
    modules: [
      {
        id: "01-web-find-submission",
        title: "Web Portal: Sign In & Find Submissions",
        platform: "Web Portal",
        icon: "search",
        overview: "Sign in as a student organization representative and locate your organization's submissions in Review Tracker.",
        steps: [
          {
            number: 1,
            title: "Sign in to your organization dashboard",
            image: webStudentDashboard,
            screenLabel: "Web Portal · Student Org Dashboard",
            screenAlt: "Student Organization Dashboard showing summary cards and Priority Submissions",
            instructions: [
              "Open the VISTA web portal, enter your registered organization representative’s email and password, then select SIGN IN.",
              "Review your organization’s Total Submissions, Pending, Approved, and Returned summary cards or open a priority submission.",
              "Select REVIEW TRACKER in the sidebar to search, filter, or export all submissions.",
            ],
            callout: {
              type: "tip",
              label: "Quick Access",
              text: "Select VIEW on any row to jump directly to its submission details and staff remarks.",
            },
          },
          {
            number: 2,
            title: "Search, filter, and export in Review Tracker",
            image: webStudentTracker,
            screenLabel: "Web Portal · Student Org — Review Tracker",
            screenAlt: "Student Organization Review Tracker showing Search submissions, Filter, Export, and submission rows",
            instructions: [
              "Open REVIEW TRACKER in the sidebar and enter a distinctive word from the document title in Search submissions.",
              "If several records match, select Filter to narrow by status or by From Date and To Date, or use Export to download a CSV spreadsheet copy.",
              "Check the title and organization, then select VIEW on the matching row.",
            ],
            callout: {
              type: "tip",
              label: "Missing Document?",
              text: "If a document is missing, clear the filters. If it still does not appear, confirm with OSA which organization and title were used at registration.",
            },
          },
        ],
      },
      {
        id: "02-web-remarks-followup",
        title: "Web Portal: Remarks & Follow-Up",
        platform: "Web Portal",
        icon: "file-text",
        overview: "Inspect status history, read staff feedback, follow resubmission instructions, and export records as CSV.",
        steps: [
          {
            number: 1,
            title: "Read staff remarks and understand statuses",
            image: webStudentHistory,
            screenLabel: "Web Portal · Review Tracker Details",
            screenAlt: "Review Tracker Details showing submission card, physical submission notice, and Status history",
            instructions: [
              "In the submission details, check the title and current status. Open Status history to see when the record changed and read the latest staff remarks.",
              "Pending means the document is waiting for review. On Process means staff are reviewing it. Approved means OSA has accepted it.",
              "If the entry is returned or rejected, read the reason and identify the requested correction.",
            ],
            callout: {
              type: "important",
              label: "Resubmission Required",
              text: "If the notice says Resubmission Required, revise the physical document and return it to OSA according to the instructions.",
            },
          },
          {
            number: 2,
            title: "Reply, add a document link, and recheck updates",
            image: webStudentReply,
            screenLabel: "Web Portal · Status History — Reply & Document Link",
            screenAlt: "Review Tracker Status history showing staff remarks, reply composer, and HTTPS document link input",
            instructions: [
              "To ask a question or follow up with OSA, type your message in the reply box under a staff remark or status update.",
              "If you need to share a supporting document or updated file, tap the link icon and paste the HTTPS link, then select Reply.",
              "You can also return to your Dashboard (homepage) or Review Tracker anytime to recheck for new status updates.",
            ],
            callout: {
              type: "note",
              label: "Physical Submission Scope",
              text: "Digital documents are restricted to OSA staff. Use replies and supporting links to coordinate follow-ups or physical resubmissions with OSA.",
            },
          },
        ],
      },
      {
        id: "03-mobile-student-signin",
        title: "Mobile App: Install & Sign In",
        platform: "Mobile App",
        icon: "smartphone",
        overview: "Install VISTA on Android and sign in with your registered Student Organization account.",
        steps: [
          {
            number: 1,
            title: "Install VISTA and sign in",
            image: studentDashboard,
            screenLabel: "Mobile App · Student Org. Dashboard",
            screenAlt: "VISTA Mobile Student Organization Dashboard with summary cards and recent submissions",
            instructions: [
              "On Android, use Download for Android on the VISTA website to install the app.",
              "Open VISTA and sign in with your registered email and password.",
              "If you have forgotten your password, tap Forgot password? on the sign-in screen. Enter your registered email, tap Send code, and use the six-digit email code to set a new password.",
            ],
            callout: {
              type: "note",
              label: "Organization Scope",
              text: "After signing in, your dashboard shows only the submissions available to your account and organization.",
            },
          },
        ],
      },
      {
        id: "04-mobile-find-document",
        title: "Mobile App: Find Document",
        platform: "Mobile App",
        icon: "folder-search",
        overview: "Search and filter your organization's submissions from the mobile Review Tracker and read the latest staff remark.",
        steps: [
          {
            number: 1,
            title: "Find a document in Review Tracker",
            image: studentTracker,
            screenLabel: "Mobile App · Review Tracker",
            screenAlt: "VISTA Mobile Student Review Tracker with status tabs, search bar, Filter button, and submission cards",
            instructions: [
              "From Home, open the tracker in the bottom navigation.",
              "Search by title and narrow the results by status or academic year. Clear the filters if you cannot find the entry.",
              "Tap the matching card. Check the document title, organization, and current status, then read the latest dated staff remark.",
            ],
            callout: {
              type: "tip",
              label: "Filter Reset",
              text: "If an expected submission does not appear, clear active status or academic year filters first.",
            },
          },
        ],
      },
      {
        id: "05-mobile-reply-notifications",
        title: "Mobile App: Reply & Notifications",
        platform: "Mobile App",
        icon: "bell",
        overview: "Reply to staff remarks with supporting HTTPS links and stay updated via the notification bell and Android push alerts.",
        steps: [
          {
            number: 1,
            title: "Reply to staff remarks",
            image: studentConversation,
            screenLabel: "Mobile App · Track Details — Conversation",
            screenAlt: "VISTA Mobile Track Details conversation showing staff remark and Reply button",
            instructions: [
              "Open the relevant staff remark and tap Reply when available. Type your response in the composer.",
              "To include a supporting HTTPS link, tap the link icon and paste the address.",
              "Tap the send button and check that your reply appears under the intended remark.",
            ],
            callout: {
              type: "important",
              label: "View-Only & Physical Copies",
              text: "For a view-only organization record, ask the original submitter to reply. If staff request a signed or corrected physical copy, follow the delivery instructions in their remark and use the conversation to confirm details with OSA.",
            },
          },
          {
            number: 2,
            title: "Check in-app notifications and banners",
            image: mobilePushBanner,
            screenLabel: "Mobile App · In-App Notification Banner & Sheet",
            screenAlt: "VISTA Mobile in-app notification banner and Notifications sheet with All, Unread, and Priority tabs",
            instructions: [
              "Tap the notification bell to open the Notifications sheet and read alerts.",
              "Use the All, Unread, and Priority tabs to filter submission updates.",
              "Tap a notification banner or submission alert to open the related record.",
            ],
            callout: {
              type: "tip",
              label: "Notification Filters",
              text: "Use the All, Unread, and Priority tabs inside Notifications to focus on urgent submission updates.",
            },
          },
          {
            number: 3,
            title: "Receive Android push notifications",
            image: mobilePushShade,
            screenLabel: "Mobile App · Android Push Notification Shade",
            screenAlt: "Android notification shade showing an alerting VISTA push notification",
            instructions: [
              "When VISTA sends a status or reply alert, it appears in your Android notification shade.",
              "Tap the VISTA notification to jump straight to the submission in the app.",
              "If push alerts are missing, check Settings → Notifications in VISTA and the phone’s notification permission.",
            ],
            callout: {
              type: "note",
              label: "Push Permissions",
              text: "Ensure Android notification permissions are enabled for VISTA so you receive alerts even when the app is closed.",
            },
          },
        ],
      },
    ],
  },

  administrator: {
    id: "administrator",
    label: "Administrator",
    shortLabel: "Administrator",
    partLabel: "Administrator Guide",
    description: "Manage staff and student representative accounts, maintain registration dropdown choices, and inspect system-wide audit logs.",
    icon: "shield",
    modules: [
      {
        id: "01-web-admin-workspace",
        title: "Web Portal: Admin Workspace",
        platform: "Web Portal",
        icon: "lock",
        overview: "Sign in to the Administrator web portal and locate account management, registration configuration, and audit logs.",
        steps: [
          {
            number: 1,
            title: "Sign in to the admin workspace",
            image: webAdminDashboard,
            screenLabel: "Web Portal · Admin Dashboard",
            screenAlt: "Admin Dashboard with ADMIN ACCESS sidebar links for USERS, REGISTRATION CONFIG, and AUDIT LOGS",
            instructions: [
              "Open the VISTA web portal, enter your administrator email and password, and select SIGN IN.",
              "Look for ADMIN ACCESS in the sidebar.",
              "Select USERS to manage accounts, REGISTRATION CONFIG to maintain registration choices, or AUDIT LOGS to review activity.",
            ],
            callout: {
              type: "note",
              label: "Web Portal Only",
              text: "Administrator management tools are accessed through the VISTA web portal.",
            },
          },
        ],
      },
      {
        id: "02-web-user-accounts",
        title: "Web Portal: User Accounts & Invitations",
        platform: "Web Portal",
        icon: "user-plus",
        overview: "Create new accounts, assign roles and organizations, suspend or restore access, and resend welcome invitations.",
        steps: [
          {
            number: 1,
            title: "Create an account and send the invitation",
            image: webAdminAddUser,
            screenLabel: "Web Portal · User Management — Add New User",
            screenAlt: "User Management table and Add New User modal with Role, Organization, and Account Status",
            instructions: [
              "Open USERS and search by name or email to check whether the person already has an account. To create one, select Add User.",
              "Enter the first name, last name, and email address. Choose the role that matches the person’s duties. For a student representative, select the organization whose submissions they should be able to track.",
              "Verify the email, role, organization, and account status. Select Add User, then find the new account in the list.",
            ],
            callout: {
              type: "note",
              label: "Welcome Email",
              text: "The welcome email contains the temporary password for the user’s first sign-in.",
            },
          },
          {
            number: 2,
            title: "Update access or resend an invitation",
            image: webAdminEditUser,
            screenLabel: "Web Portal · User Management — Edit & Resend",
            screenAlt: "User Management row actions for EDIT, DELETE, and Resend invitation",
            instructions: [
              "In USERS, search for the account and open its edit action. Check the name, role, and organization before changing access.",
              "To suspend sign-in, switch Account Status to Inactive. To restore it, choose Active. Select Save Changes and verify the status in the list.",
              "If the person needs a new invitation, select Resend invitation on their row. Check the recipient and select Send invitation.",
            ],
            callout: {
              type: "warning",
              label: "Temporary Password Replacement",
              text: "After a successful resend, ask the user to use the newest email because its temporary password replaces the previous one.",
            },
          },
        ],
      },
      {
        id: "03-web-registration-config",
        title: "Web Portal: Registration Config",
        platform: "Web Portal",
        icon: "sliders",
        overview: "Add or update dropdown options for Organizations, Academic Years, Document Types, and Categories.",
        steps: [
          {
            number: 1,
            title: "Add or update registration choices",
            image: webAdminRegConfig,
            screenLabel: "Web Portal · Registration Configuration",
            screenAlt: "Registration Configuration screen with tabs for Organizations, Academic Years, Document Types, and Categories",
            instructions: [
              "Open REGISTRATION CONFIG. Select the tab for the value you need to maintain: Organizations, Academic Years, Document Types, or Categories.",
              "Check the list for an existing entry. To create a choice, select Add New Entry, fill in the fields, and select the add button for that type.",
              "To correct an existing choice, open its edit action, update the fields, and select Save Changes. Check the saved value in the same tab.",
            ],
            callout: {
              type: "tip",
              label: "Verify Changes",
              text: "Always check the saved value in the same tab after adding or editing an entry.",
            },
          },
        ],
      },
      {
        id: "04-web-audit-logs",
        title: "Web Portal: Audit Logs",
        platform: "Web Portal",
        icon: "history",
        overview: "Search and filter system-wide audit logs to inspect account actions, timestamps, and event timelines.",
        steps: [
          {
            number: 1,
            title: "Trace an action in the audit log",
            image: webAdminAuditLogs,
            screenLabel: "Web Portal · Audit Log History",
            screenAlt: "Audit Log History showing Live Activity Stream with Timestamp, User/Entity, Action, and View Details",
            instructions: [
              "Open AUDIT LOGS. Locate the event using the available search or filters.",
              "Match the account, action, and time to the event you are investigating.",
              "Open the matching entry and review its event details and timeline. Return to the list to inspect another event.",
            ],
            callout: {
              type: "note",
              label: "Export Logs",
              text: "You can use Export in Audit Log History to download a copy of the filtered activity stream.",
            },
          },
        ],
      },
    ],
  },
};
