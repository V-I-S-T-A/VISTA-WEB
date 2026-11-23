import { AlertCircle } from "lucide-react";

export default function ErrorNotice({ message, onRetry, retrying = false, retryLabel = "Try again" }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="vista-error-notice"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "12px 16px",
        marginBottom: "16px",
        borderRadius: "var(--radius-field)",
        border: "1px solid var(--ui-danger)",
        borderLeft: "4px solid var(--ui-danger)",
        backgroundColor: "var(--ui-error-surface)",
        color: "var(--ui-danger)",
        fontFamily: "var(--font-body)",
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
        <span className="vista-plain-icon"><AlertCircle size={16} color="var(--ui-danger)" aria-hidden="true" /></span>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--ui-danger)" }}>{message}</p>
      </div>
      {onRetry && (
        <button data-ui="secondary"
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="disabled:opacity-50"
          style={{ cursor: retrying ? "not-allowed" : "pointer", flexShrink: 0 }}
        >
          {retrying ? "Retrying…" : retryLabel}
        </button>
      )}
    </div>
  );
}
