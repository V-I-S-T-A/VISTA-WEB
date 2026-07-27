import { Info } from "lucide-react";

export default function LogDetailsEventSummary({ log, actionDisplay }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "4px",
        border: "1px solid #e2e6ee",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* Blue header bar */}
      <div
        className="flex justify-between items-center"
        style={{
          backgroundColor: "#1A59A5",
          padding: "12px 24px",
        }}
      >
        <h4
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "13px", color: "#ffffff" }}
        >
          Event Summary
        </h4>
        <Info style={{ width: "16px", height: "16px", color: "#ffffff" }} />
      </div>

      <div className="flex gap-8" style={{ padding: "24px 28px" }}>
        <div style={{ flex: 1 }}>
          <p
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "11px", marginBottom: "8px", color: "#6b7280" }}
          >
            Action Category
          </p>
          <div
            className="inline-flex font-mono font-bold"
            style={{
              backgroundColor: "#edf2fb",
              color: "#1A59A5",
              padding: "10px 16px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {actionDisplay}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "11px", marginBottom: "8px", color: "#6b7280" }}
          >
            Reference ID
          </p>
          <p
            className="font-inter font-bold text-[#142d55]"
            style={{ fontSize: "16px", marginTop: "10px" }}
          >
            {log.object_repr || `REF-${log.table_name?.toUpperCase()}-${log.object_id || "000"}`}
          </p>
        </div>
      </div>
    </div>
  );
}
