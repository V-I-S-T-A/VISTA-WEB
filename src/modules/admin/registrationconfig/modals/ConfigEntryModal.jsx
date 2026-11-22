import DialogLayer from "../../../../components/DialogLayer";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import { convertImageToWebP } from "../../../../utils/fileOptimizer";
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
    fontFamily: "var(--font-body)",
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
    borderRadius: "var(--radius-field)",
    padding: "9px 13px",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    color: "#111827",
    backgroundColor: "var(--ui-field)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  }),
  error: {
    fontSize: "11px",
    color: "#dc2626",
    marginTop: "3px",
    fontFamily: "var(--font-body)",
  },
};

function Field({ label, htmlFor, error, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label htmlFor={htmlFor} style={FIELD_STYLES.label}>{label}</label>
      {children}
      {error && <p style={FIELD_STYLES.error}>{error}</p>}
    </div>
  );
}

function FocusInput({ multiline = false, ...props }) {
  const [focused, setFocused] = useState(false);
  const Input = multiline ? "textarea" : "input";
  return (
    <Input
      {...props}
      style={{
        ...FIELD_STYLES.input(focused),
        ...(multiline ? { minHeight: "112px", resize: "vertical", lineHeight: "1.6", display: "block" } : {}),
      }}
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

  const [previousInputs, setPreviousInputs] = useState(null);
  if (!previousInputs || previousInputs.isOpen !== isOpen || previousInputs.initialData !== initialData || previousInputs.activeTab !== activeTab) {
    setPreviousInputs({ isOpen, initialData, activeTab });
    if (isOpen) {
      setFormData(
        activeTab === "organizations"
          ? { is_active: true, ...initialData }
          : initialData || {},
      );
      setSelectedFile(null);
      setError("");
    }
  }
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen, initialData, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
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
            type: "textarea",
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
          data.append("image", await convertImageToWebP(selectedFile));
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
      setError(getApiErrorMessage(err, "Could not save this entry."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogLayer label={"Registration configuration"} onDismiss={onClose} dismissDisabled={isSubmitting}
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
          maxWidth: "520px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "min(90vh, calc(100dvh - 32px))",
          overflowY: "auto",
        }}


      >
        <div className="vista-modal-heading"
          style={{
            background: "var(--ui-surface)",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="vista-plain-icon"><TabIcon
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
                {isEditMode ? "Edit" : "Add New"} {tabSingular}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
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
          <button aria-busy={Boolean(isSubmitting)} data-ui="icon"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "var(--ui-selected)",
              border: "none",
              borderRadius: "var(--radius-control)",
              width: "30px",
              height: "30px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ui-navy)",
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

          {fields.map((field, index) => (
            <Field key={field.key} label={field.label} htmlFor={`config-entry-${field.key}`}>
              <FocusInput
                ref={index === 0 ? firstInputRef : null}
                id={`config-entry-${field.key}`}
                multiline={field.type === "textarea"}
                type={field.type === "textarea" ? undefined : field.type}
                rows={field.type === "textarea" ? 4 : undefined}
                name={field.key}
                placeholder={field.placeholder}
                value={formData[field.key] || ""}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Field>
          ))}

          {activeTab === "organizations" && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px",
              padding: "16px", marginBottom: "24px", borderRadius: "var(--radius-chip)",
              border: `1px solid ${formData.is_active ? "#bbf7d0" : "#e5e7eb"}`,
              backgroundColor: formData.is_active ? "#f0fdf4" : "#f9fafb",
            }}>
              <div style={{ minWidth: 0 }}>
                <p id="config-org-active-label" style={{ fontSize: "13px", fontWeight: 600, color: "#374151", lineHeight: "1.5" }}>
                  Active Organization
                </p>
                <p id="config-org-active-help" style={{ marginTop: "6px", fontSize: "12px", color: "var(--ui-muted)", lineHeight: "1.6" }}>
                  {formData.is_active
                    ? "Currently active. Turn off to mark this organization inactive."
                    : "Currently inactive. Turn on to reactivate this organization."}
                </p>
              </div>
              <button aria-label="Account status" aria-busy={Boolean(isSubmitting)} data-ui="toggle"
                type="button"
                role="switch"
                aria-checked={Boolean(formData.is_active)}
                aria-labelledby="config-org-active-label"
                aria-describedby="config-org-active-help"
                disabled={isSubmitting}
                onClick={() => setFormData((previous) => ({ ...previous, is_active: !previous.is_active }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${formData.is_active ? "bg-green-600" : "bg-gray-400"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.is_active ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          )}

          {/* Image Upload Field specifically for Organizations */}
          {activeTab === "organizations" && (
            <Field
              label={`Organization Logo / Photo ${!isEditMode ? "*" : ""}`}
            >
              <div
                style={{
                  border: "1.5px dashed #d1d5db",
                  borderRadius: "var(--radius-chip)",
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
                    style={{ width: "20px", height: "20px", color: "var(--ui-muted)" }}
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
          <button aria-busy={Boolean(isSubmitting)} data-ui="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1 }}
          >
            Cancel
          </button>
          <button aria-busy={Boolean(isSubmitting)} data-ui="primary"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
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
    </DialogLayer>
  );
}
