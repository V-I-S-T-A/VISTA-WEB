import { useCallback, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { ToastContext } from "./toastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 5000) => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        duration,
      );
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
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
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-lg shadow-lg font-inter"
            style={{
              padding: "12px 16px",
              background: "#fff",
              border: `1px solid ${t.type === "error" ? "#fecaca" : "#bbf7d0"}`,
              minWidth: 280,
            }}
          >
            {t.type === "error" ? (
              <AlertCircle className="text-red-600 w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="text-green-600 w-4 h-4 flex-shrink-0" />
            )}
            <span style={{ fontSize: 13, color: "#374151" }}>{t.message}</span>
            <button
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
