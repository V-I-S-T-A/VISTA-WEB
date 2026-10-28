import { useEffect, useState } from "react";
import { submissionService } from "../../../../../services/submissionService";
import { getApiErrorMessage } from "../../../../../utils/apiErrorMessage";
import { isSubmissionDeleteReady } from "../../../../../utils/submissionDeleteValidation";
import StatusModal from "../../../../../components/StatusModal";

const REASONS = [
  { value: "duplicate", label: "Duplicate submission" },
  { value: "incorrect", label: "Incorrectly created entry" },
  { value: "other", label: "Other reason" },
];

export default function DeleteSubmissionModal(props) {
  if (!props.isOpen || !props.submission) return null;
  return <DeleteSubmissionModalContent key={props.submission.submission_id || props.submission.id} {...props} />;
}

function DeleteSubmissionModalContent({
  submission,
  onClose,
  onDeleted,
}) {
  const [reasonType, setReasonType] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isDeleting]);

  const title = submission.title || "Untitled submission";
  const referenceId = submission.submission_id || submission.id || "Unavailable";
  const canDelete = isSubmissionDeleteReady({ reasonType, reasonDetails, confirmation }) && !isDeleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    setError("");
    try {
      await submissionService.deleteSubmission(referenceId, {
        confirmation,
        reason_type: reasonType,
        reason_details: reasonType === "other" ? reasonDetails.trim() : "",
      });
      await onDeleted();
    } catch (deleteError) {
      const backendDetail = deleteError?.response?.data?.detail;
      setError(
        typeof backendDetail === "string"
          ? backendDetail
          : getApiErrorMessage(deleteError, "The submission could not be deleted."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <StatusModal
      isOpen
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleDelete}
      title="Delete Submission Entry?"
      subtitle="Permanent deletion confirmation"
      message="You are about to delete this submission and its associated VISTA attachments. This action cannot be undone."
      type="warning"
      maxWidth="540px"
      cancelText="Cancel"
      confirmText={isDeleting ? "Deleting…" : "Permanently Delete"}
      confirmVariant="danger"
      confirmDisabled={!canDelete}
      closeDisabled={isDeleting}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div
            role="alert"
            style={{
              padding: "10px 12px",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#991b1b",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              lineHeight: 1.45,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            padding: "14px 16px",
            border: "1px solid #dbe5ef",
            borderRadius: "10px",
            background: "#f7faff",
          }}
        >
          <p style={eyebrowStyle}>SUBMISSION</p>
          <p style={{ ...bodyTextStyle, marginTop: "5px", fontWeight: 700, color: "#142d55" }}>
            {title}
          </p>
          <p
            style={{
              ...bodyTextStyle,
              marginTop: "5px",
              color: "#6b7280",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "11px",
              overflowWrap: "anywhere",
            }}
          >
            Reference ID: {referenceId}
          </p>
        </div>

        <fieldset disabled={isDeleting} style={{ border: 0, minWidth: 0 }}>
          <legend style={{ ...eyebrowStyle, marginBottom: "8px" }}>
            Reason for deletion <span style={{ color: "#b4232f" }}>*</span>
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {REASONS.map((reason) => {
              const selected = reasonType === reason.value;
              return (
                <label
                  key={reason.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    border: `1px solid ${selected ? "#7da7d8" : "#d1d5db"}`,
                    borderRadius: "8px",
                    background: selected ? "#f0f6ff" : "#ffffff",
                    color: "#374151",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="submission-delete-reason"
                    value={reason.value}
                    checked={selected}
                    onChange={() => setReasonType(reason.value)}
                    style={{ width: "16px", height: "16px", accentColor: "#1f5cae", margin: 0 }}
                  />
                  {reason.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {reasonType === "other" && (
          <div>
            <label htmlFor="submission-delete-reason-details" style={fieldLabelStyle}>
              Explain the reason <span style={{ color: "#b4232f" }}>*</span>
            </label>
            <textarea
              id="submission-delete-reason-details"
              value={reasonDetails}
              onChange={(event) => setReasonDetails(event.target.value)}
              maxLength={500}
              rows={3}
              disabled={isDeleting}
              style={{ ...inputStyle, resize: "vertical", minHeight: "76px" }}
            />
          </div>
        )}

        <div>
          <label htmlFor="submission-delete-confirmation" style={fieldLabelStyle}>
            Type DELETE to confirm <span style={{ color: "#b4232f" }}>*</span>
          </label>
          <input
            id="submission-delete-confirmation"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            disabled={isDeleting}
            style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          />
        </div>
      </div>
    </StatusModal>
  );
}

const eyebrowStyle = {
  margin: 0,
  color: "#6b7280",
  fontFamily: "Inter, sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

const bodyTextStyle = {
  margin: 0,
  color: "#374151",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  lineHeight: 1.45,
};

const fieldLabelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#374151",
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  fontWeight: 600,
};

const inputStyle = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#1f2937",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  outlineColor: "#1f5cae",
};
