import { useId, useState } from "react";
import { Building2, FileText, ChevronDown } from "lucide-react";
import ticketArtwork from "../assets/shared/ticket-staff-cosmic.webp";
import defaultUser from "../assets/shared/default_user.webp";
import { Skeleton } from "./loading/Skeleton";
import "./SubmissionPass.css";

function PassAvatar({ src, alt, organization = false, loading = false, className }) {
  const [pending, setPending] = useState(Boolean(src));
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  return <span className={className}>
    {(loading || (showImage && pending)) && <Skeleton circle width="100%" height="100%" className="submission-pass__avatar-skeleton" />}
    {!loading && (showImage
      ? <img src={src} alt={alt} style={{ opacity: pending ? 0 : 1 }} onLoad={() => setPending(false)} onError={() => { setFailed(true); setPending(false); }} />
      : organization ? <Building2 size={22} aria-label="Organization logo unavailable" /> : <img src={defaultUser} alt={alt} />)}
  </span>;
}

/** Presentation only: draft previews never fetch, save, or invent a reference ID. */
export default function SubmissionPass({
  submission = {},
  avatarUrl,
  organizationAvatarUrl,
  submitterLoading = false,
  loading = false,
  submitterName,
  submitterEmail,
  status,
  statusLabel,
  titleId,
  preview = false,
  academicYear,
  category,
  eyebrow,
  children,
}) {
  const id = useId();
  const waveId = `${id}-wave`;
  const chipId = `${id}-chip`;
  const detailsId = `${id}-details`;
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const field = (value, width = "75%", height = 14) => loading ? <Skeleton width={width} height={height} /> : value;
  return (
    <div className="submission-pass__card" data-details-expanded={detailsExpanded} data-loading={loading} aria-busy={loading || undefined} aria-label={loading ? "Loading submission details" : undefined}>
      {loading && <span role="status" className="sr-only">Loading submission details</span>}
      <div className="submission-pass__banner" aria-hidden="true">
        {loading ? <Skeleton height="100%" /> : <img src={ticketArtwork} alt="" />}
        <svg className="submission-pass__banner-curve" viewBox="0 0 600 48" preserveAspectRatio="none"><path d="M0 20 C150 -38 335 88 600 16 L600 48 L0 48Z" /></svg>
      </div>
      <div className="submission-pass__face">
        <svg className="submission-pass__waves" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id={waveId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9360ef" stopOpacity=".18" /><stop offset=".55" stopColor="#7342e4" stopOpacity=".7" /><stop offset="1" stopColor="#b389ff" stopOpacity=".18" /></linearGradient></defs>
        <path d="M0 145 C120 70 205 195 380 90 S535 0 600 24 L600 160 L0 160Z" fill={`url(#${waveId})`} stroke="#b99bf5" strokeOpacity=".5" />
        <path d="M0 151 C150 96 255 180 430 123 S550 70 600 95" fill="none" stroke="#ad91ec" strokeOpacity=".3" />
        </svg>
        <div className="submission-pass__identity">
          <PassAvatar key={organizationAvatarUrl || "organization"} src={organizationAvatarUrl} alt={`${submission.site || "Organization"} logo`} organization loading={loading} className="submission-pass__brand-mark" />
          <div className="submission-pass__heading">
            <div className="submission-pass__heading-line">
              <p className="submission-pass__eyebrow">{field(eyebrow || (preview ? "Submission Preview" : "Submission Details"), 95, 10)}</p>
              {loading ? <Skeleton width={75} height={10} /> : <span className="submission-pass__status" data-status={preview ? "draft" : status || "unknown"} aria-label={preview ? "Draft preview, not yet submitted" : `Latest saved status: ${statusLabel}`}><i aria-hidden="true" />{preview ? "Draft preview" : statusLabel}</span>}
              {!loading && <button type="button" data-ui="tertiary" className="submission-pass__details-toggle" aria-expanded={detailsExpanded} aria-controls={detailsId} aria-label={detailsExpanded ? "Hide full submission details" : "Show full submission details"} onClick={() => setDetailsExpanded(value => !value)}>
                Details <ChevronDown size={12} aria-hidden="true" />
              </button>}
            </div>
            <h2 id={titleId} className="submission-pass__title">{field(submission.title || "Untitled submission", "80%", 22)}</h2>
            <p className="submission-pass__organization">{!loading && <Building2 size={13} aria-hidden="true" />}<span>{field(submission.site || "Unknown organization", 180, 11)}</span></p>
            {!loading && category && <p className="submission-pass__category">{category}</p>}
          </div>
          <svg className="submission-pass__chip" viewBox="0 0 64 48" aria-hidden="true">
            <defs><linearGradient id={chipId} x2="1" y2="1"><stop stopColor="#f9e6ab" /><stop offset=".5" stopColor="#e8c16b" /><stop offset="1" stopColor="#c6933c" /></linearGradient></defs>
            <rect x="1" y="1" width="62" height="46" rx="9" fill={`url(#${chipId})`} stroke="#f7dd96" />
            <g fill="none" stroke="#9d742f" strokeWidth=".9"><rect x="21" y="14" width="22" height="20" rx="5" /><path d="M1 16H21M43 16H63M1 32H21M43 32H63M21 1V8L28 14M43 1V8L36 14M21 47V40L28 34M43 47V40L36 34M1 24H21M43 24H63" /></g>
          </svg>
        </div>
        <div className="submission-pass__details">
          <div className="submission-pass__reference">
            <p className="submission-pass__label">{preview ? "Academic Year" : "Reference ID"}</p>
            <p className="submission-pass__number">{field(preview ? academicYear || "Unknown" : `ID: #${submission.id?.slice(0, 8) || ""}`, "75%", 26)}</p>
          </div>
          <div className="submission-pass__date">
            <p className="submission-pass__label">{preview ? "Submission Date" : "Submitted"}</p>
            <p className="submission-pass__value">{field(submission.submittedDate, "65%")}</p>
          </div>
          <div id={detailsId} className="submission-pass__secondary-details">
            <div className="submission-pass__document-type">
              <p className="submission-pass__label">Document Type</p>
              <p className="submission-pass__value">{!loading && <FileText size={14} aria-hidden="true" />}<span>{field(submission.documentType, 180)}</span></p>
            </div>
            <div className="submission-pass__contact">
              <p className="submission-pass__label">{preview ? "Submitted by" : "Submitter Contact"}</p>
              <div className="submission-pass__value submission-pass__contact-value">
                <PassAvatar key={avatarUrl || "submitter"} src={avatarUrl} alt={`${submitterName || "Submitter"} profile`} loading={loading || submitterLoading} className="submission-pass__contact-avatar" />
                <span className="submission-pass__contact-text">{field(submitterEmail ? <>
                  <span className="submission-pass__contact-name">{submitterName || "Original submitter"}</span>
                  <span className="submission-pass__contact-email">{submitterEmail}</span>
                </> : preview ? submitterName || "Unknown" : submitterName || submission.contactEmail, 180)}</span>
              </div>
            </div>
          </div>
        </div>
        {loading ? <div className="submission-pass__attachments submission-pass__attachments--loading"><Skeleton width={85} height={10} /><Skeleton height={42} style={{ marginTop: 8, borderRadius: 12 }} /></div> : children}
      </div>
    </div>
  );
}
