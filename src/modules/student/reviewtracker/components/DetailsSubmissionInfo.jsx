import { FolderOpen, Mail, ClipboardList } from "lucide-react";

export default function DetailsSubmissionInfo({ submission }) {
  if (!submission) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e6ee",
        padding: "24px 28px",
        marginBottom: "20px",
      }}
    >
      {/* ---- Top row: title + ID/date ---- */}
      <div className="flex items-start justify-between mb-1">
        <p
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "11px", color: "#1A59A5" }}
        >
          Submission Details
        </p>
        <div className="text-right">
          <span
            className="inline-flex items-center font-inter font-bold"
            style={{
              fontSize: "11px",
              padding: "4px 12px",
              borderRadius: "6px",
              backgroundColor: "#edf2fb",
              border: "1px solid #b0c4de",
              color: "#1A59A5",
            }}
          >
            ID: #{submission.submission_id?.slice(0, 8).toUpperCase() || "N/A"}
          </span>
        </div>
      </div>

      <h3
        className="font-inter font-bold text-[#142d55]"
        style={{ fontSize: "18px", marginBottom: "4px" }}
      >
        {submission.title || "Untitled Document"}
      </h3>

      <p
        className="font-inter text-gray-500 text-right"
        style={{ fontSize: "12px", marginTop: "-20px", marginBottom: "8px" }}
      >
        Submitted: {formatDate(submission.submitted_at)}
      </p>

      <div className="flex items-center gap-2 mb-5">
        <FolderOpen
          style={{ width: "15px", height: "15px", color: "#6b7280" }}
        />
        <span
          className="font-inter font-medium text-gray-600"
          style={{ fontSize: "14px" }}
        >
          {submission.org_name || "Organization Pending"}
        </span>
      </div>

      {/* ---- Divider ---- */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#e2e6ee",
        }}
      />

      {/* ---- Submitter contact / mode ---- */}
      <div
        className="flex flex-wrap gap-12"
        style={{
          backgroundColor: "#f0f4fb",
          margin: "0 -28px -24px -28px",
          padding: "16px 28px 20px 28px",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <div>
          <p
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "11px", marginBottom: "6px", color: "#1A59A5" }}
          >
            Submitter Contact
          </p>
          <div className="flex items-center gap-2">
            <Mail style={{ width: "14px", height: "14px", color: "#6b7280" }} />
            <span
              className="font-inter font-medium text-gray-700"
              style={{ fontSize: "13px" }}
            >
              {submission.submitted_by_email ||
                submission.submitted_by_name ||
                "N/A"}
            </span>
          </div>
        </div>

        <div>
          <p
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "11px", marginBottom: "6px", color: "#1A59A5" }}
          >
            Category
          </p>
          <div className="flex items-center gap-2">
            <ClipboardList
              style={{ width: "14px", height: "14px", color: "#6b7280" }}
            />
            <span
              className="font-inter font-medium text-gray-700"
              style={{ fontSize: "13px" }}
            >
              {submission.category_name || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
