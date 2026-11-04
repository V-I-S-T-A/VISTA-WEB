import { useCallback, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import defaultAvatar from "../assets/shared/default_user.webp";
import vistaLogo from "../assets/shared/vista_logo.webp";
import { ToastContext } from "./toastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 5000, options = {}) => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t, { id, message, type, ...options }]);
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        duration,
      );
    },
    [],
  );
  const clearToasts = useCallback((scope) => {
    setToasts((items) => items.filter((item) => item.scope !== scope));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, clearToasts }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => t.variant === "reply" ? (
          <div
            key={t.id}
            role="status"
            className="font-inter"
            style={{
              width: "min(420px, calc(100vw - 32px))",
              boxSizing: "border-box",
              padding: "12px 14px 14px",
              border: "1px solid #dbe4f0",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 12px 32px rgba(20, 45, 85, .2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <img src={vistaLogo} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
              <span style={{ flex: 1, color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: ".04em" }}>VISTA</span>
              <button
                type="button"
                aria-label="Dismiss reply notification"
                onClick={() => setToasts((items) => items.filter((item) => item.id !== t.id))}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, padding: 0, border: 0, borderRadius: 6, background: "transparent", color: "#64748b", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>
            {t.onClick ? (
              <button
                type="button"
                onClick={t.onClick}
                aria-label={`Open reply from ${t.actorName || "a staff member"} on ${t.submissionTitle || "your submission"}`}
                style={{ display: "flex", width: "100%", minWidth: 0, alignItems: "flex-start", gap: 12, padding: 0, border: 0, background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer" }}
              >
                <img
                  src={t.actorImageUrl || defaultAvatar}
                  alt=""
                  onError={(event) => { event.currentTarget.src = defaultAvatar; }}
                  style={{ width: 44, height: 44, flex: "0 0 44px", borderRadius: "50%", objectFit: "cover", background: "#eef2f7" }}
                />
                <span style={{ display: "flex", minWidth: 0, flexDirection: "column", gap: 3, paddingTop: 2 }}>
                  <span style={{ color: "#142d55", fontSize: 14, lineHeight: 1.4 }}>
                    <strong>{t.actorName || "Staff member"}</strong> replied to your submission
                  </span>
                  <span style={{ overflow: "hidden", color: "#64748b", fontSize: 13, lineHeight: 1.4, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.submissionTitle || "Open your submission"}
                  </span>
                  <span style={{ marginTop: 4, color: "#1f5cae", fontSize: 12, fontWeight: 700 }}>View conversation →</span>
                </span>
              </button>
            ) : (
              <span style={{ color: "#374151", fontSize: 13 }}>{t.message}</span>
            )}
          </div>
        ) : (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="flex items-center gap-2 rounded-lg shadow-lg font-inter"
            style={{
              padding: "12px 16px",
              background: "#fff",
              border: `1px solid ${t.type === "error" ? "#fecaca" : "#bbf7d0"}`,
              width: "min(400px, calc(100vw - 40px))",
              boxSizing: "border-box",
            }}
          >
            {t.type === "error" ? (
              <AlertCircle className="text-red-600 w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="text-green-600 w-4 h-4 flex-shrink-0" />
            )}
            {t.onClick ? <button
              type="button"
              onClick={t.onClick}
              aria-label={`Open notification: ${t.message}`}
              style={{ fontSize: 13, color: "#374151", minWidth: 0, overflowWrap: "anywhere", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >{t.message}</button> : <span style={{ fontSize: 13, color: "#374151", minWidth: 0, overflowWrap: "anywhere" }}>{t.message}</span>}
            <button
              type="button"
              aria-label="Dismiss toast"
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
