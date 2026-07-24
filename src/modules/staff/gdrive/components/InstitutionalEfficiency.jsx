import { Cloud, ShieldCheck } from "lucide-react";

export default function InstitutionalEfficiency() {
  return (
    <div style={{ marginTop: "28px" }}>
      {/* Title */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: "700",
            color: "#031c36",
            margin: 0,
          }}
        >
          <span style={{ color: "#031c36" }}>Powering Institutional </span>
          <span style={{ color: "#f59e0b" }}>Efficiency</span>
        </h3>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "#4b5563",
            margin: "6px 0 0 24px",
            lineHeight: "1.6",
            width: "100%",
          }}
        >
          Connect your professional workspace to VISTA. This integration allows
          for seamless, automated storage of high-resolution document scans
          directly to your institutional Google Drive.
        </p>
      </div>

      {/* Feature: Automated Archiving */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          marginBottom: "20px",
          marginLeft: "80px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            background: "#031c36",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Cloud
            style={{ width: "20px", height: "20px", color: "#ffffff" }}
          />
        </div>
        <div>
          <h4
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: "600",
              color: "#031c36",
              margin: 0,
            }}
          >
            Automated Archiving
          </h4>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#4b5563",
              margin: "3px 0 0",
              lineHeight: "1.5",
            }}
          >
            Scanned files are instantly categorized and uploaded to your secure
            drive folders.
          </p>
        </div>
      </div>

      {/* Feature: Enterprise Security */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          marginLeft: "80px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            background: "#031c36",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck
            style={{ width: "20px", height: "20px", color: "#ffffff" }}
          />
        </div>
        <div>
          <h4
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: "600",
              color: "#031c36",
              margin: 0,
            }}
          >
            Enterprise Security
          </h4>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#4b5563",
              margin: "3px 0 0",
              lineHeight: "1.5",
            }}
          >
            Using OAuth 2.0 protocols to ensure your institutional credentials
            remain protected.
          </p>
        </div>
      </div>
    </div>
  );
}
