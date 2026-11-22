import { useId } from "react";
import { Loader2, FileText, Eye } from "lucide-react";
import SubmissionPass from "../../../../components/SubmissionPass";
import AttachmentImagePreview from '../../../../components/AttachmentImagePreview';

export default function OCRResults({
  file,
  summaryData,
  onApprove,
  onRedo,
  isSubmitting,
}) {
  const previewTitleId = useId();
  return (
    <div className="ocr-results">
      <div style={{ marginBottom: "16px" }}>
        <span
          className="font-inter font-semibold text-[#142d55]"
          style={{ fontSize: "16px" }}
        >
          Review Extracted Details
        </span>
        <p
          className="font-inter text-gray-500 mt-1"
          style={{ fontSize: "13px" }}
        >
          Please verify the information before creating the submission.
        </p>
      </div>

      <section className="submission-pass registration-pass-preview" aria-labelledby={previewTitleId}>
        <SubmissionPass
          preview
          titleId={previewTitleId}
          submission={{
            title: summaryData?.title,
            site: summaryData?.org_name,
            documentType: summaryData?.doc_type_name || "Unknown",
            submittedDate: `${new Date().toLocaleDateString()} (Today)`,
          }}
          submitterName={summaryData?.submitted_by_name}
          avatarUrl={summaryData?.submitted_by_image_url}
          organizationAvatarUrl={summaryData?.org_image_url}
          academicYear={summaryData?.academic_year}
          category={summaryData?.category_name}
        >
          <div className="submission-pass__attachments">
            <p className="submission-pass__attachment-label">Attached File</p>
            <AttachmentImagePreview file={file}>
              {({ openPreview, canPreview }) => (
                <button
                  type="button"
                  data-ui="secondary"
                  className="registration-pass-attachment"
                  onClick={canPreview ? openPreview : undefined}
                  disabled={!canPreview}
                  aria-label={canPreview ? `Preview ${summaryData?.file_name || file?.name || "attachment"}` : undefined}
                >
                  <FileText size={18} aria-hidden="true" />
                  <span>{summaryData?.file_name || file?.name || "No File Attached"}</span>
                  {canPreview && <Eye size={16} aria-hidden="true" />}
                </button>
              )}
            </AttachmentImagePreview>
          </div>
        </SubmissionPass>
      </section>
      <p className="registration-preview-help">Preview only. Approve to create this submission, or Redo to edit the details.</p>

      <div className="responsive-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button aria-busy={Boolean(isSubmitting)} data-ui="secondary"
          type="button"
          onClick={onRedo}
          disabled={isSubmitting}
          className="font-inter font-bold transition active:scale-95 disabled:opacity-50"
          style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
        >
          Redo
        </button>
        <button aria-busy={Boolean(isSubmitting)} data-ui="primary"
          type="button"
          onClick={onApprove}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 font-inter font-bold transition hover:brightness-105 active:scale-95 disabled:opacity-50"
          style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
