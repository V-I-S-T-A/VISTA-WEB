import VistaSelect from "../../../../components/VistaSelect";
import { PanelSkeleton } from "../../../../components/loading/Skeleton";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import ErrorNotice from "../../../../components/ErrorNotice";
import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Mail,
  FileText,
  CheckCircle2,
  Loader2,
  Trash2,
  History,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { submissionService } from "../../../../services/submissionService";
import { reviewLogService } from "../../../../services/reviewLogService";
import {
  startBackgroundDriveUpload,
  watchTasks,
} from "../../../../hooks/useBackgroundDriveUpload";
import ConfirmDriveSyncModal from "./modals/ConfirmDriveSyncModal";
import ProcessAttachmentsModal from "./modals/ProcessAttachmentsModal";
import DeleteSubmissionModal from "./modals/DeleteSubmissionModal";
import DriveArchiveCard from "./DriveArchiveCard";
import { ActionButton, StatusModal } from "../../../../components";
import AttachmentImagePreview from "../../../../components/AttachmentImagePreview";
import AttachmentChangeNote from "../../../../components/AttachmentChangeNote";
import ReviewReplyThread from "../../../shared/ReviewReplyThread";
import { isPdfUrl } from "../../../../utils/fileOptimizer";

const STATUS_ACTIONS = [
  "Select Action...",
  "On Process",
  "Approved",
  "Returned",
];

const ACTION_TO_STATUS_MAP = {
  "On Process": "under_review",
  Approved: "approved",
  Returned: "rejected",
};

// Only show Drive modal when approving a submission that needs a final Drive upload confirmation.
const REQUIRES_DRIVE_CONFIRM = new Set(["Approved"]);
const REQUIRES_REJECTION_CONFIRM = new Set(["Returned"]);

