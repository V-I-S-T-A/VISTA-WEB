import defaultAvatar from "../../../../assets/shared/default_user.jpg";
import { useReviewLogs } from "../../../../hooks/useReviewLogs";
import { Loader2 } from "lucide-react";

export default function DetailsStaffRemarks({ submissionId }) {
  // 1. Fetch real logs for this specific submission
  const { data, isLoading } = useReviewLogs({
    submissionId: submissionId,
    pageSize: 100,
  });

  // 2. Filter out logs that don't have any remarks
  const rawLogs = data?.results || [];
  const remarks = rawLogs.filter(
    (log) => log.remarks_text && log.remarks_text.trim() !== "",
  );

  // Helper to format date perfectly (e.g., "Jan 22, 10:15 AM")
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart}, ${timePart}`;
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e6ee",
          marginBottom: "20px",
          padding: "40px",
        }}
      >
        <Loader2 className="animate-spin h-8 w-8 text-[#1A59A5]" />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e6ee",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* Yellow header bar */}
      <div
        className="flex items-center justify-between"
        style={{
          backgroundColor: "#1A59A5",
          padding: "12px 24px",
        }}
      >
        <h4
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "13px", color: "white" }}
        >
          Staff Remarks & Feedbacks
        </h4>
        <span
          className="inline-flex items-center font-inter font-bold text-#1a1a1a"
          style={{
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "6px",
            backgroundColor: "#FFE452",
          }}
        >
          {remarks.length} UPDATE{remarks.length !== 1 ? "S" : ""}
        </span>
      </div>

      {/* Remarks list */}
      <div style={{ padding: "20px 28px" }}>
        {remarks.length === 0 ? (
          <p className="font-inter text-gray-500 text-sm">
            No remarks or feedback provided yet.
          </p>
        ) : (
          remarks.map((remark, index) => (
            <div
              key={remark.review_log_id || index}
              style={{
                marginBottom: index < remarks.length - 1 ? "20px" : "0",
              }}
            >
              {/* Author row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={defaultAvatar} // Kept your default avatar
                    alt="Staff Avatar"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "9999px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <p
                      className="font-inter font-bold text-[#142d55]"
                      style={{ fontSize: "14px", lineHeight: 1.2 }}
                    >
                      {remark.changed_by_name || "OSA Staff Member"}
                    </p>
                    <p
                      className="font-inter font-bold uppercase tracking-wider text-gray-400"
                      style={{ fontSize: "10px" }}
                    >
                      {remark.changed_by_role || "OSA STAFF"}
                    </p>
                  </div>
                </div>
                <p
                  className="font-inter text-gray-400"
                  style={{ fontSize: "12px" }}
                >
                  {formatDateTime(remark.changed_at)}
                </p>
              </div>

              {/* Message */}
              <div
                style={{
                  backgroundColor: "#edf2fb",
                  borderRadius: "8px",
                  border: "1px solid #dbe4f0",
                  padding: "16px 20px",
                  marginLeft: "48px",
                }}
              >
                <p
                  className="font-inter text-[#142d55]"
                  style={{ fontSize: "14px", lineHeight: 1.6 }}
                >
                  {remark.remarks_text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
