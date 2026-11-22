import DialogLayer from "../../../../components/DialogLayer";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import { useState, useRef } from "react";
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

  const [previousInputs, setPreviousInputs] = useState({ isOpen, onClose });
  if (previousInputs.isOpen !== isOpen || previousInputs.onClose !== onClose) {
    setPreviousInputs({ isOpen, onClose });
    if (isOpen) setError("");
  }

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
      setError(getApiErrorMessage(err, "Could not delete this entry. It may be used by existing records."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogLayer label={"Confirm deletion"} onDismiss={onClose} dismissDisabled={isDeleting}
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
      <div className="vista-surface"
        style={{
          background: "var(--ui-surface)",
          borderRadius: "var(--radius-dialog)",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        maxHeight: "calc(100dvh - 32px)", overflowY: "auto",}}


      >
        {/* Header */}
        <div className="vista-modal-heading"
          style={{
            background: "var(--ui-surface)", // Red background for danger
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="vista-plain-icon"><AlertTriangle
                style={{ width: "16px", height: "16px", color: "var(--ui-navy)" }}
              /></span>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--ui-navy)",
                  margin: 0,
                }}
              >
                Confirm Deletion
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--ui-muted)",
                  margin: 0,
                }}
              >
                This action is permanent
              </p>
            </div>
          </div>
          <button data-ui="icon"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              background: "var(--ui-selected)",
              border: "none",
              borderRadius: "var(--radius-control)",
              width: "30px",
              height: "30px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ui-navy)",
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
                borderRadius: "var(--radius-chip)",
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
              fontFamily: "var(--font-body)",
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
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--ui-muted)",
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
          <button data-ui="secondary"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{ cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button data-ui="destructive"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ cursor: isDeleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
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
    </DialogLayer>
  );
}
