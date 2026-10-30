import { AlertCircle } from "lucide-react";

export default function ErrorNotice({ message, onRetry, retrying = false }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "12px 16px",
        marginBottom: "16px",
        borderRadius: "10px",
        border: "1px solid #fecaca",
        borderLeft: "4px solid #dc2626",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: 0,
          flex: "1 1 220px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={16} color="#dc2626" aria-hidden="true" />
        </div>
        <p style={{ margin: 0, fontWeight: 600, color: "#991b1b" }}>{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="disabled:opacity-50"
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #fca5a5",
            backgroundColor: "#ffffff",
            color: "#b91c1c",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            cursor: retrying ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          {retrying ? "Retrying…" : "Try again"}
        </button>
      )}
    </div>
  );
}
