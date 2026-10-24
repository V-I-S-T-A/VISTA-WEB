import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import ErrorNotice from "../../../../components/ErrorNotice";
import { useEffect, useRef, useState } from "react";
import { X, SquarePen, Trash2 } from "lucide-react";
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

function FocusSelect({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        style={{
          ...FIELD_STYLES.select,
          ...(focused ? FIELD_STYLES.inputFocus : {}),
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
      <svg
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          width: "14px",
          height: "14px",
          color: "#6b7280",
        }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

/**
 * EditUserModal
 *
 * Props:
 *   isOpen   – boolean
 *   onClose  – () => void
 *   user     – the user object from API
 *   onSave   – async (updatedData) => void
 */
export default function EditUserModal(props) {
  return props.isOpen && props.user ? <EditUserForm key={props.user.user_id} {...props} /> : null;
}

function EditUserForm({
  isOpen,
  onClose,
  user,
  onSave,
  onDelete,
  isLoading = false,
}) {
  const [form, setForm] = useState({
    fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User",
    role: user.role ?? "",
    isActive: user.is_active !== undefined ? user.is_active : true,
    orgId: user.org_id ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      if (e.key === "Escape" && !e.defaultPrevented && !saving && !deleting && !isLoading) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, saving, deleting, isLoading]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.role) errs.role = "Role is required.";
    if (form.role === "student" && !form.orgId)
      errs.orgId = "Organization is required for students.";
    return errs;
  }

  async function handleDelete() {
    if (saving || deleting || isLoading) return;
    setDeleting(true);
    setSaveError("");
    try {
      await onDelete(user.user_id);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Could not delete this account. Please try again."));
    } finally {
      setDeleting(false);
    }
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
      await onSave?.({
        full_name: form.fullName.trim(),
        role: form.role,
        org_id: form.role === "student" ? form.orgId : null,
        is_active: form.isActive,
      });
      onClose();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Could not save the user. Your changes have been kept. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !user) return null;

  const statusColor = form.isActive ? "#16a34a" : "#6b7280";

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
        aria-labelledby="edit-user-title"
      >
        {/* Header */}
        <div
          style={{
            background: "#142d55",
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
                background: "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SquarePen
                style={{ width: "16px", height: "16px", color: "#fff" }}
              />
            </div>
            <div>
              <h2
                id="edit-user-title"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: 0,
                }}
              >
                Edit User
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.65)",
                  margin: 0,
                }}
              >
                Update account information for{" "}
                {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  "Unknown User"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting || isLoading}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: saving || deleting || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              opacity: saving || deleting || isLoading ? 0.5 : 1,
            }}
            aria-label="Close modal"
          >
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* User quick-info strip */}
        <div
          style={{
            background: "#f0f4fa",
            borderBottom: "1px solid #e5e7eb",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#dfe7fb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
              fontWeight: "700",
              fontSize: "15px",
              color: "#1f5cae",
              flexShrink: 0,
            }}
          >
            {`${user.first_name || ""} ${user.last_name || ""}`
              .trim()[0]
              ?.toUpperCase() ?? "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}
            >
              {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "Unknown User"}
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#6b7280",
                margin: "1px 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: "700",
              color: statusColor,
              background: form.isActive ? "#dcfce7" : "#f3f4f6",
              border: `1px solid ${form.isActive ? "#bbf7d0" : "#e5e7eb"}`,
              borderRadius: "999px",
              padding: "3px 10px",
              flexShrink: 0,
            }}
          >
            {form.isActive ? "Active" : "Inactive"}
          </span>
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
          <ErrorNotice message={saveError} />
          {/* Full Name */}
          <Field label="Full Name *" error={errors.fullName}>
            <FocusInput
              ref={firstInputRef}
              type="text"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              disabled={saving || deleting || isLoading}
            />
          </Field>

          {/* Role */}
          <Field label="Role *" error={errors.role}>
            <FocusSelect
              value={form.role}
              onChange={(e) => {
                set("role", e.target.value);
                if (e.target.value !== "student") set("orgId", "");
              }}
              disabled={saving || deleting || isLoading}
            >
              <option value="">Select role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </FocusSelect>
          </Field>

          {/* Organization (only for students) */}
          {form.role === "student" && (
            <Field label="Organization *" htmlFor="edit-user-organization">
              <OrganizationPicker
                id="edit-user-organization"
                value={form.orgId}
                onChange={(orgId) => set("orgId", orgId)}
                disabled={saving || deleting || isLoading}
                error={errors.orgId}
                selectedLabel={form.orgId === user.org_id ? user.department : ""}
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
                  ? "User can currently log in."
                  : "Account is inactive — user cannot log in."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              disabled={saving || deleting || isLoading}
              style={{
                width: "42px",
                height: "24px",
                borderRadius: "999px",
                border: "none",
                background: form.isActive ? "#1f5cae" : "#d1d5db",
                cursor: saving || deleting || isLoading ? "not-allowed" : "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
                opacity: saving || deleting || isLoading ? 0.5 : 1,
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
            flexWrap: "wrap",
          }}
        >
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting || isLoading}
              className="inline-flex items-center gap-1.5 rounded border border-red-700 bg-red-500 px-3 py-2 font-inter text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              style={{ marginRight: "auto" }}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {deleting ? "Deleting..." : "Delete user"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting || isLoading}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: "600",
              color: "#374151",
              background: "#fff",
              border: "1.5px solid #d1d5db",
              borderRadius: "7px",
              padding: "7px 16px",
              cursor: saving || deleting || isLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || deleting || isLoading}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: "600",
              color: "#fff",
              background: "#1f5cae",
              border: "none",
              borderRadius: "7px",
              padding: "7px 24px",
              cursor: saving || deleting || isLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: saving || deleting || isLoading ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
