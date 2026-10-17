import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/footer";

const CONTACT = "moyarojo@gmail.com";
const UPDATED = "October 17, 2026";

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-slate-200 pt-7">
      <h2 className="mb-3 text-xl font-semibold text-[#142b49]">{title}</h2>
      <div className="space-y-3 text-base leading-8 text-slate-700">{children}</div>
    </section>
  );
}

function Contact() {
  return <a className="underline underline-offset-4" href={`mailto:${CONTACT}`}>{CONTACT}</a>;
}

function LegalLayout({ title, summary, children }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | VISTA`;
    window.scrollTo(0, 0);
    return () => { document.title = previousTitle; };
  }, [title]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/" className="text-sm font-medium text-[#1a51a5] underline underline-offset-4">Back to VISTA</Link>
        <article className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">VISTA · Account and document services</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#142b49] sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm text-slate-500">Effective and last updated: {UPDATED}</p>
          <p className="mt-6 text-lg leading-8 text-slate-700">{summary}</p>
          <div className="mt-9 space-y-8">{children}</div>
        </article>
        <nav aria-label="Legal documents" className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#1a51a5]">
          <Link className="underline underline-offset-4" to="/privacy-policy">Privacy Policy</Link>
          <Link className="underline underline-offset-4" to="/terms-of-service">Terms of Service</Link>
          <Contact />
        </nav>
      </main>
      <Footer />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" summary="This policy explains how VISTA handles information when you use its account, student-organization document, review, and Google integration features.">
      <Section id="who-we-are" title="1. About VISTA and this policy">
        <p>VISTA is a document submission and review platform for Office of Student Affairs workflows. Students and organization representatives submit records, while authorized staff and administrators manage accounts, review documents, and track decisions. This policy covers this VISTA deployment and its connected services.</p>
        <p>For privacy questions, contact the VISTA project administrator at <Contact />. This contact is for VISTA; it is not Google support.</p>
      </Section>
      <Section id="information" title="2. Information we process">
        <ul className="list-disc space-y-2 pl-6">
          <li>Account details, including your name, email address, assigned role, organization, account status, and any profile image you provide.</li>
          <li>Documents and information you submit, including file contents, filenames, event or activity details, organization information, and academic-year and document-type selections. Documents may include information about other people.</li>
          <li>Review decisions, remarks, status changes, notifications, and audit records associated with account and document activity.</li>
          <li>Authentication information, including password hashes, verification codes, session or access tokens, and Google OAuth credentials where an integration is authorized.</li>
          <li>Operational information needed to run and protect the service, such as request/error logs, access times, and technical information handled by our hosting providers.</li>
        </ul>
      </Section>
      <Section id="purposes" title="3. How information is used">
        <p>We use this information to authenticate users, administer access, process and review submissions, generate reports, maintain activity history, provide notifications, send account and password-verification emails, troubleshoot failures, and protect the service against misuse.</p>
        <p>OCR processes uploaded documents to suggest registration fields. Suggestions can be inaccurate and must be reviewed by a person before submission. Access to documents and review information is governed by the user’s assigned role and the organization’s administrative workflow.</p>
      </Section>
      <Section id="google" title="4. Google API access and use">
        <p><strong>Google Drive:</strong> staff who connect a Google account authorize VISTA to list or select folders, create workflow folders, and upload submission documents to the selected destination. Depending on the granted permission, Drive access may be broader than files created by VISTA. The consent screen shows the requested scope. VISTA uses that access for the document-management features initiated through the application.</p>
        <p>Drive connection information may include the authorized account identifier, granted scopes, selected folder identifiers, token expiry, and access/refresh tokens. Drive tokens are stored encrypted in the backend database. Uploaded files and folder metadata are processed as needed to complete the requested transfer.</p>
        <p><strong>Gmail:</strong> VISTA’s configured sender account authorizes the Gmail send permission to deliver welcome messages, temporary account credentials, and password-verification codes. Recipients do not need to connect their Gmail accounts. The Gmail integration does not request permission to read recipients’ inboxes. The sender’s OAuth credentials are kept in backend configuration.</p>
        <p>VISTA does not sell Google user data, use it for advertising or credit decisions, or use it to train generalized artificial-intelligence or machine-learning models. Human access to Google user data is limited to authorized, user-directed document workflows and circumstances permitted by Google’s policies, such as security investigation or legal requirements.</p>
        <p>VISTA’s use and transfer of information received from Google APIs adheres to the <a className="underline" href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a> and the <a className="underline" href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy">Google Workspace API User Data and Developer Policy</a>, including the Limited Use requirements.</p>
      </Section>
      <Section id="sharing" title="5. Access, service providers, and sharing">
        <p>Authorized staff and administrators can access records needed for their assigned duties. VISTA uses Railway for application hosting and database/background-job infrastructure, Cloudinary for uploaded media and documents, and Google for authorized Drive storage and Gmail delivery. These providers process relevant data to supply those services and may process it in countries outside your location.</p>
        <p>Emails contain the recipient address and message content; approved Drive transfers contain the selected documents and associated folder/file metadata. We may also disclose information when required by applicable law or to investigate security incidents. Provider practices are described in their own privacy policies: <a className="underline" href="https://railway.com/legal/privacy">Railway</a>, <a className="underline" href="https://cloudinary.com/privacy">Cloudinary</a>, and <a className="underline" href="https://policies.google.com/privacy">Google</a>.</p>
      </Section>
      <Section id="storage" title="6. Browser storage and security">
        <p>VISTA uses browser local storage for login tokens, remembered account identifiers, and pending upload tracking. Signing out clears the application’s login tokens, but remembered identifiers or other browser data may remain until removed through the application or browser settings. Do not use a shared device without signing out.</p>
        <p>The application uses HTTPS, hashed account passwords, role-based access controls, and encryption for stored Drive tokens. These measures reduce risk but cannot guarantee that every incident or unauthorized disclosure will be prevented. Never send your password, verification code, or OAuth token in a support message.</p>
      </Section>
      <Section id="retention" title="7. Retention, disconnection, and deletion">
        <p>Account, submission, and audit records are retained for the administrative workflow, recordkeeping, security, and applicable institutional or legal requirements. This deployment does not promise a single automatic deletion period for all record types.</p>
        <p>You may disconnect Drive using VISTA’s integration controls and revoke Google authorization through <a className="underline" href="https://myaccount.google.com/connections">your Google Account connections</a>. Revocation stops future authorized API access; it does not automatically delete documents already transferred to Drive, sent emails, or institutional submission records.</p>
        <p>Request access, correction, account closure, or deletion by contacting <Contact />. We may verify your identity and coordinate with the responsible administrator. Some records may need to remain for authorized recordkeeping, security, or legal reasons; deleting an account does not necessarily remove historical submissions, external files, or backups immediately.</p>
      </Section>
      <Section id="changes" title="8. Changes and contact">
        <p>Updates will be published on this page with a revised date. Material changes to Google data access or use will be communicated and additional consent requested where required before introducing that new use.</p>
        <p>Questions and privacy requests: <Contact />.</p>
      </Section>
    </LegalLayout>
  );
}

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" summary="These terms describe the responsibilities of people using VISTA for account access, document submission, review, and related integrations. Read them together with the Privacy Policy.">
      <Section id="scope" title="1. Purpose and access">
        <p>VISTA supports Office of Student Affairs document workflows. Use the service only for activities you are authorized to perform. Your assigned role determines which functions and records you may access. If you do not agree to these terms, do not use the service and contact the administrator about an alternative process.</p>
        <p>These terms describe use of the platform; they do not replace applicable school policies, submission requirements, or legal rights.</p>
      </Section>
      <Section id="accounts" title="2. Account responsibilities">
        <p>Provide accurate account information, protect your credentials, change temporary passwords after first sign-in, and do not share verification codes. Do not use another person’s account or attempt to bypass role restrictions. Notify the administrator promptly if you suspect unauthorized access.</p>
      </Section>
      <Section id="submissions" title="3. Documents and review decisions">
        <p>Submit only material you have authority to provide, including any personal information about other people. Check document accuracy, required approvals, and your right to share attachments. You retain any rights you hold in submitted material; providing it authorizes the processing, storage, review, and authorized transfer needed for the requested VISTA workflow.</p>
        <p>OCR suggestions, status displays, and generated reports are aids. Review extracted fields before submitting. Uploading a document does not itself constitute institutional approval; authorized reviewers make decisions through the applicable process.</p>
      </Section>
      <Section id="acceptable-use" title="4. Acceptable use">
        <p>Do not upload malicious or unlawful content, falsify records, impersonate others, access records without authorization, harvest personal information, disrupt the service, or exploit vulnerabilities. Report suspected security issues privately to <Contact /> rather than testing against other users’ data.</p>
      </Section>
      <Section id="integrations" title="5. Google and other connected services">
        <p>Connect a Google Drive account only if you have permission to use it for the intended documents. Review requested permissions and the selected destination before authorizing a transfer. Files copied to Drive may remain there after you disconnect VISTA. Google, Cloudinary, and hosting services have their own terms, limits, and availability.</p>
        <p>Account and verification emails are operational messages. Delivery can be delayed or fail, and verification codes expire. Do not assume that a missing welcome email means the account was not created; contact the administrator before retrying account creation.</p>
      </Section>
      <Section id="availability" title="6. Availability and account restrictions">
        <p>Maintenance, connectivity problems, provider outages, and changes to external services can interrupt access or processing. VISTA does not promise uninterrupted operation or error-free OCR. Use the administrator’s alternative submission process when a deadline cannot wait for restoration.</p>
        <p>Authorized administrators may restrict accounts to address misuse, security concerns, or changes in eligibility. Contact the administrator to ask about a restriction, correction, or recovery of records you are entitled to receive.</p>
      </Section>
      <Section id="privacy" title="7. Privacy and records">
        <p>Our <Link className="underline" to="/privacy-policy">Privacy Policy</Link> explains the information processed, Google permissions, service providers, browser storage, retention, and how to make a privacy request. Do not upload information that is unnecessary for your submission.</p>
      </Section>
      <Section id="updates" title="8. Changes and contact">
        <p>We may update these terms as the service changes. The current version and its date will remain publicly available here. Material changes will be communicated through an appropriate service notice. Nothing here removes rights or obligations that cannot be excluded under applicable law.</p>
        <p>For service questions or concerns, contact the VISTA project administrator at <Contact />.</p>
      </Section>
    </LegalLayout>
  );
}
