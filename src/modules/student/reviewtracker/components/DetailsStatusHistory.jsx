import { History } from "lucide-react";
import defaultAvatar from "../../../../assets/shared/default_user.webp";
import { PanelSkeleton } from "../../../../components/loading/Skeleton";
import { useReviewLogs } from "../../../../hooks/useReviewLogs";
import AttachmentChangeNote from "../../../../components/AttachmentChangeNote";
import ReviewReplyThread from "../../../../components/ReviewReplyThread";

export default function DetailsStatusHistory({ submissionId }) {
  const { data, isLoading } = useReviewLogs({ submissionId, pageSize: 100 });
  const logs = data?.results || [];

  const formatStatus = (status) => {
    if (!status) return "Unknown Status";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) return <PanelSkeleton kind="timeline" label="Loading status history" />;

  return (
    <section
      className="submission-history-panel"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e6ee",
        overflow: "hidden",
        marginBottom: "20px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
      }}
      aria-labelledby="submission-status-history-heading"
    >
      <div
        className="detail-panel-heading flex flex-wrap items-center justify-between gap-3"
        style={{ backgroundColor: "#1f5cae", padding: "11px 20px" }}
      >
        <div className="flex items-center gap-3">
          <History size={16} color="#ffffff" aria-hidden="true" />
          <h4
            id="submission-status-history-heading"
            className="font-inter font-bold text-white"
            style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Status history
          </h4>
        </div>
        <span
          className="rounded-full font-inter font-extrabold text-gray-900"
          style={{ backgroundColor: "#ffc700", padding: "3px 10px", fontSize: "10px" }}
        >
          {logs.length} {logs.length === 1 ? "update" : "updates"}
        </span>
      </div>

      <div className="detail-panel-body" style={{ padding: "18px 24px" }}>
        {logs.length === 0 ? (
          <p className="font-inter text-sm text-gray-500">
            No status history found for this submission.
          </p>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {logs.map((log, index) => {
              const isLatest = index === 0;
              const author = log.changed_by_name || "OSA Staff Member";
              return (
                <li
                  key={log.review_log_id || log.log_id || index}
                  className="flex gap-5"
                  style={{ position: "relative", paddingBottom: index < logs.length - 1 ? "20px" : 0 }}
                >
                  <div
                    aria-hidden="true"
                    style={{ width: "18px", flex: "0 0 18px", position: "relative" }}
                  >
                    {index < logs.length - 1 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "16px",
                          bottom: "-20px",
                          left: "7px",
                          width: "2px",
                          backgroundColor: "#d1d5db",
                        }}
                      />
                    )}
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "block",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: isLatest ? "#1a59a5" : "#9ca3af",
                        border: "3px solid #eff6ff",
                        boxShadow: isLatest ? "0 0 0 1px #bfdbfe" : "none",
                        marginTop: "3px",
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h5
                        className="m-0 font-inter font-bold text-[#142d55]"
                        style={{ fontSize: "15px", lineHeight: 1.3 }}
                      >
                        {formatStatus(log.new_status)}
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
                    <p
                      className="font-inter text-gray-500"
                      style={{ margin: "4px 0 0", fontSize: "12px" }}
                    >
                      {formatDate(log.changed_at)}
                    </p>
                    {log.old_status !== log.new_status && (
                      <p
                        className="font-inter text-gray-600"
                        style={{ margin: "6px 0 0", fontSize: "13px" }}
                      >
                        {formatStatus(log.old_status)} <span aria-hidden="true">→</span> {formatStatus(log.new_status)}
                      </p>
                    )}

                    <AttachmentChangeNote change={log.attachment_change} />

                    <div className="flex items-center gap-3" style={{ marginTop: "10px" }}>
                      <img
                        src={log.changed_by_image_url || defaultAvatar}
                        alt=""
                        style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                      />
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
                          borderRadius: "10px",
                          border: "1px solid #dbe4f0",
                          backgroundColor: "#f1f5fd",
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
                    <ReviewReplyThread log={log} submissionId={submissionId} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
