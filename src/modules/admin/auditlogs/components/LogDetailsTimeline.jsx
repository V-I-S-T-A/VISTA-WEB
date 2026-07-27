import { Check } from "lucide-react";

export default function LogDetailsTimeline({ log, titleDisplay, formatDate }) {
  // Mock previous event to match design timeline
  const previousEventTime = new Date(new Date(log.performed_at).getTime() - 133000);

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
      {/* Light gray header bar */}
      <div
        style={{
          backgroundColor: "#f0f4fb",
          padding: "12px 24px",
          borderBottom: "1px solid #e2e6ee",
        }}
      >
        <h4
          className="font-inter font-bold uppercase tracking-wider"
          style={{ fontSize: "13px", color: "#142d55" }}
        >
          Context Timeline
        </h4>
      </div>

      {/* Timeline */}
      <div style={{ padding: "24px 28px" }}>
        
        {/* Current Event */}
        <div className="flex gap-4" style={{ position: "relative" }}>
          <div
            className="flex flex-col items-center"
            style={{ minWidth: "16px" }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "9999px",
                backgroundColor: "#FFE452", // Yellow background
                border: "2px solid #142d55", // Dark border matching the image
                marginTop: "2px",
                flexShrink: 0,
                zIndex: 10,
              }}
            >
              <Check style={{ width: "12px", height: "12px", color: "#142d55", strokeWidth: 3 }} />
            </div>
            <div
              style={{
                width: "2px",
                flex: 1,
                backgroundColor: "#e2e6ee",
                marginTop: "4px",
                marginBottom: "4px",
              }}
            />
          </div>

          <div style={{ paddingBottom: "32px" }}>
            <p
              className="font-inter font-bold text-gray-500"
              style={{ fontSize: "12px", marginBottom: "4px" }}
            >
              {new Date(log.performed_at).toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <h5
              className="font-inter font-bold text-[#142d55]"
              style={{ fontSize: "16px", lineHeight: 1.3 }}
            >
              {titleDisplay}
            </h5>
            <span
              className="inline-flex font-inter font-bold uppercase tracking-wider"
              style={{
                marginTop: "10px",
                backgroundColor: "#1A59A5",
                color: "#ffffff",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "10px",
              }}
            >
              This Event
            </span>
          </div>
        </div>

        {/* Previous Event Mock */}
        <div className="flex gap-4" style={{ position: "relative" }}>
          <div
            className="flex flex-col items-center"
            style={{ minWidth: "16px" }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "9999px",
                backgroundColor: "#f7f9fc",
                border: "2px solid #e2e6ee",
                marginTop: "4px",
                flexShrink: 0,
                marginLeft: "2px", // align center since width is smaller
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "9999px",
                  backgroundColor: "#9ca3af",
                }}
              />
            </div>
          </div>

          <div style={{ paddingBottom: "0" }}>
            <p
              className="font-inter font-bold text-gray-400"
              style={{ fontSize: "12px", marginBottom: "4px" }}
            >
              {previousEventTime.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <h5
              className="font-inter font-medium text-gray-500"
              style={{ fontSize: "15px", lineHeight: 1.3 }}
            >
              Validation Passed
            </h5>
          </div>
        </div>

      </div>
    </div>
  );
}
