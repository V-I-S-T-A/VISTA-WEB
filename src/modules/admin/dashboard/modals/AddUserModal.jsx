import VistaSelect from "../../../../components/VistaSelect";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import { useEffect, useRef, useState } from "react";
import { X, UserPlus, Mail } from "lucide-react";
import OrganizationPicker from "../../../../components/OrganizationPicker";

const ROLES = ["staff", "student"];

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
  select: {
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
    appearance: "none",
    cursor: "pointer",
  },
  error: {
    fontSize: "11px",
    color: "#dc2626",
    marginTop: "3px",
    fontFamily: "Inter, sans-serif",
  },
};

function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} style={FIELD_STYLES.label}>{label}</label>
      {children}
      {error && <p style={FIELD_STYLES.error}>{error}</p>}
    </div>
  );
}

function FocusInput({ style, ...props }) {
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
        props.onBlur?.(e);
      }}
    />
  );
}

function FocusSelect({ children, ...props }) {
  return <VistaSelect {...props} aria-label="Role" style={FIELD_STYLES.select}>{children}</VistaSelect>;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  orgId: "",
  isActive: true,
};

export default function AddUserModal(props) {
  return props.isOpen ? <AddUserForm {...props} /> : null;
}

function AddUserForm({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  error,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape" && !e.defaultPrevented && !saving && !isLoading) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, saving, isLoading]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!form.role) errs.role = "Role is required.";
    if (form.role === "student" && !form.orgId)
      errs.orgId = "Organization is required for students.";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
        org_id: form.role === "student" ? form.orgId : null,
        is_active: form.isActive,
      });
      onClose();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Could not create the account. Your entries have been kept. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

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
        aria-labelledby="add-user-title"
      >
        {/* Header */}
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
              <UserPlus
                style={{ width: "16px", height: "16px", color: "#fff" }}
              />
            </div>
            <div>
              <h2
                id="add-user-title"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: 0,
                }}
              >
                Add New User
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                }}
              >
                Fill in the details to create a new account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || isLoading}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: saving || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              opacity: saving || isLoading ? 0.5 : 1,
            }}
            aria-label="Close modal"
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {(saveError || error) && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                color: "#991b1b",
              }}
            >
              {saveError || getApiErrorMessage(error, "Could not create the account.")}
            </div>
          )}

          {/* Full Name */}
          <div className="responsive-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Field label="First Name *" error={errors.firstName}>
              <FocusInput
                ref={firstInputRef}
                type="text"
                placeholder="Maria"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                disabled={saving || isLoading}
              />
            </Field>

            <Field label="Last Name *" error={errors.lastName}>
              <FocusInput
                type="text"
                placeholder="Santos"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                disabled={saving || isLoading}
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email Address *" error={errors.email}>
            <FocusInput
              type="email"
              placeholder="e.g. maria.santos@gmail.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              disabled={saving || isLoading}
            />
          </Field>

          {/* Temporary password notice */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              background: "#eff6ff",
              border: "1.5px solid #bfdbfe",
              borderRadius: "8px",
              padding: "12px 14px",
            }}
          >
            <Mail
              style={{
                width: "16px",
                height: "16px",
                color: "#1f5cae",
                flexShrink: 0,
                marginTop: "1px",
              }}
            />
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#1e3a8a",
                margin: 0,
              }}
            >
              A randomly generated temporary password will be emailed to this
              address. The user will be asked to change it after their first
              login.
            </p>
          </div>

          {/* Role */}
          <Field label="Role *" error={errors.role}>
            <FocusSelect
              value={form.role}
              onChange={(e) => {
                set("role", e.target.value);
                if (e.target.value !== "student") set("orgId", "");
              }}
              disabled={saving || isLoading}
            >
              <option value="">Select role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </FocusSelect>
          </Field>

          {/* Organization (Dynamic) */}
          {form.role === "student" && (
            <Field label="Organization *" htmlFor="add-user-organization">
              <OrganizationPicker
                id="add-user-organization"
                value={form.orgId}
                onChange={(orgId) => set("orgId", orgId)}
                disabled={saving || isLoading}
                error={errors.orgId}
              />
            </Field>
          )}

          {/* Status toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#f8f9fc",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px 14px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  margin: 0,
                }}
              >
                Account Status
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#6b7280",
                  margin: "2px 0 0",
                }}
              >
                {form.isActive
                  ? "User can log in immediately."
                  : "Account is inactive and cannot log in."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              disabled={saving || isLoading}
              style={{
                width: "42px",
                height: "24px",
                borderRadius: "999px",
                border: "none",
                background: form.isActive ? "#1f5cae" : "#d1d5db",
                cursor: saving || isLoading ? "not-allowed" : "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
                opacity: saving || isLoading ? 0.5 : 1,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: form.isActive ? "21px" : "3px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>
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
            disabled={saving || isLoading}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              background: "#fff",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 18px",
              cursor: saving || isLoading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              opacity: saving || isLoading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isLoading}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#111827",
              background: saving || isLoading ? "#e6c900" : "#ffe100",
              border: "1.5px solid #d4a000",
              borderRadius: "8px",
              padding: "8px 20px",
              cursor: saving || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s",
            }}
          >
            <UserPlus style={{ width: "13px", height: "13px" }} />
            {saving || isLoading ? "Saving..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}
