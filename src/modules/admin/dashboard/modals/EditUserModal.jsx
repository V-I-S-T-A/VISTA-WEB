import FormField from "../../../../components/FormField";
import DialogLayer from "../../../../components/DialogLayer";
import VistaSelect from "../../../../components/VistaSelect";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import ErrorNotice from "../../../../components/ErrorNotice";
import { useEffect, useRef, useState } from "react";
import { X, SquarePen } from "lucide-react";
import OrganizationPicker from "../../../../components/OrganizationPicker";

const ROLES = ["staff", "student"];

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
  select: {
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
    appearance: "none",
    cursor: "pointer",
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

function FocusSelect({ children, ...props }) {
  return <VistaSelect {...props} aria-label="Role" style={FIELD_STYLES.select}>{children}</VistaSelect>;
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
  const [saveError, setSaveError] = useState("");
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen, onClose, saving, isLoading]);

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
    <DialogLayer aria-labelledby="edit-user-title" label={"Edit user"} onDismiss={onClose} dismissDisabled={saving || isLoading}
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
        {/* Header */}
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
            <span className="vista-plain-icon"><SquarePen
                style={{ width: "16px", height: "16px", color: "var(--ui-navy)" }}
              /></span>
            <div>
              <h2
                id="edit-user-title"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--ui-navy)",
                  margin: 0,
                }}
              >
                Edit User
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
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
          <button aria-busy={Boolean(saving || isLoading)} data-ui="icon"
            type="button"
            onClick={onClose}
            disabled={saving || isLoading}
            style={{
              background: "var(--ui-selected)",
              border: "none",
              borderRadius: "var(--radius-control)",
              width: "30px",
              height: "30px",
              cursor: saving || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ui-navy)",
              opacity: saving || isLoading ? 0.5 : 1,
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
              fontFamily: "var(--font-body)",
              fontWeight: "700",
              fontSize: "15px",
              color: "var(--ui-blue)",
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
                fontFamily: "var(--font-body)",
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
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "var(--ui-muted)",
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
              fontFamily: "var(--font-body)",
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
              disabled={saving || isLoading}
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

          {/* Organization (only for students) */}
          {form.role === "student" && (
            <Field label="Organization *" htmlFor="edit-user-organization">
              <OrganizationPicker
                id="edit-user-organization"
                value={form.orgId}
                onChange={(orgId) => set("orgId", orgId)}
                disabled={saving || isLoading}
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
              borderRadius: "var(--radius-chip)",
              padding: "12px 14px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
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
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--ui-muted)",
                  margin: "2px 0 0",
                }}
              >
                {form.isActive
                  ? "User can currently log in."
                  : "Account is inactive — user cannot log in."}
              </p>
            </div>
            <button aria-label="Account status" aria-busy={Boolean(saving || isLoading)} data-ui="toggle"
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
                  background: "var(--ui-surface)",
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
          <button aria-busy={Boolean(saving || isLoading)} data-ui="secondary"
            type="button"
            onClick={onClose}
            disabled={saving || isLoading}
            style={{ cursor: saving || isLoading ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button aria-busy={Boolean(saving || isLoading)} data-ui="primary"
            type="button"
            onClick={handleSave}
            disabled={saving || isLoading}
            style={{ cursor: saving || isLoading ? "not-allowed" : "pointer", opacity: saving || isLoading ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DialogLayer>
  );
}
