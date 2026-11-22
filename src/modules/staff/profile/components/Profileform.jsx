import FormField from "../../../../components/FormField";
import { PanelSkeleton } from "../../../../components/loading/Skeleton";
import { useState } from "react";
import ProfileAvatarUpload from "./Profileavatarupload";
import osaLogo from "../../../../assets/shared/osa_logo.webp";
import ChangePasswordSection from "../../../../components/ChangePasswordSection";
import DateOfBirthField from "../../../../components/DateOfBirthField";
import { useProfile, useUpdateProfile } from "../../../../hooks/useProfile";

import PhoneNumberField from "../../../../components/PhoneNumberField";
import GenderField from "../../../../components/GenderField";
import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";

const PILL_CLASS =
  "profile-input w-full font-inter outline-none";

const pillStyle = {
  height: "46px",
  padding: "0 20px",
  fontSize: "14px",
};

export default function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [avatarFile, setAvatarFile] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [draft, setForm] = useState({});
  const form = {
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone_number ?? "",
    dob: profile?.birth_date ?? "",
    gender: profile?.gender ?? "",
    ...draft,
  };

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      birth_date: form.dob || null,
      gender: form.gender,
      phone_number: form.phone,
      ...(avatarFile && avatarFile !== "REMOVE" ? { image: avatarFile } : {}),
      ...(avatarFile === "REMOVE" ? { remove_image: true } : {}),
    };

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setAvatarFile(null);
        setFormVersion((version) => version + 1);
        setForm({});
      },
    });
  }

  function handleCancel() {
    if (!profile) return;
    setForm({});
    setAvatarFile(null);
    setFormVersion((version) => version + 1);
  }

  if (isLoading) return <PanelSkeleton kind="profile" label="Loading your profile" />;

  return (
    <div
      className="profile-form-panel vista-surface w-full"
      style={{ padding: "32px", marginTop: "20px" }}
    >
      <h2 className="profile-section-title">Account details</h2>
      <form aria-label="Account details"
        onSubmit={handleSubmit}
        className="profile-form-layout flex flex-col md:flex-row"
        style={{ gap: "36px" }}
      >
        <ProfileAvatarUpload
          avatarUrl={avatarFile === "REMOVE" ? null : profile?.image_url}
          onAvatarChange={setAvatarFile}
        />

        <div
          className="profile-form-fields flex-1 flex flex-col"
          style={{ gap: "12px", maxWidth: "520px" }}
        >
          <FormField label="First name"><input
            type="text"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            aria-label="First name"
            placeholder="First Name"
            className={PILL_CLASS}
            style={pillStyle}
            disabled={isLoading}
          /></FormField>
          <FormField label="Last name"><input
            type="text"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            aria-label="Last name"
            placeholder="Last Name"
            className={PILL_CLASS}
            style={pillStyle}
            disabled={isLoading}
          /></FormField>
          <FormField label="Email"><input
            type="email"
            value={form.email}
            aria-label="Email"
            placeholder="Email"
            className={PILL_CLASS}
            style={{ ...pillStyle, opacity: 0.7, cursor: "not-allowed" }}
            disabled
            readOnly
            title="Email can't be changed from this form yet"
          /></FormField>

          <PhoneNumberField
            value={form.phone}
            onChange={(value) => set("phone", value)}
            disabled={isLoading || updateProfile.isPending}
          />

          <ChangePasswordSection forceOpen={!!profile?.must_change_password} />

          {/* Date of Birth + Gender */}
          <section className="profile-personal-section" aria-label="Personal details">
            <p className="profile-personal-heading">A little about you</p>
            <div className="profile-personal-fields">
              <div>
                <p className="profile-field-label">
                  Birth date <span>Optional</span>
                </p>
                <DateOfBirthField
                  key={`${formVersion}-${form.dob}`}
                  value={form.dob}
                  onChange={(value) => set("dob", value)}
                  disabled={isLoading || updateProfile.isPending}
                />
                <p className="profile-field-help">Type MM/DD/YYYY or choose a date from the calendar.</p>
              </div>
              <GenderField
                key={formVersion}
                value={form.gender}
                onChange={(value) => set("gender", value)}
                disabled={isLoading || updateProfile.isPending}
              />
            </div>
          </section>

          {updateProfile.isError && (
            <p className="profile-save-error" role="alert" style={{ fontSize: "13px", margin: 0 }}>
              {getApiErrorMessage(updateProfile.error, "Couldn't update your profile. Please try again.")}
            </p>
          )}
          {updateProfile.isSuccess && (
            <p className="profile-save-success" role="status" style={{ fontSize: "13px", margin: 0 }}>
              Profile updated.
            </p>
          )}

          {/* Action buttons */}
          <div
            className="flex items-center"
            style={{ gap: "12px", marginTop: "10px" }}
          >
            <button aria-busy={Boolean(updateProfile.isPending)} data-ui="primary"
              type="submit"
              disabled={updateProfile.isPending}
              className="font-inter font-bold transition hover:brightness-95 active:scale-95"
              style={{ cursor: updateProfile.isPending ? "wait" : "pointer", opacity: updateProfile.isPending ? 0.7 : 1 }}
            >
              {updateProfile.isPending ? "Saving..." : "Update Profile"}
            </button>
            <button data-ui="secondary"
              type="button"
              onClick={handleCancel}
              className="font-inter font-bold transition active:scale-95"
              style={{ cursor: "pointer" }}
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
              className="profile-branding-caption font-inter"
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