export default function SubmissionReviewDetails({ submission, onBack }) {
  const queryClient = useQueryClient();
  const [statusAction, setStatusAction] = useState(STATUS_ACTIONS[0]);
  const [remarks, setRemarks] = useState("");
  const [priorityEscalation, setPriorityEscalation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [returnConfirmation, setReturnConfirmation] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const [logsError, setLogsError] = useState("");
  const [detailsRetry, setDetailsRetry] = useState(0);
  const [logsRetry, setLogsRetry] = useState(0);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const draftEdits = useRef({ id: null, status: false, remarks: false });

  const showNotification = (
    title,
    message,
    type = "success",
    onConfirm = null,
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeNotification = () => {
    const callback = modalConfig.onConfirm;
    setModalConfig({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
      onConfirm: null,
    });
    if (callback) {
      callback();
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (draftEdits.current.id !== submission?.id) {
      draftEdits.current = { id: submission?.id, status: false, remarks: false };
      setStatusAction(STATUS_ACTIONS[0]);
      setRemarks("");
    }
    async function fetchFullDetails() {
      if (!submission?.id) return;
      try {
        setIsLoadingDetails(true);
        setDetailsError("");
        setSubmissionDetails(null);
        const data = await submissionService.getSubmissionById(submission.id);
        if (cancelled) return;
        setSubmissionDetails(data);
        setPriorityEscalation(Boolean(data?.priority_escalation));
        if (!draftEdits.current.status) {
          setStatusAction(Object.keys(ACTION_TO_STATUS_MAP).find(action => ACTION_TO_STATUS_MAP[action] === data.status) || STATUS_ACTIONS[0]);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch full submission details:", error);
        setDetailsError("Could not load the submission files. Please try again.");
      } finally {
        if (!cancelled) setIsLoadingDetails(false);
      }
    }
    fetchFullDetails();
    return () => { cancelled = true; };
  }, [submission, detailsRetry]);

  useEffect(() => {
    let cancelled = false;
    async function fetchLogs() {
      if (!submission?.id) return;
      try {
        setIsLoadingLogs(true);
        setLogsError("");
        setReviewLogs([]);
        const data = await reviewLogService.getReviewLogs({
          submissionId: submission.id,
          pageSize: 50,
        });
        if (cancelled) return;
        const logs = data?.results ?? [];
        setReviewLogs(logs);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch review logs:", error);
        setLogsError("Could not load the review history. Please try again.");
      } finally {
        if (!cancelled) setIsLoadingLogs(false);
      }
    }
    fetchLogs();
    return () => { cancelled = true; };
  }, [submission, logsRetry]);

  useEffect(() => {
    if (!submission?.id) return undefined;
    let cancelled = false;
    const refreshReviewState = async () => {
      try {
        const [details, logsResponse] = await Promise.all([
          submissionService.getSubmissionById(submission.id),
          reviewLogService.getReviewLogs({ submissionId: submission.id, pageSize: 50 }),
        ]);
        if (cancelled) return;
        setSubmissionDetails(details);
        setReviewLogs(logsResponse?.results ?? []);
      } catch {
        // Keep the view intact; the normal retry path remains available.
      }
    };
    window.addEventListener("vista:realtime-notification", refreshReviewState);
    return () => {
      cancelled = true;
      window.removeEventListener("vista:realtime-notification", refreshReviewState);
    };
  }, [submission?.id]);

  useEffect(() => {
    if (!submission?.id) return undefined;
    let cancelled = false;

    const refreshDriveArchive = async (event) => {
      if (String(event.detail?.submissionId) !== String(submission.id)) return;
      try {
        const data = await submissionService.getSubmissionById(submission.id);
        if (cancelled) return;
        setSubmissionDetails(data);
      } catch (error) {
        console.error("Could not refresh Drive archive details:", error);
      }
    };

    window.addEventListener("vista:drive-archive-updated", refreshDriveArchive);
    return () => { cancelled = true; window.removeEventListener("vista:drive-archive-updated", refreshDriveArchive); };
  }, [submission?.id]);

  if (!submission) return null;

  function handleOpenConfirmModal() {
    if (statusAction === STATUS_ACTIONS[0]) {
      showNotification(
        "Action Required",
        "Please select a valid action from the dropdown.",
        "warning",
      );
      return;
    }
    // Only an approval requires the final Drive folder confirmation.
    if (REQUIRES_DRIVE_CONFIRM.has(statusAction)) {
      setShowConfirmModal(true);
    } else if (statusAction === "On Process") {
      setShowProcessModal(true);
    } else if (REQUIRES_REJECTION_CONFIRM.has(statusAction)) {
      setReturnConfirmation("");
      setShowRejectConfirm(true);
    } else {
      handleSubmitDecision();
    }
  }

  async function invalidateAndGoBack() {
    // Invalidate all submission-related queries so Recent Submissions & Review Panel refresh
    await queryClient.invalidateQueries({ queryKey: ["submissions"] });
    await queryClient.invalidateQueries({ queryKey: ["priority-submissions"] });
    await queryClient.invalidateQueries({
      queryKey: ["submission", submission?.id],
    });
    await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    onBack();
  }

  async function handleSubmitDecision({ attachmentAction = "", attachment = null } = {}) {
    setIsSubmitting(true);
    try {
      const backendStatus = ACTION_TO_STATUS_MAP[statusAction];
      const updatedSubmission = await submissionService.updateStatus(
        submission.id,
        backendStatus,
        remarks,
        [],
        "",
        [],
        attachmentAction,
        attachment,
        priorityEscalation,
      );
      // The detail view loaded its attachments before the decision. Use the
      // backend's post-transition document list so Returned clears the visible
      // files immediately instead of leaving a stale preview on screen.
      if (updatedSubmission) {
        setSubmissionDetails(updatedSubmission);
      }
      await queryClient.invalidateQueries({ queryKey: ["priority-submissions"] });
      await queryClient.invalidateQueries({ queryKey: ["submissions"] });
      showNotification(
        "Decision Submitted",
        "Decision submitted successfully!",
        "success",
        async () => {
          await invalidateAndGoBack();
        },
      );
      return true;
    } catch (error) {
      console.error("Submission error:", error);
      const backendError = getApiErrorMessage(error, "Could not submit the decision.");
      showNotification("Submission Error", backendError, "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalSubmitDecision(driveFolderData) {
    setIsSubmitting(true);
    try {
      const backendStatus = ACTION_TO_STATUS_MAP[statusAction];

      const finalFiles = driveFolderData?.finalFiles ?? [];
      const reportFiles = driveFolderData?.reportFiles ?? [];
      if (submission.status === "rejected" && finalFiles.length === 0) {
        setShowConfirmModal(true);
        showNotification(
          "Approved document required",
          "This rejected entry has no active attachment. Add the approved document in the Drive modal before approving it.",
          "warning",
        );
        return;
      }

      // 1. Fast, synchronous status change — no file, so this returns immediately
      await submissionService.updateStatus(
        submission.id,
        backendStatus,
        remarks,
        [],
        "",
        [],
        "",
        null,
        priorityEscalation,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["priority-submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["submissions"] }),
      ]);

      // 2. Kick off the Drive upload in the background, don't await it
      const uploads = [
        ...finalFiles.map((item) => ({ ...item, uploadKind: "approved" })),
        ...reportFiles.map((item) => ({ ...item, uploadKind: "report" })),
      ];
      const queuedTasks = [];
      let queueFailures = 0;
      for (const { file, fileName, uploadKind } of uploads) {
        try {
          queuedTasks.push(
            await startBackgroundDriveUpload({
              submissionId: submission.id,
              file,
              fileName,
              folderId: driveFolderData?.folder_id,
              uploadKind,
            }),
          );
        } catch (uploadError) {
          queueFailures += 1;
          console.error("Could not queue Drive upload:", uploadError);
        }
      }
      watchTasks(queuedTasks);

      showNotification(
        queueFailures
          ? "Decision Submitted with Upload Issues"
          : "Decision Submitted",
        uploads.length
          ? `${queuedTasks.length} file${queuedTasks.length === 1 ? " is" : "s are"} uploading to Google Drive in the background.${queueFailures ? ` ${queueFailures} could not be queued.` : ""}`
          : "Status updated.",
        queueFailures ? "warning" : "success",
        async () => {
          await invalidateAndGoBack();
        },
      );
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Submission error:", error);
      const backendError = getApiErrorMessage(error, "Could not submit the decision.");
      showNotification("Submission Error", backendError, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex w-full flex-wrap items-center justify-between gap-3" style={{ paddingBottom: "20px" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center rounded-full transition hover:brightness-105 active:scale-95"
            style={{
              backgroundColor: "#FFE452",
              padding: "3px",
            }}
          >
          <span
            className="inline-flex items-center rounded-full font-inter font-medium text-[#1a1a1a]"
            style={{
              backgroundColor: "#FFF2A8",
              padding: "4px 14px",
              fontSize: "13px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                lineHeight: "20px",
                marginRight: "4px",
              }}
            >
              ›
            </span>
            Back
          </span>
          </button>
          <span className="font-inter font-medium text-gray-500" style={{ fontSize: "13.5px" }}>
            Review panel details.
          </span>
        </div>
        <ActionButton
          onClick={() => setShowDeleteModal(true)}
          label="Delete Entry"
          icon={<Trash2 size={13} aria-hidden="true" />}
          disabled={isSubmitting}
          className="disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontSize: "13px", padding: "8px 14px", borderRadius: "8px", cursor: isSubmitting ? "not-allowed" : "pointer" }}
        />
      </div>

      <div
        className="submission-detail-card w-full rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <div className="submission-detail-heading flex items-start justify-between gap-4">
          <div>
            <p
              className="font-inter font-bold uppercase tracking-wider text-gray-400"
              style={{ fontSize: "11.5px" }}
            >
              Submission Details
            </p>
            <h2
              className="font-inter font-bold text-gray-900"
              style={{ fontSize: "18px", paddingTop: "4px" }}
            >
              {submission.title}
            </h2>
            <div
              className="flex items-center gap-1.5"
              style={{ paddingTop: "8px" }}
            >
              <Building2
                style={{ width: "14px", height: "14px" }}
                className="text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span
                className="font-inter font-medium text-gray-600"
                style={{ fontSize: "13px" }}
              >
                {submission.site}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className="inline-flex items-center rounded font-inter font-bold text-[#1d4ed8] bg-[#eaf1ff]"
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              ID: #{submission.id?.slice(0, 8)}
            </span>
            <span
              className="font-inter font-medium text-gray-400"
              style={{ fontSize: "12px" }}
            >
              Submitted: {submission.submittedDate}
            </span>
          </div>
        </div>

        <div
          className="border-t border-gray-100"
          style={{ marginTop: "18px", marginBottom: "18px" }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p
              className="font-inter font-bold uppercase tracking-wider text-gray-400"
              style={{ fontSize: "11px" }}
            >
              Submitter Contact
            </p>
            <div
              className="flex items-center gap-1.5"
              style={{ paddingTop: "6px" }}
            >
              <Mail
                style={{ width: "14px", height: "14px" }}
                className="text-[#1f5cae] flex-shrink-0"
                aria-hidden="true"
              />
              <span
                className="font-inter font-semibold text-gray-800"
                style={{ fontSize: "13.5px" }}
              >
                {submission.contactEmail}
              </span>
            </div>
          </div>

          <div>
            <p
              className="font-inter font-bold uppercase tracking-wider text-gray-400"
              style={{ fontSize: "11px" }}
            >
              Document Type
            </p>
            <div
              className="flex items-center gap-1.5"
              style={{ paddingTop: "6px" }}
            >
              <FileText
                style={{ width: "14px", height: "14px" }}
                className="text-[#1f5cae] flex-shrink-0"
                aria-hidden="true"
              />
              <span
                className="font-inter font-semibold text-gray-800"
                style={{ fontSize: "13.5px" }}
              >
                {submission.documentType}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <p
            className="font-inter font-bold uppercase tracking-wider text-gray-400"
            style={{ fontSize: "11px", marginBottom: "10px" }}
          >
            Attached Files
          </p>

          {isLoadingDetails ? (
            <PanelSkeleton kind="documents" framed={false} rows={3} label="Loading attached documents" />
          ) : detailsError ? (
            <ErrorNotice message={detailsError} onRetry={() => setDetailsRetry(c => c + 1)} />
          ) : submissionDetails?.documents?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {submissionDetails.documents.map((doc, idx) => (
                <div
                  key={doc.document_id || doc.id || idx}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#eaf1ff]">
                      <FileText className="h-4 w-4 text-[#1d4ed8]" />
                    </div>
                    {doc.file_url ? (
                      <AttachmentImagePreview
                        fileUrl={doc.file_url}
                        fileName={doc.file_name || `Document ${idx + 1}`}
                        mimeType={doc.mime_type}
                        triggerLabel={doc.file_name || `Document ${idx + 1}`}
                        triggerClassName="min-w-0 truncate text-left font-inter"
                      />
                    ) : (
                      <span className="font-inter text-[13.5px] text-gray-600">{doc.file_name || `Document ${idx + 1}`} — file link unavailable</span>
                    )}
                  </div>
                  {/* FIXED: Uses doc.file_url with WebP CDN acceleration & PDF archive link */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPdfUrl(doc.file_url, doc.file_name) && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.file_name || "document.pdf"}
                        onClick={(e) => e.stopPropagation()}
                        title="Download original uncompressed PDF document"
                        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1.5 font-inter text-[11px] font-semibold text-gray-600 border border-gray-200 transition hover:bg-gray-200 active:scale-95 flex-shrink-0"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
              <span className="font-inter text-[13px] text-gray-500 italic">
                No files attached to this submission.
              </span>
            </div>
          )}
        </div>
      </div>

      <DriveArchiveCard
        archives={submissionDetails?.drive_archives ?? []}
        handledBy={reviewLogs.find((log) => log.new_status === "approved")}
      />

      <div
        className="submission-detail-card w-full rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ padding: "24px" }}
      >
        <h3
          className="font-inter font-bold text-gray-900"
          style={{ fontSize: "17px" }}
        >
          Decision Panel
        </h3>
        <p
          className="font-inter font-medium text-gray-500"
          style={{ fontSize: "13px", paddingTop: "2px", paddingBottom: "18px" }}
        >
          Record your final institutional assessment.
        </p>

        <label
          className="font-inter font-bold uppercase tracking-wider text-gray-500"
          style={{ fontSize: "11.5px" }}
        >
          Status Selection
        </label>
        <div
          className="relative"
          style={{ marginTop: "6px", marginBottom: "18px", marginRight: "4px" }}
        >
          <VistaSelect
            aria-label="Status selection"
            value={statusAction}
            onChange={(e) => { draftEdits.current.status = true; setStatusAction(e.target.value); }}
            disabled={isSubmitting || isLoadingDetails}
            className="w-full appearance-none rounded-lg bg-[#eef1f9] font-inter font-bold text-gray-800 outline-none cursor-pointer disabled:opacity-70"
            style={{ fontSize: "14px", padding: "12px 40px 12px 14px" }}
          >
            {STATUS_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </VistaSelect>
        </div>

        <label
          className="font-inter font-bold uppercase tracking-wider text-gray-500"
          style={{ fontSize: "11.5px" }}
        >
          Reviewer Remarks
        </label>
        <textarea
          value={remarks}
          onChange={(e) => { draftEdits.current.remarks = true; setRemarks(e.target.value); }}
          disabled={isSubmitting || isLoadingLogs}
          placeholder="Provide detailed justification for your decision..."
          rows={4}
          className="w-full resize-none rounded-lg bg-[#eef1f9] font-inter font-medium text-gray-700 placeholder-gray-400 outline-none disabled:opacity-70"
          style={{
            fontSize: "13.5px",
            padding: "12px 14px",
            marginTop: "6px",
            marginBottom: "16px",
          }}
        />

        <label
          className="inline-flex items-center gap-2 cursor-pointer"
          style={{ marginBottom: "20px" }}
        >
          <input
            type="checkbox"
            checked={priorityEscalation}
            onChange={(e) => setPriorityEscalation(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 text-[#1f5cae] focus:ring-[#1f5cae] disabled:opacity-70"
          />
          <span
            className="font-inter font-semibold text-gray-700"
            style={{ fontSize: "13px" }}
          >
            Mark as Priority Escalation
          </span>
        </label>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleOpenConfirmModal}
            disabled={isSubmitting || isLoadingDetails || isLoadingLogs || Boolean(detailsError || logsError)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontSize: "13.5px",
              padding: "13px 20px",
              backgroundColor: "#ffc700",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2
                style={{ width: "16px", height: "16px" }}
                aria-hidden="true"
              />
            )}
            {isSubmitting ? "SUBMITTING..." : "SUBMIT OFFICIAL DECISION"}
          </button>
        </div>
      </div>

      {/* Double Authentication & GDrive Folder Selection Modal */}
      <ConfirmDriveSyncModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmitDecision}
        isSubmitting={isSubmitting}
        submission={submission}
        submissionDetails={submissionDetails}
        statusAction={statusAction}
        remarks={remarks}
      />
      {showProcessModal && <ProcessAttachmentsModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onConfirm={async (attachmentData) => {
          const succeeded = await handleSubmitDecision(attachmentData);
          if (succeeded) setShowProcessModal(false);
          return succeeded;
        }}
        submission={submission}
        submissionDetails={submissionDetails}
      />}
      <StatusModal
        isOpen={showRejectConfirm}
        onClose={() => {
          setShowRejectConfirm(false);
          setReturnConfirmation("");
        }}
        onCancel={() => {
          setShowRejectConfirm(false);
          setReturnConfirmation("");
        }}
        title="Return Submission?"
        message="This will mark the entry as rejected and remove its active attachment associations. The submission entry and review history will remain."
        type="warning"
        maxWidth="540px"
        cancelText="Cancel"
        confirmText={isSubmitting ? "Returning…" : "Return Submission"}
        confirmDisabled={returnConfirmation !== "RETURNED" || isSubmitting}
        closeDisabled={isSubmitting}
        onConfirm={async () => {
          if (returnConfirmation !== "RETURNED" || isSubmitting) return;
          const succeeded = await handleSubmitDecision();
          if (succeeded) {
            setShowRejectConfirm(false);
            setReturnConfirmation("");
          }
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              padding: "14px 16px",
              border: "1px solid #dbe5ef",
              borderRadius: "10px",
              background: "#f7faff",
            }}
          >
            <p style={{ margin: 0, color: "#6b7280", fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
              Submission
            </p>
            <p style={{ margin: "5px 0 0", color: "#142d55", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700 }}>
              {submission.title || "Untitled submission"}
            </p>
            <p style={{ margin: "5px 0 0", color: "#6b7280", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "11px", overflowWrap: "anywhere" }}>
              Reference ID: {submission.id || "Unavailable"}
            </p>
          </div>
          <div>
            <label htmlFor="return-submission-confirmation" style={{ display: "block", marginBottom: "6px", color: "#374151", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}>
              Type RETURNED to confirm <span style={{ color: "#b4232f" }}>*</span>
            </label>
            <input
              id="return-submission-confirmation"
              type="text"
              value={returnConfirmation}
              onChange={(event) => setReturnConfirmation(event.target.value)}
              autoComplete="off"
              disabled={isSubmitting}
              style={{ display: "block", boxSizing: "border-box", width: "100%", padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#ffffff", color: "#1f2937", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "13px", outlineColor: "#1f5cae" }}
            />
          </div>
        </div>
      </StatusModal>

      {/* ── STATUS HISTORY & FEEDBACK ─────────────────────────────── */}
      <div
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ marginTop: "20px" }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3"
          style={{ background: "#1f5cae", padding: "11px 20px" }}
        >
          <div className="flex items-center gap-3">
            <History size={16} color="#ffffff" aria-hidden="true" />
            <h4
              className="m-0 font-inter font-extrabold text-white"
              style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              Status History
            </h4>
          </div>
          <span
            className="rounded-full font-inter font-extrabold text-gray-900"
            style={{ background: "#ffc700", padding: "3px 10px", fontSize: "10px" }}
          >
            {reviewLogs.length} {reviewLogs.length === 1 ? "update" : "updates"}
          </span>
        </div>

        <div style={{ padding: "18px 24px" }}>
          {isLoadingLogs ? (
            <PanelSkeleton kind="timeline" framed={false} rows={3} label="Loading review history" />
          ) : logsError ? (
            <ErrorNotice message={logsError} onRetry={() => setLogsRetry(c => c + 1)} />
          ) : reviewLogs.length === 0 ? (
            <p className="font-inter text-[13px] italic text-gray-400">
              No status changes recorded yet.
            </p>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {reviewLogs.map((log, idx) => {
                const isLatest = idx === 0;
                const labelMap = {
                  pending: "New / Pending",
                  under_review: "Under Review",
                  approved: "Verified / Approved",
                  rejected: "Flagged / Rejected",
                  resubmission_required: "Resubmission Required",
                };
                const oldStatus = labelMap[log.old_status] || log.old_status || "Unknown";
                const newStatus = labelMap[log.new_status] || log.new_status || "Unknown";
                const author = log.changed_by_name || "Unknown Staff";
                const initials = author
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <li
                    key={log.log_id}
                    className="flex gap-5"
                    style={{ position: "relative", paddingBottom: idx < reviewLogs.length - 1 ? "20px" : 0 }}
                  >
                    <div aria-hidden="true" style={{ width: "18px", flex: "0 0 18px", position: "relative" }}>
                      {idx < reviewLogs.length - 1 && (
                        <span
                          style={{ position: "absolute", top: "16px", bottom: "-20px", left: "7px", width: "2px", background: "#d1d5db" }}
                        />
                      )}
                      <span
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "block",
                          width: "16px",
                          height: "16px",
                          marginTop: "3px",
                          borderRadius: "50%",
                          background: isLatest ? "#1a59a5" : "#9ca3af",
                          border: "3px solid #eff6ff",
                          boxShadow: isLatest ? "0 0 0 1px #bfdbfe" : "none",
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h5
                          className="m-0 font-inter font-bold text-[#142d55]"
                          style={{ fontSize: "15px", lineHeight: 1.3 }}
                        >
                          {newStatus}
                        </h5>
                        {isLatest && (
                          <span
                            className="rounded-full bg-[#ffc700] font-inter font-bold text-gray-900"
                            style={{ padding: "3px 9px", fontSize: "10px" }}
                          >
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="m-0 font-inter text-gray-500" style={{ marginTop: "4px", fontSize: "12px" }}>
                        {new Date(log.changed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                      {log.old_status !== log.new_status && (
                        <p className="m-0 font-inter text-gray-600" style={{ marginTop: "6px", fontSize: "13px" }}>
                          {oldStatus} <span aria-hidden="true">→</span> {newStatus}
                        </p>
                      )}

                      <AttachmentChangeNote change={log.attachment_change} />

                      <div className="flex items-center gap-3" style={{ marginTop: "10px" }}>
                        <div
                          className="flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-[#eef1f9] font-inter font-bold text-[#1f5cae]"
                          style={{ width: "36px", height: "36px", fontSize: "12px" }}
                        >
                          {log.changed_by_image_url ? (
                            <img
                              src={log.changed_by_image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : initials}
                        </div>
                        <div>
                          <p className="m-0 font-inter text-gray-500" style={{ fontSize: "11px" }}>Updated by</p>
                          <p className="m-0 font-inter font-bold text-[#142d55]" style={{ fontSize: "13px" }}>
                            {author}
                          </p>
                        </div>
                      </div>

                      {log.remarks_text?.trim() && (
                        <div className="mt-2 rounded-lg border border-[#dbe4f0] bg-[#f1f5fd] px-3 py-2.5">
                          <p className="m-0 font-inter text-[13px] leading-6 text-[#142d55]">{log.remarks_text}</p>
                          <ReviewReplyThread log={log} canReply={Boolean(log.can_reply)} />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
      {/* Notification / Alert Modal (Table palette styled) */}
      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={closeNotification}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="OK"
        onConfirm={closeNotification}
      />
      <DeleteSubmissionModal
        isOpen={showDeleteModal}
        submission={submissionDetails || submission}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={async () => {
          setShowDeleteModal(false);
          await invalidateAndGoBack();
        }}
      />
    </div>
  );
}
