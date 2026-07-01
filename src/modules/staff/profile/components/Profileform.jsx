import { useState } from "react";
import ProfileAvatarUpload from "./ProfileAvatarUpload";
import osaLogo from "../../../../assets/shared/osa_logo.png";

const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

const PILL_CLASS =
  "w-full bg-white font-inter text-gray-900 placeholder:text-gray-400 outline-none rounded-full border-none";

const pillStyle = {
  height: "46px",
  padding: "0 20px",
  fontSize: "14px",
};

export default function ProfileForm() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [form, setForm] = useState({
    firstName: "Jeon",
    lastName: "Wonwoo",
    email: "osa.wonujeon.1@gmail.com",
    phone: "",
    dob: "",
    gender: "",
  });

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Frontend-only for now — wire this up to your update-profile API call.
    console.log("Update profile payload:", { ...form, avatarUrl });
  }

  function handleCancel() {
    // Frontend-only for now — reset the form / navigate away as needed.
    console.log("Profile edit cancelled");
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
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
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
          />
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="Last Name"
            className={PILL_CLASS}
            style={pillStyle}
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="Email"
            className={PILL_CLASS}
            style={pillStyle}
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

          {/* Action buttons */}
          <div
            className="flex items-center"
            style={{ gap: "12px", marginTop: "10px" }}
          >
            <button
              type="submit"
              className="font-inter font-bold rounded-full transition hover:brightness-95 active:scale-95"
              style={{
                backgroundColor: "#FFC933",
                color: "#5a3d00",
                fontSize: "13px",
                padding: "11px 32px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Update Profile
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
