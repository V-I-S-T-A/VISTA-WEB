import DialogLayer from "./DialogLayer";
import "./StatusModal.css";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

/**
 * StatusModal
 *
 * Shared VISTA feedback and confirmation dialog using the workspace font,
 * neutral surfaces, semantic feedback icons and the existing action handlers.
 */
export default function StatusModal({
  isOpen,
  onClose,
  title = "Notification",
  message = "",
  type = "success", // success | error | warning | info
  confirmText = "OK",
  onConfirm,
  subtitle = "",
  children,
  cancelText = "",
  onCancel,
  confirmDisabled = false,
  closeDisabled = false,
  confirmVariant = "primary",
  maxWidth = "440px",
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: "#15803d",
      iconBg: "#dcfce7",
      accentBorder: "#86efac",
    },
    error: {
      icon: AlertCircle,
      iconColor: "#dc2626",
      iconBg: "#fee2e2",
      accentBorder: "#fca5a5",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "#d97706",
      iconBg: "#fef3c7",
      accentBorder: "#fcd34d",
    },
    info: {
      icon: Info,
      iconColor: "#1d4ed8",
      iconBg: "#e0e7ff",
      accentBorder: "#93c5fd",
    },
  }[type] || {
    icon: Info,
    iconColor: "#1d4ed8",
    iconBg: "#e0e7ff",
    accentBorder: "#93c5fd",
  };

  const IconComponent = typeConfig.icon;

  return (
    <DialogLayer label={title} onDismiss={onClose} dismissDisabled={closeDisabled}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}


    >
      <div className="vista-surface vista-status-modal"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--ui-text)",
          background: "var(--ui-surface)",
          borderRadius: "var(--radius-dialog)",
          width: "100%",
          maxWidth,
          maxHeight: "calc(100vh - 32px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalFadeIn 0.18s ease-out",
        }}
      >
        {/* Header */}
        <div className="vista-status-modal__header"
          style={{
            background: "var(--ui-surface)",
            borderBottom: "1px solid var(--ui-border)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--ui-navy)",
                margin: 0,
              }}
            >
              {title}
            </h3>

            {subtitle && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--ui-muted)",
                  margin: "2px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button data-ui="icon"
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            style={{
              background: "var(--ui-field)",
              border: "none",
              borderRadius: "var(--radius-control)",
              width: "28px",
              height: "28px",
              cursor: closeDisabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ui-muted)",
              transition: "background-color 0.15s ease",
              opacity: closeDisabled ? 0.5 : 1,
            }}
            aria-label="Close"
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Body */}
        {children ? (
          <div
            style={{
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            {message && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span className="vista-plain-icon"><IconComponent style={{ width: "19px", height: "19px", color: typeConfig.iconColor }} /></span>
                <p
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: "var(--font-body)",
                    fontSize: "13.5px",
                    lineHeight: "1.5",
                    color: "#374151",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {message}
                </p>
              </div>
            )}
            {children}
          </div>
        ) : (
          <div
            style={{
              padding: "24px 22px",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <span className="vista-plain-icon"><IconComponent
                style={{
                  width: "24px",
                  height: "24px",
                  color: typeConfig.iconColor,
                }}
              /></span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13.5px",
                  lineHeight: "1.5",
                  color: "#374151",
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "var(--ui-field)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {cancelText && (
            <button data-ui="secondary"
              type="button"
              onClick={onCancel || onClose}
              disabled={closeDisabled}
              style={{ cursor: closeDisabled ? "not-allowed" : "pointer", opacity: closeDisabled ? 0.5 : 1 }}
            >
              {cancelText}
            </button>
          )}
          <button data-ui={confirmVariant === "danger" ? "destructive" : "primary"}
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="transition hover:brightness-105 active:scale-95 cursor-pointer"
            style={{ opacity: confirmDisabled ? 0.5 : 1, cursor: confirmDisabled ? "not-allowed" : "pointer" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </DialogLayer>
  );
}
