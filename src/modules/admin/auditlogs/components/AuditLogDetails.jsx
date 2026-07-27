import { User, Calendar } from "lucide-react";
import LogDetailsHeader from "./LogDetailsHeader";
import LogDetailsEventSummary from "./LogDetailsEventSummary";
import LogDetailsTimeline from "./LogDetailsTimeline";

export default function AuditLogDetails({ log, onBack }) {
  if (!log) return null;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tzPart = d.toLocaleTimeString("en-US", { timeZoneName: 'short' }).split(' ')[2] || "GMT+8";
    return `${datePart} · ${timePart} ${tzPart}`;
  };

  const actionDisplay = log.action ? log.action.toUpperCase() : "UNKNOWN_ACTION";
  
  // Format the action to a readable title (e.g., "SUBMISSION_APPROVED" -> "Submission Approved")
  const titleDisplay = log.action 
    ? log.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : "Event Detail";

  return (
    <div className="w-full">
      <LogDetailsHeader onBack={onBack} />

      {/* Main Info Section (Not in a card, matching the image) */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          className="font-inter font-bold text-[#142d55]"
          style={{ fontSize: "32px", marginBottom: "12px", lineHeight: 1.2 }}
        >
          {titleDisplay}
        </h3>
        
        <div className="flex items-center gap-4 mt-2 text-gray-600">
          <div className="flex items-center gap-2">
            <User style={{ width: "18px", height: "18px", color: "#142d55" }} />
            <span className="font-inter font-bold text-[#142d55]" style={{ fontSize: "15px" }}>
              {log.performed_by || "System"}
            </span>
          </div>
          <span style={{ color: "#d1d5db", fontSize: "16px", paddingBottom: "2px" }}>|</span>
          <div className="flex items-center gap-2">
            <Calendar style={{ width: "18px", height: "18px", color: "#6b7280" }} />
            <span className="font-inter font-medium text-[#6b7280]" style={{ fontSize: "15px" }}>
              {formatDate(log.performed_at)}
            </span>
          </div>
        </div>
      </div>

      <LogDetailsEventSummary log={log} actionDisplay={actionDisplay} />
      <LogDetailsTimeline log={log} titleDisplay={titleDisplay} formatDate={formatDate} />
    </div>
  );
}
