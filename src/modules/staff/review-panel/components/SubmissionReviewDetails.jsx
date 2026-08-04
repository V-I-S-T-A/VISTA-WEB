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
import { submissionService } from "../../../../services/submissionService";

const STATUS_ACTIONS = [
  "Select Action...",
  "Start Review Process",
  "Mark as Verified",
  "Mark as Flagged",
  "Return for Revision",
  "Approve Submission",
  "Reject Submission",
];

const ACTION_TO_STATUS_MAP = {
  "Start Review Process": "under_review",
  "Approve Submission": "approved",
  "Mark as Flagged": "rejected",
  "Reject Submission": "rejected",
  "Return for Revision": "resubmission_required",
};

export default function SubmissionReviewDetails({ submission, onBack }) {
  const [statusAction, setStatusAction] = useState(STATUS_ACTIONS[0]);
  const [remarks, setRemarks] = useState("");
  const [priorityEscalation, setPriorityEscalation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state to hold the fully fetched submission (including documents)
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Fetch full details when the component mounts
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

  if (!submission) return null;

  async function handleSubmitDecision() {
    if (statusAction === STATUS_ACTIONS[0]) {
      alert("Please select a valid action from the dropdown.");
      return;
    }

    setIsSubmitting(true);

    try {
      const backendStatus = ACTION_TO_STATUS_MAP[statusAction];

      // Call the backend API to update status and save the remarks log
      await submissionService.updateStatus(
        submission.id,
        backendStatus,
        remarks,
      );

      // Optional: Add priority escalation logic here if the backend supports it later
      if (priorityEscalation) {
        console.log("Priority Escalation triggered for:", submission.id);
      }

      alert("Decision submitted successfully!");
      onBack(); // Return to the table view automatically
    } catch (error) {
      console.error("Submission error:", error);

      // THIS WILL TELL US EXACTLY WHAT IS WRONG:
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
      {/* Back row */}
      <div
        className="flex items-center gap-3"
        style={{ paddingBottom: "20px" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-full font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
          style={{
            fontSize: "12.5px",
            padding: "6px 14px",
            backgroundColor: "#ffc700",
          }}
        >
          <ChevronLeft
            style={{ width: "13px", height: "13px" }}
            aria-hidden="true"
          />
          Back
        </button>
        <span
          className="font-inter font-medium text-gray-500"
          style={{ fontSize: "13.5px" }}
        >
          Review panel details.
        </span>
      </div>

      {/* Submission details card */}
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

        {/* --- ATTACHED DOCUMENTS SECTION --- */}
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
                  <a
                    href={doc.file} // This binds to the file URL from Django
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

      {/* Decision panel card */}
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
            onClick={handleSubmitDecision}
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
    </div>
  );
}
