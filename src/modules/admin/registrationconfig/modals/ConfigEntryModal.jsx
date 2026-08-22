import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Plus,
  Building2,
  Calendar,
  FileText,
  Tag,
  Loader2,
  Upload,
} from "lucide-react";
import api from "../../../../lib/axios";

const FIELD_STYLES = {
  label: {
    display: "block",
    fontFamily: "Inter, sans-serif",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "5px",
  },
  input: (isFocused) => ({
    width: "100%",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: isFocused ? "#1f5cae" : "#d1d5db",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "13px",
    fontFamily: "Inter, sans-serif",
    color: "#111827",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  }),
  error: {
    fontSize: "11px",
    color: "#dc2626",
    marginTop: "3px",
    fontFamily: "Inter, sans-serif",
  },
};

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={FIELD_STYLES.label}>{label}</label>
      {children}
      {error && <p style={FIELD_STYLES.error}>{error}</p>}
    </div>
  );
}

function FocusInput({ ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={FIELD_STYLES.input(focused)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}

export default function ConfigEntryModal({
  isOpen,
  onClose,
  activeTab,
  initialData,
  onSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setSelectedFile(null);
      setError("");
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialData, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTabDetails = () => {
    switch (activeTab) {
      case "organizations":
        return { icon: Building2, singular: "Organization" };
      case "document_types":
        return { icon: FileText, singular: "Document Type" };
      case "categories":
        return { icon: Tag, singular: "Category" };
      case "academic_years":
      default:
        return { icon: Calendar, singular: "Academic Year" };
    }
  };

  const { icon: TabIcon, singular: tabSingular } = getTabDetails();

  const getFields = () => {
    switch (activeTab) {
      case "organizations":
        return [
          {
            key: "name",
            label: "Organization Name *",
            type: "text",
            required: true,
            placeholder: "e.g. Society of Information Technology Enthusiasts",
          },
          {
            key: "acronym",
            label: "Acronym",
            type: "text",
            required: false,
            placeholder: "e.g. SITE",
          },
          {
            key: "description",
            label: "Description",
            type: "text",
            required: false,
            placeholder: "Optional organization description...",
          },
        ];
      case "document_types":
        return [
          {
            key: "name",
            label: "Document Type Name *",
            type: "text",
            required: true,
            placeholder: "e.g. Accomplishment Report",
          },
          {
            key: "code",
            label: "Document Code *",
            type: "text",
            required: true,
            placeholder: "e.g. FM-USTP-OSA-04B",
          },
          {
            key: "description",
            label: "Description",
            type: "text",
            required: false,
            placeholder: "Optional details...",
          },
        ];
      case "categories":
        return [
          {
            key: "name",
            label: "Category Name *",
            type: "text",
            required: true,
            placeholder: "e.g. Post-Activity",
          },
        ];
      case "academic_years":
      default:
        return [
          {
            key: "year",
            label: "Academic Year *",
            type: "text",
            required: true,
            placeholder: "e.g. 2025-2026",
          },
        ];
    }
  };

  const fields = getFields();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getItemId = (item) => {
    return (
      item.org_id ||
      item.academic_year_id ||
      item.doc_type_id ||
      item.category_id ||
      item.id
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    const endpoint = `/${activeTab.replace("_", "-")}/`;

    try {
      // Use FormData if we are submitting files (Organizations) or standard JSON otherwise
      let payload = formData;
      let headers = {};

      if (activeTab === "organizations") {
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== undefined && formData[key] !== null) {
            data.append(key, formData[key]);
          }
        });
        if (selectedFile) {
          data.append("image", selectedFile);
        }
        payload = data;
        headers = { "Content-Type": "multipart/form-data" };
      }

      if (isEditMode) {
        const itemId = getItemId(initialData);
        await api.patch(`${endpoint}${itemId}/`, payload, { headers });
      } else {
        await api.post(endpoint, payload, { headers });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(`Error saving ${activeTab}:`, err);
      const errorData = err.response?.data;
      if (typeof errorData === "object" && errorData !== null) {
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMsg = Array.isArray(errorData[firstErrorKey])
          ? errorData[firstErrorKey][0]
          : errorData[firstErrorKey];
        setError(`${firstErrorKey}: ${errorMsg}`);
      } else {
        setError(
          "Failed to save entry. Please check your inputs and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
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
          maxWidth: "520px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            background: "#1f5cae",
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
                background: "rgba(255,255,255,0.18)",
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TabIcon
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
                {isEditMode ? "Edit" : "Add New"} {tabSingular}
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                }}
              >
                {isEditMode
                  ? "Update the details for this entry"
                  : "Fill in the details to create a new entry"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        <div
          style={{
            padding: "24px",
            overflowY: "auto",
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

          {fields.map((field, index) => (
            <Field key={field.key} label={field.label}>
              <FocusInput
                ref={index === 0 ? firstInputRef : null}
                type={field.type}
                name={field.key}
                placeholder={field.placeholder}
                value={formData[field.key] || ""}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Field>
          ))}

          {/* Image Upload Field specifically for Organizations */}
          {activeTab === "organizations" && (
            <Field
              label={`Organization Logo / Photo ${!isEditMode ? "*" : ""}`}
            >
              <div
                style={{
                  border: "1.5px dashed #d1d5db",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  style={{ display: "none" }}
                  id="org-image-upload"
                />
                <label
                  htmlFor="org-image-upload"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Upload
                    style={{ width: "20px", height: "20px", color: "#6b7280" }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {selectedFile
                      ? selectedFile.name
                      : "Choose logo image file..."}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    (PNG, JPG, WEBP up to 5MB)
                  </span>
                </label>
              </div>
            </Field>
          )}
        </div>

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
            disabled={isSubmitting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              background: "#fff",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 18px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#111827",
              background: isSubmitting ? "#e6c900" : "#ffe100",
              border: "1.5px solid #d4a000",
              borderRadius: "8px",
              padding: "8px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
          >
            {isSubmitting ? (
              <Loader2
                style={{
                  width: "13px",
                  height: "13px",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : isEditMode ? (
              <Save style={{ width: "13px", height: "13px" }} />
            ) : (
              <Plus style={{ width: "13px", height: "13px" }} />
            )}
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : `Add ${tabSingular}`}
          </button>
        </div>
      </div>
    </div>
  );
}
