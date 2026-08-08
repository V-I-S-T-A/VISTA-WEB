import { useEffect, useRef, useState } from "react";
import { X, SquarePen, ImagePlus, Trash2 } from "lucide-react";

const FIELD_STYLES = {
  label: {
    display: "block",
    fontFamily: "Inter, sans-serif",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "13px",
    fontFamily: "Inter, sans-serif",
    color: "#111827",
    backgroundColor: "#fff",
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
    fontFamily: "Inter, sans-serif",
  },
};

function Field({ label, error, children }) {
  return (
    <div>
      <label style={FIELD_STYLES.label}>{label}</label>
      {children}
      {error && <p style={FIELD_STYLES.error}>{error}</p>}
    </div>
  );
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
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <img
            src={preview}
            alt="Organization preview"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "8px",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid #e5e7eb",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
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
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#6b7280",
                margin: "2px 0 0",
              }}
            >
              Click remove to choose a different photo.
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: "600",
              color: "#dc2626",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
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
            borderRadius: "8px",
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
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#e0f2fe",
              color: "#0369a1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 8px",
            }}
          >
            <ImagePlus style={{ width: "18px", height: "18px" }} />
          </div>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
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
              fontFamily: "Inter, sans-serif",
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

  useEffect(() => {
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
  }, [org]);

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
    <div
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
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#1f5cae",
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
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SquarePen style={{ width: "16px", height: "16px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                Edit Organization
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.85)",
                  margin: 0,
                }}
              >
                Update organization details and status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
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
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                color: "#991b1b",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {apiError.message ||
                "Failed to update organization. Please check inputs."}
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
                borderRadius: "8px",
                padding: "9px 13px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                backgroundColor: "#fff",
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
                fontFamily: "Inter, sans-serif",
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
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                border: "1.5px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "13px",
                fontWeight: "600",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: "#1f5cae",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
