import { useEffect, useState } from "react";
import ProfileAvatarUpload from "./ProfileAvatarUpload";
import osaLogo from "../../../../assets/shared/osa_logo.png";
import { useProfile, useUpdateProfile } from "../../../../hooks/useProfile";

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

const PILL_CLASS =
  "w-full bg-white font-inter text-gray-900 placeholder:text-gray-400 outline-none rounded-full border-none";

const pillStyle = {
  height: "46px",
  padding: "0 20px",
  fontSize: "14px",
};

export default function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    // NOTE: phone/dob/gender aren't fields on the backend User model yet.
    // They're kept here as local-only UI state and are NOT sent on submit.
    // Add them to the Django model + UserUpdateSerializer to persist them.
    phone: "",
    dob: "",
    gender: "",
  });

  // Populate the form once the current user's profile has loaded.
  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
    }));
  }, [profile]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Only send fields the backend's UserUpdateSerializer actually accepts.
    // email/role/is_active are not editable through this endpoint.
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      ...(avatarFile ? { image: avatarFile } : {}),
    };

    updateProfile.mutate(payload, {
      onSuccess: () => setAvatarFile(null),
    });
  }

  function handleCancel() {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
    }));
    setAvatarFile(null);
  }

  return (
    <div
      className="w-full rounded-2xl bg-[#1f5cae]"
      style={{ padding: "32px", marginTop: "20px" }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row"
        style={{ gap: "36px" }}
      >
        <ProfileAvatarUpload
          avatarUrl={profile?.image_url}
          onAvatarChange={setAvatarFile}
        />

        <div
          className="flex-1 flex flex-col"
          style={{ gap: "12px", maxWidth: "520px" }}
        >
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="First Name"
            className={PILL_CLASS}
            style={pillStyle}
            disabled={isLoading}
          />
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="Last Name"
            className={PILL_CLASS}
            style={pillStyle}
            disabled={isLoading}
          />
          <input
            type="email"
            value={form.email}
            placeholder="Email"
            className={PILL_CLASS}
            style={{ ...pillStyle, opacity: 0.7, cursor: "not-allowed" }}
            disabled
            readOnly
            title="Email can't be changed from this form yet"
          />

          {/* Phone number with country code */}
          <div
            className="flex items-center bg-white rounded-full"
            style={{ height: "46px", padding: "0 20px" }}
          >
            <span style={{ fontSize: "18px" }} aria-hidden="true">
              🇵🇭
            </span>
            <span
              className="font-inter text-gray-700"
              style={{ fontSize: "14px", margin: "0 10px 0 8px" }}
            >
              +63
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Phone number"
              className="flex-1 font-inter text-gray-900 placeholder:text-gray-400 outline-none border-none bg-transparent"
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* Date of Birth + Gender */}
          <div className="grid grid-cols-2" style={{ gap: "12px" }}>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className={PILL_CLASS}
              style={{ ...pillStyle, color: form.dob ? "#111827" : "#9ca3af" }}
            />
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={PILL_CLASS}
              style={{
                ...pillStyle,
                color: form.gender ? "#111827" : "#9ca3af",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled hidden>
                Gender
              </option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {updateProfile.isError && (
            <p style={{ color: "#ffe1e1", fontSize: "13px", margin: 0 }}>
              Couldn't update your profile. Please try again.
            </p>
          )}
          {updateProfile.isSuccess && (
            <p style={{ color: "#e1ffe6", fontSize: "13px", margin: 0 }}>
              Profile updated.
            </p>
          )}

          {/* Action buttons */}
          <div
            className="flex items-center"
            style={{ gap: "12px", marginTop: "10px" }}
          >
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="font-inter font-bold rounded-full transition hover:brightness-95 active:scale-95"
              style={{
                backgroundColor: "#FFC933",
                color: "#5a3d00",
                fontSize: "13px",
                padding: "11px 32px",
                border: "none",
                cursor: updateProfile.isPending ? "wait" : "pointer",
                opacity: updateProfile.isPending ? 0.7 : 1,
              }}
            >
              {updateProfile.isPending ? "Saving..." : "Update Profile"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="font-inter font-bold rounded-full transition hover:bg-gray-50 active:scale-95"
              style={{
                backgroundColor: "#fff",
                color: "#1f5cae",
                fontSize: "13px",
                padding: "11px 28px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

          {/* Org branding footer */}
          <div
            className="flex items-center"
            style={{ gap: "12px", marginTop: "22px" }}
          >
            <img
              src={osaLogo}
              alt="Office of Student Affairs"
              style={{
                width: "38px",
                height: "38px",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <p
              className="font-inter text-white"
              style={{ fontSize: "13px", lineHeight: 1.4 }}
            >
              <span className="font-bold">Office of Student Affairs</span> —
              University of Science and Technology of Southern Philippines, CdO
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
