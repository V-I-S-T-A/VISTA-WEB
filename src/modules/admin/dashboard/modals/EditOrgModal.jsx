import FormField from "../../../../components/FormField";
import DialogLayer from "../../../../components/DialogLayer";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import { useRef, useState } from "react";
import { X, SquarePen, ImagePlus, Trash2 } from "lucide-react";

const FIELD_STYLES = {
  label: {
    display: "block",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    border: "1.5px solid #d1d5db",
    borderRadius: "var(--radius-field)",
    padding: "9px 13px",
    fontSize: "13px",
    fontFamily: "var(--font-body)",
    color: "#111827",
    backgroundColor: "var(--ui-field)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  inputFocus: {
    borderColor: "#1f5cae",
  },
  error: {
    fontSize: "11px",
    color: "#dc2626",
    marginTop: "3px",
    fontFamily: "var(--font-body)",
  },
};

function Field({ label, error, children, htmlFor }) {
  return <FormField label={label} error={error} htmlFor={htmlFor} labelStyle={FIELD_STYLES.label} errorStyle={FIELD_STYLES.error}>{children}</FormField>;
}

function FocusInput({ style, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...FIELD_STYLES.input,
        ...(focused ? FIELD_STYLES.inputFocus : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
}

function PhotoDropzone({ preview, error, onSelect, onRemove, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (file && file.type.startsWith("image/")) {
      onSelect(file);
    }
  }

  return (
    <div>
      {preview ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            border: "1.5px solid #d1d5db",
            borderRadius: "var(--radius-chip)",
            padding: "10px",
          }}
        >
          <img
            src={preview}
            alt="Organization preview"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-chip)",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid #e5e7eb",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                margin: 0,
              }}
            >
              Photo selected / loaded
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "var(--ui-muted)",
                margin: "2px 0 0",
              }}
            >
              Click remove to choose a different photo.
            </p>
          </div>
          <button data-ui="destructive"
            type="button"
            onClick={onRemove}
            disabled={disabled}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: disabled ? "not-allowed" : "pointer" }}
          >
            <Trash2 style={{ width: "12px", height: "12px" }} /> Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !disabled && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#1f5cae" : "#d1d5db"}`,
            borderRadius: "var(--radius-chip)",
            padding: "20px 16px",
            textAlign: "center",
            backgroundColor: dragOver ? "#f0f7ff" : "#fafafa",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
          />
          <span className="vista-plain-icon"><ImagePlus style={{ width: "18px", height: "18px" }} /></span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: "600",
              color: "#374151",
              margin: 0,
            }}
          >
            Click or drag logo photo to upload
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "#9ca3af",
              margin: "2px 0 0",
            }}
          >
            PNG, JPG, WEBP up to 5MB
          </p>
        </div>
      )}
      {error && <p style={FIELD_STYLES.error}>{error}</p>}
    </div>
  );
}

export default function EditOrgModal({
  isOpen,
  onClose,
  onSave,
  org,
  isLoading,
  error: apiError,
}) {
  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    description: "",
    image: null,
    is_active: true,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [previousOrg, setPreviousOrg] = useState(null);
  if (previousOrg !== org) {
    setPreviousOrg(org);
    if (org) {
      setFormData({
        name: org.name || "",
        acronym: org.acronym || "",
        description: org.description || "",
        image: null,
        is_active: org.is_active !== undefined ? org.is_active : true,
      });
      setPhotoPreview(org.image_url || null);
      setErrors({});
    }
  }

  if (!isOpen || !org) return null;

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function handlePhotoSelect(file) {
    setFormData((prev) => ({ ...prev, image: file }));
    setPhotoPreview(URL.createObjectURL(file));
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: null }));
    }
  }

  function handlePhotoRemove() {
    setFormData((prev) => ({ ...prev, image: null }));
    setPhotoPreview(null);
  }

  function validate() {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Organization name is required.";
    if (!formData.acronym.trim()) errs.acronym = "Acronym is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name,
      acronym: formData.acronym,
      description: formData.description,
      is_active: formData.is_active,
    };
    if (formData.image) {
      payload.image = formData.image;
    }

    onSave(org.org_id, payload);
  }

  return (
    <DialogLayer label={"Edit organization"} onDismiss={onClose} dismissDisabled={isLoading}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
        padding: "16px",
      }}
    >
      <div className="vista-surface"
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--ui-surface)",
          borderRadius: "var(--radius-dialog)",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        maxHeight: "calc(100dvh - 32px)", overflowY: "auto",}}


      >
        {/* Header */}
        <div className="vista-modal-heading"
          style={{
            backgroundColor: "var(--ui-surface)",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="vista-plain-icon"><SquarePen style={{ width: "16px", height: "16px", color: "var(--ui-navy)" }} /></span>
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
                Edit Organization
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--ui-muted)",
                  margin: 0,
                }}
              >
                Update organization details and status
              </p>
            </div>
          </div>
          <button aria-busy={Boolean(isLoading)} data-ui="icon"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "var(--ui-selected)",
              border: "none",
              borderRadius: "var(--radius-control)",
              width: "30px",
              height: "30px",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ui-navy)",
            }}
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {apiError && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "var(--radius-chip)",
                padding: "12px",
                fontSize: "13px",
                color: "#991b1b",
                fontFamily: "var(--font-body)",
              }}
            >
              {getApiErrorMessage(apiError, "Could not update the organization.")}
            </div>
          )}

          <Field label="Organization Logo / Photo" error={errors.image}>
            <PhotoDropzone
              preview={photoPreview}
              error={errors.image}
              onSelect={handlePhotoSelect}
              onRemove={handlePhotoRemove}
              disabled={isLoading}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <Field label="Organization Name *" error={errors.name}>
              <FocusInput
                type="text"
                placeholder="e.g. Computer Society"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isLoading}
              />
            </Field>
            <Field label="Acronym *" error={errors.acronym}>
              <FocusInput
                type="text"
                placeholder="e.g. CS"
                value={formData.acronym}
                onChange={(e) => handleChange("acronym", e.target.value)}
                disabled={isLoading}
              />
            </Field>
          </div>

          <Field label="Description" error={errors.description}>
            <textarea
              rows={3}
              placeholder="Brief description of the organization"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={isLoading}
              style={{
                width: "100%",
                border: "1.5px solid #d1d5db",
                borderRadius: "var(--radius-field)",
                padding: "9px 13px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                color: "#111827",
                backgroundColor: "var(--ui-surface)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "4px" }}>
            <input
              type="checkbox"
              id="is_active_org"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              disabled={isLoading}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label
              htmlFor="is_active_org"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                cursor: "pointer",
              }}
            >
              Active Organization
            </label>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button aria-busy={Boolean(isLoading)} data-ui="secondary"
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              Cancel
            </button>
            <button aria-busy={Boolean(isLoading)} data-ui="primary"
              type="submit"
              disabled={isLoading}
              style={{ cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DialogLayer>
  );
}
