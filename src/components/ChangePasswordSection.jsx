import { useEffect, useState } from "react";
import { Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import {
  useRequestPasswordChangeCode,
  useConfirmPasswordChange,
} from "../hooks/usePasswordChange";

const PILL_CLASS =
  "w-full bg-white font-inter text-gray-900 placeholder:text-gray-400 outline-none rounded-full border-none";

const pillStyle = { height: "46px", padding: "0 20px", fontSize: "14px" };
const RESEND_COOLDOWN = 30;

function EyeToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      style={{
        position: "absolute",
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        color: "#9ca3af",
        display: "flex",
        padding: 0,
      }}
    >
      {shown ? (
        <EyeOff style={{ width: "16px", height: "16px" }} />
      ) : (
        <Eye style={{ width: "16px", height: "16px" }} />
      )}
    </button>
  );
}

export default function ChangePasswordSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    code: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const requestCode = useRequestPasswordChangeCode();
  const confirmChange = useConfirmPasswordChange();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  function resetAll() {
    setIsOpen(false);
    setStep("form");
    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      code: "",
    });
    setError("");
    setSuccessMessage("");
    setCooldown(0);
  }

  function validateForm() {
    if (!form.oldPassword) return "Enter your current password.";
    if (!form.newPassword || form.newPassword.length < 8)
      return "New password must be at least 8 characters.";
    if (form.newPassword !== form.confirmPassword)
      return "New password and confirmation do not match.";
    return "";
  }

  async function handleSendCode() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      await requestCode.mutateAsync();
      setStep("verify");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Couldn't send a verification code. Please try again.",
      );
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError("");
    try {
      await requestCode.mutateAsync();
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't resend the code.");
    }
  }

  async function handleConfirm() {
    if (!form.code.trim()) {
      setError("Enter the verification code from your email.");
      return;
    }
    setError("");
    try {
      await confirmChange.mutateAsync({
        old_password: form.oldPassword,
        new_password: form.newPassword,
        code: form.code.trim(),
      });
      setSuccessMessage("Password updated successfully.");
      setTimeout(resetAll, 1800);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.code?.[0] ||
          err?.response?.data?.old_password?.[0] ||
          "Invalid or expired code. Please try again.",
      );
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 font-inter font-bold text-white/90 hover:text-white transition"
        style={{
          fontSize: "13px",
          padding: "4px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <ShieldCheck style={{ width: "16px", height: "16px" }} />
        Change Password
      </button>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{
        gap: "10px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="font-inter font-bold text-white"
          style={{ fontSize: "13px" }}
        >
          {step === "form" ? "Change Password" : "Verify Your Email"}
        </p>
        <button
          type="button"
          onClick={resetAll}
          className="font-inter text-white/70 hover:text-white"
          style={{
            fontSize: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      {step === "form" ? (
        <>
          <div style={{ position: "relative" }}>
            <input
              type={showOld ? "text" : "password"}
              value={form.oldPassword}
              onChange={(e) => set("oldPassword", e.target.value)}
              placeholder="Current password"
              className={PILL_CLASS}
              style={{ ...pillStyle, paddingRight: "44px" }}
            />
            <EyeToggle shown={showOld} onToggle={() => setShowOld((p) => !p)} />
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showNew ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)}
              placeholder="New password (min. 8 characters)"
              className={PILL_CLASS}
              style={{ ...pillStyle, paddingRight: "44px" }}
            />
            <EyeToggle shown={showNew} onToggle={() => setShowNew((p) => !p)} />
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Confirm new password"
              className={PILL_CLASS}
              style={{ ...pillStyle, paddingRight: "44px" }}
            />
            <EyeToggle
              shown={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
            />
          </div>

          {error && (
            <p style={{ color: "#ffe1e1", fontSize: "12px", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSendCode}
            disabled={requestCode.isPending}
            className="font-inter font-bold rounded-full transition hover:brightness-95 active:scale-95"
            style={{
              backgroundColor: "#FFC933",
              color: "#5a3d00",
              fontSize: "13px",
              padding: "11px 0",
              border: "none",
              cursor: requestCode.isPending ? "wait" : "pointer",
              opacity: requestCode.isPending ? 0.7 : 1,
            }}
          >
            {requestCode.isPending
              ? "Sending code..."
              : "Send Verification Code"}
          </button>
        </>
      ) : (
        <>
          <p
            className="font-inter text-white/85"
            style={{ fontSize: "12px", lineHeight: 1.5 }}
          >
            <Mail
              style={{
                width: "13px",
                height: "13px",
                display: "inline",
                marginRight: "4px",
              }}
            />
            We sent a 6-digit verification code to your email. Enter it below to
            confirm the change.
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={form.code}
            onChange={(e) => set("code", e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit code"
            className={PILL_CLASS}
            style={{
              ...pillStyle,
              textAlign: "center",
              letterSpacing: "0.3em",
            }}
          />

          {error && (
            <p style={{ color: "#ffe1e1", fontSize: "12px", margin: 0 }}>
              {error}
            </p>
          )}
          {successMessage && (
            <p style={{ color: "#e1ffe6", fontSize: "12px", margin: 0 }}>
              {successMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmChange.isPending}
            className="font-inter font-bold rounded-full transition hover:brightness-95 active:scale-95"
            style={{
              backgroundColor: "#FFC933",
              color: "#5a3d00",
              fontSize: "13px",
              padding: "11px 0",
              border: "none",
              cursor: confirmChange.isPending ? "wait" : "pointer",
              opacity: confirmChange.isPending ? 0.7 : 1,
            }}
          >
            {confirmChange.isPending
              ? "Verifying..."
              : "Verify & Update Password"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || requestCode.isPending}
            className="font-inter font-semibold text-white/80 hover:text-white"
            style={{
              fontSize: "12px",
              background: "none",
              border: "none",
              cursor: cooldown > 0 ? "not-allowed" : "pointer",
              padding: "2px 0",
            }}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </>
      )}
    </div>
  );
}
