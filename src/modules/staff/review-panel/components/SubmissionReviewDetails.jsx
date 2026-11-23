import "./SubmissionReviewDetails.css";
import BackButton from "../../../../components/BackButton";
import defaultAvatar from "../../../../assets/shared/default_user.webp";
import SubmissionPass from "../../../../components/SubmissionPass";
import SubmissionDetailsPanel from "../../../../components/SubmissionDetailsPanel";
import VistaSelect from "../../../../components/VistaSelect";
import { PanelSkeleton, Skeleton } from "../../../../components/loading/Skeleton";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import ErrorNotice from "../../../../components/ErrorNotice";
import { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  Loader2,
  Trash2,
  History,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../../../services/userService";
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
import { REALTIME_UPDATE } from "../../../../services/realtimeQueries";
import { getSubmissionPresentation } from "../../../../config/submissionPresentation";

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
  const [detailsAccessDenied, setDetailsAccessDenied] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [detailsRetry, setDetailsRetry] = useState(0);
  const [logsRetry, setLogsRetry] = useState(0);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const draftEdits = useRef({ id: null, status: false, remarks: false });
  const loadedLogsFor = useRef(null);
  const [liveRevision, setLiveRevision] = useState(0);
  const submissionId = submission?.id;
  const submitterId = submissionDetails?.submitted_by;
  const submitterEmail = submissionDetails?.submitted_by_email;
  const { data: submitter, isLoading: isLoadingSubmitter } = useQuery({
    queryKey: ["users", "submission-submitter", submitterId, submitterEmail],
    enabled: Boolean(submitterId && submitterEmail),
    queryFn: async ({ signal }) => {
      const page = await userService.getUsers({ search: submitterEmail, pageSize: 50, signal });
      return page.results.find(user => String(user.user_id) === String(submitterId)) ?? null;
    },
    staleTime: 30_000,
    retry: false,
  });
  const savedStatus = submissionDetails?.status;
  const displaySubmission = submissionDetails ? {
    ...submission,
    id: submissionDetails.submission_id,
    title: submissionDetails.title || "Untitled Document",
    site: submissionDetails.org_name || submission?.site || "Unknown organization",
    documentType: submissionDetails.doc_type_name || submission?.documentType || "N/A",
    contactEmail: submissionDetails.submitted_by_email
      ? `${submissionDetails.submitted_by_name || ""} (${submissionDetails.submitted_by_email})`.trim()
      : submissionDetails.submitted_by_name || submission?.contactEmail || "N/A",
    submittedDate: submissionDetails.submitted_at
      ? new Date(submissionDetails.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : submission?.submittedDate || "N/A",
  } : submission;
  // The API exposes persisted DriveArchive records only after a successful upload
  // with a Drive file identity. Approval or a temporary URL is not confirmation.
  const hasConfirmedArchive = submissionDetails?.drive_archives?.some(
    archive => archive.archive_id && archive.drive_file_id && archive.archived_at,
  );
  const showAttachmentPanel = isLoadingDetails || Boolean(detailsError)
    || Boolean(submissionDetails?.documents?.length) || !hasConfirmedArchive;
  const statusLabel = savedStatus ? getSubmissionPresentation(savedStatus).label
    : (isLoadingDetails ? "Loading status…" : "Status unavailable");

  useEffect(() => {
    const refresh = ({ detail }) => {
      if (detail.recover || detail.submissionIds.includes(String(submissionId))) {
        setLiveRevision(value => value + 1);
      }
    };
    const refreshLogs = () => { if (!document.hidden) setLogsRetry(value => value + 1); };
    const afterReply = ({ detail }) => { if (String(detail?.submissionId) === String(submissionId)) refreshLogs(); };
    const timer = window.setInterval(refreshLogs, 20_000);
    window.addEventListener(REALTIME_UPDATE, refresh);
    window.addEventListener("vista:review-logs-updated", afterReply);
    document.addEventListener("visibilitychange", refreshLogs);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(REALTIME_UPDATE, refresh);
      window.removeEventListener("vista:review-logs-updated", afterReply);
      document.removeEventListener("visibilitychange", refreshLogs);
    };
  }, [submissionId]);

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
    const initial = draftEdits.current.id !== submissionId;
    if (initial) {
      draftEdits.current = { id: submissionId, status: false, remarks: false, priority: false };
      setStatusAction(STATUS_ACTIONS[0]);
      setRemarks("");
    }
    async function fetchFullDetails() {
      if (!submissionId) return;
      try {
        if (initial) setIsLoadingDetails(true);
        setDetailsError("");
        if (initial) setSubmissionDetails(null);
        const data = await submissionService.getSubmissionById(submissionId);
        if (cancelled) return;
        setSubmissionDetails(data);
        setDetailsAccessDenied(false);
        if (!draftEdits.current.priority) setPriorityEscalation(Boolean(data?.priority_escalation));
        if (!draftEdits.current.status) {
          setStatusAction(Object.keys(ACTION_TO_STATUS_MAP).find(action => ACTION_TO_STATUS_MAP[action] === data.status) || STATUS_ACTIONS[0]);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch full submission details:", error);
        if ([401, 403, 404].includes(error?.response?.status)) setDetailsAccessDenied(true);
        setDetailsError("Could not load the submission files. Please try again.");
      } finally {
        if (!cancelled) setIsLoadingDetails(false);
      }
    }
    fetchFullDetails();
    return () => { cancelled = true; };
  }, [submissionId, detailsRetry, liveRevision]);

  useEffect(() => {
    let cancelled = false;
    const initial = loadedLogsFor.current !== submissionId;
    loadedLogsFor.current = submissionId;
    async function fetchLogs() {
      if (!submissionId) return;
      try {
        if (initial) setIsLoadingLogs(true);
        setLogsError("");
        if (initial) setReviewLogs([]);
        const data = await reviewLogService.getReviewLogs({
          submissionId,
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
  }, [submissionId, logsRetry, liveRevision]);

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
  if (detailsAccessDenied) return <div className="space-y-4"><ErrorNotice message="This submission is unavailable or you no longer have access." /><button data-ui="secondary" type="button" onClick={onBack}>Return to Review Panel</button></div>;

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
          <BackButton onClick={onBack} />
          <span className="font-inter font-medium text-gray-500" style={{ fontSize: "13.5px" }}>
            Review panel details.
          </span>
        </div>
        {isLoadingDetails ? <Skeleton width={120} height={42} /> : <ActionButton aria-busy={Boolean(isSubmitting)} variant="destructive"
          onClick={() => setShowDeleteModal(true)}
          label="Delete Entry"
          icon={<Trash2 size={13} aria-hidden="true" />}
          disabled={isSubmitting}
          className="disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontSize: "13px", padding: "8px 14px", borderRadius: "var(--radius-chip)", cursor: isSubmitting ? "not-allowed" : "pointer" }}
        />}
      </div>

      <div className="submission-review-bento">
        <div className="submission-review-column submission-review-column--details">
          <section className="submission-primary" aria-labelledby="submission-pass-title">
            <SubmissionDetailsPanel
              submission={displaySubmission}
              avatarUrl={submitter?.image_url}
              organizationAvatarUrl={submissionDetails?.org_image_url}
              submitterLoading={isLoadingSubmitter}
              loading={isLoadingDetails}
              submitterName={submissionDetails?.submitted_by_name}
              submitterEmail={submissionDetails?.submitted_by_email}
              status={savedStatus}
              statusLabel={statusLabel}
              titleId="submission-pass-title"
              academicYear={submissionDetails?.academic_year}
              category={submissionDetails?.category_name}
              description={submissionDetails?.description}
            >
              {showAttachmentPanel && <div className="submission-pass__attachments">
                <p
                  className="submission-pass__attachment-label"
                  style={{ fontSize: "11px", marginBottom: "10px" }}
                >
                  Attached Files
                </p>

                {detailsError ? (
                  <ErrorNotice message={detailsError} onRetry={() => setDetailsRetry(c => c + 1)} />
                ) : submissionDetails?.documents?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {submissionDetails.documents.map((doc, idx) => (
                      <div
                        key={doc.document_id || doc.id || idx}
                        className="submission-pass__file-row flex items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="vista-plain-icon submission-pass__file-icon"><FileText className="h-4 w-4" /></span>
                          {doc.file_url ? (
                            <AttachmentImagePreview
                              fileUrl={doc.file_url}
                              fileName={doc.file_name || `Document ${idx + 1}`}
                              mimeType={doc.mime_type}
                              triggerLabel={doc.file_name || `Document ${idx + 1}`}
                              triggerClassName="submission-pass__attachment-preview min-w-0 text-left font-inter"
                            />
                          ) : (
                            <span className="submission-pass__file-unavailable font-inter text-[13.5px]">{doc.file_name || `Document ${idx + 1}`} — file link unavailable</span>
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
                              className="submission-pass__download inline-flex items-center gap-1 rounded px-2 py-1.5 font-inter text-[11px] font-semibold border transition active:scale-95 flex-shrink-0"
                            >
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="submission-pass__empty">
                    <FileText size={20} aria-hidden="true" />
                    <span className="font-inter text-[13px] italic">
                      No files attached to this submission.
                    </span>
                  </div>
                )}
              </div>}
            </SubmissionDetailsPanel>
          </section>      <div
            className="submission-review-history vista-surface w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div
              className="vista-panel-heading flex flex-wrap items-center justify-between gap-3"
              style={{ padding: "16px 20px" }}
            >
              <div className="flex items-center gap-3">
                <History size={16} color="#ffffff" aria-hidden="true" />
                <h4
                  className="m-0 font-inter font-extrabold text-white"
                  style={{ fontSize: "var(--type-heading)", letterSpacing: "-0.01em" }}
                >
                  Status History
                </h4>
              </div>
              {isLoadingLogs ? <Skeleton width={70} height={22} /> : <span
                className="rounded-full font-inter font-extrabold text-gray-900"
                style={{ background: "var(--ui-yellow)", padding: "3px 10px", fontSize: "10px" }}
              >
                {reviewLogs.length} {reviewLogs.length === 1 ? "update" : "updates"}
              </span>}
            </div>

            <div style={{ padding: "18px 24px" }}>
              {isLoadingLogs ? (
                <PanelSkeleton kind="timeline" framed={false} rows={3} label="Loading review history" />
              ) : logsError && reviewLogs.length === 0 ? (
                <ErrorNotice message={logsError} onRetry={() => setLogsRetry(c => c + 1)} />
              ) : reviewLogs.length === 0 ? (
                <p className="font-inter text-[13px] italic text-gray-400">
                  No status changes recorded yet.
                </p>
              ) : (
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {reviewLogs.map((log, idx) => {
                    const isLatest = idx === 0;
                    const oldStatus = getSubmissionPresentation(log.old_status).label;
                    const newStatus = getSubmissionPresentation(log.new_status).label;
                    const author = log.changed_by_name || "Unknown Staff";

                    return (
                      <li
                        key={log.log_id}
                        className="flex gap-5"
                        style={{ position: "relative", paddingBottom: idx < reviewLogs.length - 1 ? "20px" : 0 }}
                      >
                        <div aria-hidden="true" style={{ width: "18px", flex: "0 0 18px", position: "relative" }}>
                          {idx < reviewLogs.length - 1 && (
                            <span
                              style={{ position: "absolute", top: "16px", bottom: "-20px", left: "7px", width: "2px", background: "var(--ui-border)" }}
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
                              background: isLatest ? "var(--ui-blue)" : "var(--ui-muted)",
                              border: "3px solid var(--ui-selected)",
                              boxShadow: isLatest ? "0 0 0 1px var(--ui-blue)" : "none",
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
                                className="rounded-full bg-[var(--ui-yellow)] font-inter font-bold text-gray-900"
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

                          <AttachmentChangeNote change={log.attachment_change} currentDocuments={submissionDetails?.documents ?? []} />

                          <div className="flex items-center gap-3" style={{ marginTop: "10px" }}>
                            <div
                              className="flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-[#eef1f9] font-inter font-bold text-[#1f5cae]"
                              style={{ width: "36px", height: "36px", fontSize: "12px" }}
                            >
                                <img
                                  src={log.changed_by_image_url || defaultAvatar}
                                  alt=""
                                  onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = defaultAvatar; }}
                                  className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                              <p className="m-0 font-inter text-gray-500" style={{ fontSize: "11px" }}>Updated by</p>
                              <p className="m-0 font-inter font-bold text-[#142d55]" style={{ fontSize: "13px" }}>
                                {author}
                              </p>
                            </div>
                          </div>

                          {log.remarks_text?.trim() && (
                            <div
                              style={{
                                marginTop: "10px",
                                padding: "9px 12px",
                                borderRadius: "var(--radius-field)",
                                border: "1px solid var(--ui-border)",
                                background: "var(--ui-field)",
                              }}
                            >
                              <p className="m-0 font-inter font-semibold text-gray-600" style={{ fontSize: "12px" }}>
                                Remarks &amp; feedback
                              </p>
                              <p className="m-0 font-inter text-[#142d55]" style={{ marginTop: "4px", fontSize: "13px", lineHeight: 1.45 }}>
                                {log.remarks_text}
                              </p>
                            </div>
                          )}
                          {log.remarks_text?.trim() && <ReviewReplyThread log={log} canReply={Boolean(log.can_reply)} />}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>
        <div className="submission-review-column submission-review-column--actions">
          <section className="submission-pass" aria-label="Submission summary"><SubmissionPass compact submission={displaySubmission} organizationAvatarUrl={submissionDetails?.org_image_url} loading={isLoadingDetails} status={savedStatus} statusLabel={statusLabel} category={submissionDetails?.category_name} /></section>
          <div
            className="submission-review-decision vista-surface submission-detail-card w-full rounded-xl border border-gray-200 bg-white shadow-sm"
            style={{ padding: "24px" }}
          >
            {isLoadingDetails || isLoadingLogs ? <PanelSkeleton kind="decision" framed={false} label="Loading decision panel" /> : <>
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
                onChange={(e) => { draftEdits.current.priority = true; setPriorityEscalation(e.target.checked); }}
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
              <button aria-busy={Boolean(isSubmitting)} data-ui="primary"
                type="button"
                onClick={handleOpenConfirmModal}
                disabled={isSubmitting || isLoadingDetails || isLoadingLogs || Boolean(detailsError || logsError)}
                className="inline-flex w-full items-center justify-center gap-2 font-inter font-bold transition hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{  }}
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
            </>}
          </div>

          <DriveArchiveCard
            archives={submissionDetails?.drive_archives ?? []}
            handledBy={reviewLogs.find((log) => log.new_status === "approved")}
          />

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
              borderRadius: "var(--radius-chip)",
              background: "#f7faff",
            }}
          >
            <p style={{ margin: 0, color: "var(--ui-muted)", fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
              Submission
            </p>
            <p style={{ margin: "5px 0 0", color: "var(--ui-text)", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700 }}>
              {submission.title || "Untitled submission"}
            </p>
            <p style={{ margin: "5px 0 0", color: "var(--ui-muted)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "11px", overflowWrap: "anywhere" }}>
              Reference ID: {submission.id || "Unavailable"}
            </p>
          </div>
          <div>
            <label htmlFor="return-submission-confirmation" style={{ display: "block", marginBottom: "6px", color: "#374151", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600 }}>
              Type RETURNED to confirm <span style={{ color: "#b4232f" }}>*</span>
            </label>
            <input
              id="return-submission-confirmation"
              type="text"
              value={returnConfirmation}
              onChange={(event) => setReturnConfirmation(event.target.value)}
              autoComplete="off"
              disabled={isSubmitting}
              style={{ display: "block", boxSizing: "border-box", width: "100%", padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-field)", backgroundColor: "var(--ui-surface)", color: "#1f2937", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "13px", outlineColor: "#1f5cae" }}
            />
          </div>
        </div>
      </StatusModal>

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
