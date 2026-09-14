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
 * Replaces native browser alert/confirm popups with a modal that matches
 * the VISTA table palette (#1f5cae header, #ffc700 yellow action button,
 * Inter font, and themed status icons).
 */
export default function StatusModal({
  isOpen,
  onClose,
  title = "Notification",
  message = "",
  type = "success", // success | error | warning | info
  confirmText = "OK",
  onConfirm,
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
    <div
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
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalFadeIn 0.18s ease-out",
        }}
      >
        {/* Header - Matching Table Header (#1f5cae) */}
        <div
          style={{
            background: "#1f5cae",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: "700",
              color: "#ffffff",
              margin: 0,
            }}
          >
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "6px",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              transition: "background-color 0.15s ease",
            }}
            aria-label="Close"
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px 22px",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: typeConfig.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconComponent
              style={{
                width: "24px",
                height: "24px",
                color: typeConfig.iconColor,
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
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

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={handleConfirm}
            className="transition hover:brightness-105 active:scale-95 cursor-pointer"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#031c36",
              backgroundColor: "#ffc700",
              border: "none",
              borderRadius: "8px",
              padding: "8px 22px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
