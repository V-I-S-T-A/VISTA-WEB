import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Loader2, X, Trash2 } from "lucide-react";
import api from "../../../../lib/axios";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  activeTab,
  itemToDelete,
  onSuccess,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !itemToDelete) return null;

  const getItemId = (item) => {
    return (
      item.org_id ||
      item.academic_year_id ||
      item.doc_type_id ||
      item.category_id ||
      item.id
    );
  };

  const getItemName = (item) => {
    return item.name || item.year || item.title || "this entry";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    const endpoint = `/${activeTab.replace("_", "-")}/`;
    const itemId = getItemId(itemToDelete);

    try {
      await api.delete(`${endpoint}${itemId}/`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(`Error deleting ${activeTab}:`, err);
      setError("Failed to delete. It may be tied to existing records.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          style={{
            background: "#dc2626", // Red background for danger
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle
                style={{ width: "16px", height: "16px", color: "#fff" }}
              />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: 0,
                }}
              >
                Confirm Deletion
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                  margin: 0,
                }}
              >
                This action is permanent
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              opacity: isDeleting ? 0.5 : 1,
            }}
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                color: "#991b1b",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#374151",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Are you sure you want to delete{" "}
            <span style={{ fontWeight: "700", color: "#111827" }}>
              "{getItemName(itemToDelete)}"
            </span>
            ?
          </p>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "8px",
            }}
          >
            This action cannot be undone and will permanently remove this data
            from the database.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            flexShrink: 0,
            background: "#f9fafb",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              background: "#fff",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 18px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              opacity: isDeleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#fff",
              background: isDeleting ? "#b91c1c" : "#dc2626",
              border: "1.5px solid #991b1b",
              borderRadius: "8px",
              padding: "8px 20px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
          >
            {isDeleting ? (
              <Loader2
                style={{
                  width: "13px",
                  height: "13px",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <Trash2 style={{ width: "13px", height: "13px" }} />
            )}
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
