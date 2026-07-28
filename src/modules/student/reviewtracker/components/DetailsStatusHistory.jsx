import { useReviewLogs } from "../../../../hooks/useReviewLogs";
import { Loader2 } from "lucide-react";

export default function DetailsStatusHistory({ submissionId }) {
  // Fetch real timeline logs using the specific submission ID
  const { data, isLoading } = useReviewLogs({
    submissionId: submissionId,
    pageSize: 100, // Fetch enough to cover the whole history
  });

  const logs = data?.results || [];

  // Helper function to format status text nicely (e.g., "under_review" -> "Under Review")
  const formatStatus = (status) => {
    if (!status) return "Unknown Status";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to format date nicely (e.g., "Jan 24, 2026 · 02:45 PM")
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " ·");
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
        style={{
          backgroundColor: "#FFE452",
          padding: "12px 24px",
        }}
      >
        <h4
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "13px", color: "#1a1a1a" }}
        >
          Status History
        </h4>
      </div>

      {/* Timeline */}
      <div style={{ padding: "24px 28px" }}>
        {logs.length === 0 ? (
          <p className="font-inter text-gray-500 text-sm">
            No status history found for this submission.
          </p>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.review_log_id || index}
              className="flex gap-4"
              style={{ position: "relative" }}
            >
              {/* Dot + Line */}
              <div
                className="flex flex-col items-center"
                style={{ minWidth: "16px" }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "9999px",
                    // The newest log (index 0) gets the active blue dot
                    backgroundColor: index === 0 ? "#1A59A5" : "#9ca3af",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
                {index < logs.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      backgroundColor: "#e2e6ee",
                      marginTop: "4px",
                      marginBottom: "4px",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div
                style={{
                  paddingBottom: index < logs.length - 1 ? "24px" : "0",
                }}
              >
                <h5
                  className="font-inter font-bold text-[#142d55]"
                  style={{ fontSize: "15px", lineHeight: 1.3 }}
                >
                  {formatStatus(log.new_status)}
                </h5>
                <p
                  className="font-inter text-gray-400"
                  style={{ fontSize: "12px", marginTop: "2px" }}
                >
                  {formatDate(log.changed_at)}
                </p>
                {/* Render comments if the backend staff provided any during status change */}
                {log.comments && (
                  <p
                    className="font-inter text-gray-600"
                    style={{
                      fontSize: "13px",
                      marginTop: "8px",
                      lineHeight: 1.5,
                    }}
                  >
                    {log.comments}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
