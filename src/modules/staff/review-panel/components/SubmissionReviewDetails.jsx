import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Building2,
  Mail,
  FileText,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { submissionService } from "../../../../services/submissionService";
import { reviewLogService } from "../../../../services/reviewLogService";
import ConfirmDriveSyncModal from "./modals/ConfirmDriveSyncModal";

const STATUS_ACTIONS = [
  "Select Action...",
  "Start Review Process",
  "Mark as Verified",
  "Mark as Flagged",
  "Return for Revision",
  "Reject Submission",
];

const ACTION_TO_STATUS_MAP = {
  "Start Review Process": "under_review",
  "Mark as Verified": "approved",
  "Mark as Flagged": "rejected",
  "Reject Submission": "rejected",
  "Return for Revision": "resubmission_required",
};

// Only show Drive modal when marking as verified (approved)
const REQUIRES_DRIVE_CONFIRM = new Set(["Mark as Verified"]);

export default function SubmissionReviewDetails({ submission, onBack }) {
  const queryClient = useQueryClient();
  const [statusAction, setStatusAction] = useState(STATUS_ACTIONS[0]);
  const [remarks, setRemarks] = useState("");
  const [priorityEscalation, setPriorityEscalation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    async function fetchFullDetails() {
      if (!submission?.id) return;
      try {
        setIsLoadingDetails(true);
        const data = await submissionService.getSubmissionById(submission.id);
        setSubmissionDetails(data);
      } catch (error) {
        console.error("Failed to fetch full submission details:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    }
    fetchFullDetails();
  }, [submission]);

  useEffect(() => {
    async function fetchLogs() {
      if (!submission?.id) return;
      try {
        setIsLoadingLogs(true);
        const data = await reviewLogService.getReviewLogs({
          submissionId: submission.id,
          pageSize: 50,
        });
        setReviewLogs(data?.results ?? []);
      } catch (error) {
        console.error("Failed to fetch review logs:", error);
      } finally {
        setIsLoadingLogs(false);
      }
    }
    fetchLogs();
  }, [submission]);

  if (!submission) return null;

  function handleOpenConfirmModal() {
    if (statusAction === STATUS_ACTIONS[0]) {
      alert("Please select a valid action from the dropdown.");
      return;
    }
    // Only show Drive folder modal when marking as Verified (approved)
    if (REQUIRES_DRIVE_CONFIRM.has(statusAction)) {
      setShowConfirmModal(true);
    } else {
      handleSubmitDecision();
    }
  }

  async function invalidateAndGoBack() {
    // Invalidate all submission-related queries so Recent Submissions & Review Panel refresh
    await queryClient.invalidateQueries({ queryKey: ["submissions"] });
    await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    onBack();
  }

  async function handleSubmitDecision() {
    setIsSubmitting(true);
    try {
      const backendStatus = ACTION_TO_STATUS_MAP[statusAction];
      await submissionService.updateStatus(submission.id, backendStatus, remarks);
      alert("Decision submitted successfully!");
      await invalidateAndGoBack();
    } catch (error) {
      console.error("Submission error:", error);
      const backendError = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      alert(`Backend Error:\n\n${backendError}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalSubmitDecision(driveFolderData) {
    setIsSubmitting(true);
    try {
      const backendStatus = ACTION_TO_STATUS_MAP[statusAction];
      await submissionService.updateStatus(submission.id, backendStatus, remarks);
      alert("Submission verified and synced to Google Drive!");
      setShowConfirmModal(false);
      await invalidateAndGoBack();
    } catch (error) {
      console.error("Submission error:", error);
      const backendError = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      alert(`Backend Error:\n\n${backendError}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div
        className="flex items-center gap-3"
        style={{ paddingBottom: "20px" }}
      >
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
            <span style={{ fontSize: "16px", lineHeight: "20px", marginRight: "4px" }}>›</span>
            Back
          </span>
        </button>
        <span
          className="font-inter font-medium text-gray-500"
          style={{ fontSize: "13.5px" }}
        >
          Review panel details.
        </span>
      </div>

      <div
        className="w-full rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <div className="flex items-start justify-between gap-4">
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
            <div className="flex items-center gap-2 font-inter text-[13px] text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching documents...
            </div>
          ) : submissionDetails?.documents?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {submissionDetails.documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#eaf1ff]">
                      <FileText className="h-4 w-4 text-[#1d4ed8]" />
                    </div>
                    <span className="truncate font-inter text-[13.5px] font-semibold text-gray-800">
                      {doc.file_name || `Document ${idx + 1}`}
                    </span>
                  </div>
                  {/* FIXED: Uses doc.file_url */}
                  <a
                    href={doc.file_url || "#"}
                    onClick={(e) => {
                      if (!doc.file_url) {
                        e.preventDefault();
                        alert(
                          "Error: This file's URL is missing from the database.",
                        );
                      }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 font-inter text-[11.5px] font-bold text-[#1f5cae] border border-gray-200 transition hover:bg-gray-100 active:scale-95 flex-shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    VIEW FILE
                  </a>
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

      <div
        className="w-full rounded-xl border border-gray-200 bg-white shadow-sm"
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
          <select
            value={statusAction}
            onChange={(e) => setStatusAction(e.target.value)}
            disabled={isSubmitting}
            className="w-full appearance-none rounded-lg bg-[#eef1f9] font-inter font-bold text-gray-800 outline-none cursor-pointer disabled:opacity-70"
            style={{ fontSize: "14px", padding: "12px 40px 12px 14px" }}
          >
            {STATUS_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
        </div>

        <label
          className="font-inter font-bold uppercase tracking-wider text-gray-500"
          style={{ fontSize: "11.5px" }}
        >
          Reviewer Remarks
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={isSubmitting}
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
            disabled={isSubmitting}
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
        statusAction={statusAction}
        remarks={remarks}
      />

      {/* ── STATUS HISTORY ─────────────────────────────────────────── */}
      <div
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ marginTop: "20px" }}
      >
        {/* Yellow header band */}
        <div
          style={{
            background: "#ffc700",
            padding: "12px 20px",
          }}
        >
          <h4
            className="font-inter font-extrabold uppercase tracking-widest text-gray-900"
            style={{ fontSize: "12px" }}
          >
            Status History
          </h4>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {isLoadingLogs ? (
            <div className="flex items-center gap-2 font-inter text-[13px] text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          ) : reviewLogs.length === 0 ? (
            <p className="font-inter text-[13px] italic text-gray-400">
              No status changes recorded yet.
            </p>
          ) : (
            <ol className="relative" style={{ paddingLeft: "20px" }}>
              {reviewLogs.map((log, idx) => {
                const isFirst = idx === 0;
                const labelMap = {
                  pending: "New / Pending",
                  under_review: "Under Review",
                  approved: "Verified / Approved",
                  rejected: "Flagged / Rejected",
                  resubmission_required: "Resubmission Required",
                };
                return (
                  <li
                    key={log.log_id}
                    className="relative"
                    style={{ paddingBottom: "20px" }}
                  >
                    {/* Timeline vertical line */}
                    {idx < reviewLogs.length - 1 && (
                      <span
                        className="absolute left-0 top-3"
                        style={{
                          width: "1px",
                          bottom: 0,
                          background: "#d1d5db",
                          transform: "translateX(-50%)",
                        }}
                      />
                    )}
                    {/* Timeline dot */}
                    <span
                      className="absolute rounded-full"
                      style={{
                        width: "10px",
                        height: "10px",
                        left: 0,
                        top: "4px",
                        transform: "translateX(-50%)",
                        background: isFirst ? "#3b82f6" : "#9ca3af",
                        border: "2px solid white",
                        boxShadow: isFirst ? "0 0 0 2px #93c5fd" : "none",
                      }}
                    />
                    <div style={{ paddingLeft: "16px" }}>
                      <p
                        className="font-inter font-bold text-gray-900"
                        style={{
                          fontSize: "13.5px",
                          color: isFirst ? "#1d4ed8" : "#374151",
                        }}
                      >
                        {labelMap[log.new_status] || log.new_status}
                      </p>
                      <p
                        className="font-inter text-gray-400"
                        style={{ fontSize: "11.5px", marginTop: "1px" }}
                      >
                        {new Date(log.changed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                        {log.changed_by_name ? ` · ${log.changed_by_name}` : ""}
                      </p>
                      {log.remarks_text && (
                        <p
                          className="font-inter text-gray-600"
                          style={{ fontSize: "13px", marginTop: "6px" }}
                        >
                          {log.remarks_text}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* ── STAFF REMARKS & FEEDBACKS ──────────────────────────────── */}
      {reviewLogs.some((l) => l.remarks_text) && (
        <div
          className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          style={{ marginTop: "16px" }}
        >
          {/* Blue header band */}
          <div
            className="flex items-center justify-between"
            style={{
              background: "#1f5cae",
              padding: "12px 20px",
            }}
          >
            <h4
              className="font-inter font-extrabold uppercase tracking-widest text-white"
              style={{ fontSize: "12px" }}
            >
              Staff Remarks &amp; Feedbacks
            </h4>
            {/* update badge */}
            <span
              className="inline-flex items-center rounded-full font-inter font-extrabold text-gray-900"
              style={{
                background: "#ffc700",
                fontSize: "11px",
                padding: "3px 10px",
              }}
            >
              {reviewLogs.filter((l) => l.remarks_text).length} UPDATE
              {reviewLogs.filter((l) => l.remarks_text).length !== 1 ? "S" : ""}
            </span>
          </div>

          <div style={{ padding: "16px 20px" }} className="flex flex-col gap-4">
            {reviewLogs
              .filter((l) => l.remarks_text)
              .map((log) => (
                <div key={log.log_id} className="flex gap-3">
                  {/* Avatar placeholder */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#eef1f9] font-inter font-bold text-[#1f5cae]"
                    style={{ width: "38px", height: "38px", fontSize: "13px" }}
                  >
                    {log.changed_by_name
                      ? log.changed_by_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div>
                        <span
                          className="font-inter font-bold text-gray-900"
                          style={{ fontSize: "13.5px" }}
                        >
                          {log.changed_by_name || "Unknown Staff"}
                        </span>
                      </div>
                      <span
                        className="font-inter text-gray-400 flex-shrink-0"
                        style={{ fontSize: "11.5px" }}
                      >
                        {new Date(log.changed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div
                      className="rounded-lg bg-gray-50 border border-gray-200 font-inter text-gray-700"
                      style={{
                        fontSize: "13px",
                        padding: "10px 14px",
                        marginTop: "6px",
                      }}
                    >
                      {log.remarks_text}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
