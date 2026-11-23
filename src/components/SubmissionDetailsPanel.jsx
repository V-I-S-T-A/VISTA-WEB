import { PassAvatar } from './SubmissionPass';
import { PanelSkeleton } from './loading/Skeleton';
import './SubmissionDetailsPanel.css';

/** Read-only presentation of the values already authorized and mapped by callers. */
export default function SubmissionDetailsPanel({ submission = {}, titleId, preview = false, academicYear, category, description, submitterName, submitterEmail, avatarUrl, organizationAvatarUrl, submitterLoading = false, loading = false, statusLabel, children }) {
  return <section className="submission-details-panel" aria-labelledby={titleId} aria-busy={loading || undefined}>
    <header className="submission-details-panel__heading"><h2 id={titleId}>{preview ? 'Extracted document details' : 'Document details'}</h2>{!loading && <span>{preview ? 'Read-only preview' : statusLabel}</span>}</header>
    {loading ? <PanelSkeleton kind="form" framed={false} label="Loading document details" /> : <div className="submission-details-panel__fields">
      <Field label="Organization"><span className="submission-details-panel__person"><PassAvatar key={organizationAvatarUrl || 'organization'} src={organizationAvatarUrl} organization alt={`${submission.site || 'Organization'} logo`} className="submission-pass__brand-mark" /><span>{submission.site || 'Not available'}</span></span></Field>
      <Field label="Submitted by"><span className="submission-details-panel__person submission-pass__contact"><PassAvatar key={avatarUrl || 'submitter'} src={avatarUrl} loading={submitterLoading} alt={`${submitterName || 'Submitter'} profile`} className="submission-pass__contact-avatar" /><span className="submission-pass__contact-text"><span className="submission-pass__contact-name">{submitterName || submission.contactEmail || 'Not available'}</span>{submitterEmail && <span className="submission-pass__contact-email">{submitterEmail}</span>}</span></span></Field>
      <Field label="Academic year">{academicYear || 'Not available'}</Field>
      <Field label="Document type">{submission.documentType || 'Not available'}</Field>
      <Field label="Category">{category || 'Not available'}</Field>
      <Field label={preview ? 'Submission date' : 'Submitted'}>{submission.submittedDate || 'Not available'}</Field>
      <Field label="Document title" wide>{submission.title || 'Untitled submission'}</Field>
      {!preview && <Field label="Reference ID" wide>{submission.id || 'Not available'}</Field>}
      {description && <Field label="Description" wide>{description}</Field>}
    </div>}
    {!loading && children && <div className="submission-details-panel__support">{children}</div>}
  </section>;
}

function Field({ label, wide, children }) {
  return <div className={`submission-details-panel__field${wide ? ' submission-details-panel__field--wide' : ''}`} role="group" aria-label={label}><p className="submission-details-panel__label">{label}</p><div className="submission-details-panel__value">{children}</div></div>;
}
