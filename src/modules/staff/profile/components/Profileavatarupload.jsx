import { Camera } from "lucide-react";
import defaultAvatar from "../../../../assets/shared/default_user.jpg";

export default function ProfileAvatarUpload({ avatarUrl, onAvatarChange }) {
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(URL.createObjectURL(file));
    }
  }

  return (
    <div
      className="flex flex-col items-center flex-shrink-0"
      style={{ width: "150px" }}
    >
      <div className="relative">
        <img
          src={avatarUrl || defaultAvatar}
          alt="Profile avatar"
          className="rounded-full object-cover"
          style={{
            width: "140px",
            height: "140px",
            border: "3px solid rgba(255,255,255,0.35)",
          }}
        />
        <label
          htmlFor="profile-avatar-upload"
          className="absolute flex items-center justify-center rounded-full bg-white cursor-pointer shadow-md transition hover:bg-gray-100"
          style={{ width: "34px", height: "34px", right: "2px", bottom: "2px" }}
        >
          <Camera
            style={{ width: "16px", height: "16px" }}
            className="text-[#1f5cae]"
            aria-hidden="true"
          />
          <input
            id="profile-avatar-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <p
        className="font-inter font-bold text-white"
        style={{ fontSize: "14px", marginTop: "12px" }}
      >
        Edit Profile
      </p>
    </div>
  );
}
