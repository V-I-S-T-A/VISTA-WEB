import { FileText } from "lucide-react";
import SubmissionPass from "../../../../components/SubmissionPass";
import { getSubmissionPresentation } from "../../../../config/submissionPresentation";

export default function DetailsSubmissionInfo({ submission, isOwner = true, avatarUrl }) {
  if (!submission) return null;

  const submittedDate = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }) : "N/A";
  const submitterName = submission.submitted_by_name || "Original submitter";
  const contact = submission.submitted_by_email
    ? `${submitterName} (${submission.submitted_by_email})` : submitterName;

  return (
    <section className="submission-pass student-submission-pass" aria-labelledby="student-submission-title">
      <SubmissionPass
        submission={{
          id: submission.submission_id?.toUpperCase() || "N/A",
          title: submission.title || "Untitled Document",
          site: submission.org_name || "Organization Pending",
          submittedDate,
          documentType: submission.doc_type_name || "N/A",
          contactEmail: contact,
        }}
        avatarUrl={avatarUrl}
        organizationAvatarUrl={submission.org_image_url}
        submitterName={submitterName}
        submitterEmail={submission.submitted_by_email}
        status={submission.status}
        statusLabel={getSubmissionPresentation(submission.status).label}
        category={submission.category_name || "N/A"}
        eyebrow={isOwner ? "My Submission" : "Organization Submission · View only"}
        titleId="student-submission-title"
      >
        <div className="submission-pass__attachments">
          <p className="submission-pass__empty"><FileText size={18} aria-hidden="true" /><span>Physical submission · Digital documents are restricted to OSA staff.</span></p>
        </div>
      </SubmissionPass>
      {!isOwner && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">This organization submission is read-only. Actions remain limited to the original submitter and authorized staff.</p>}
    </section>
  );
}
