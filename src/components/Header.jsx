import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Download, Menu, QrCode, X } from "lucide-react";
import vistaLogo from "../assets/shared/vista_logo.png";
import { getHeaderConfig } from "../config/navigation";
import { useCurrentUser, useLogout } from "../hooks/useAuth";

const ANDROID_APK_URL =
  "https://github.com/V-I-S-T-A/VISTA-MOBILE/releases/latest/download/vista-mobile.apk";

export default function Header({ layout = "public", profilePath, onMenuToggle }) {
  const navigate = useNavigate();
  const config = getHeaderConfig(layout);
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAppQrOpen, setIsAppQrOpen] = useState(false);
  const [isQrUnavailable, setIsQrUnavailable] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await logoutMutation.mutateAsync({ refresh });
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  };

  if (config.type === "dashboard") {
    return (
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div className="flex items-center">
          {/* Hamburger — visible only on mobile via CSS */}
          <button
            type="button"
            className="hamburger-btn"
            onClick={onMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="font-inter text-sm font-medium text-[#1a51a5]">
            {config.title}
          </h1>
        </div>

        {profilePath ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex-shrink-0 rounded-full transition hover:opacity-80 focus:outline-none"
              aria-label="Toggle profile menu"
            >
              <img
                src={currentUser?.image_url ?? config.avatar}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 top-full z-20"
                style={{
                  marginTop: "8px",
                  width: "180px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6ee",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate(profilePath);
                  }}
                  className="block w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] transition-colors"
                  style={{
                    padding: "10px 14px",
                    fontSize: "13px",
                    borderRadius: "6px",
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left font-inter font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  style={{
                    padding: "10px 14px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    marginTop: "4px",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <img
            src={currentUser?.image_url ?? config.avatar}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
        )}
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white"
      style={{
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      <div className="header-left">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="header-brand-link cursor-pointer border-none bg-transparent p-0"
        >
          <h1 className="font-inter text-2xl font-black text-[#1A51A5]">
            V.I.S.T.A.
          </h1>
        </button>
      </div>

      <div className="header-right flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="btn btn-primary"
        >
          Login
          <ArrowRight className="btn-icon" aria-hidden="true" />
        </button>

        <a
          className="btn btn-outline get-app-link"
          href={ANDROID_APK_URL}
          download="vista-mobile.apk"
          aria-label="Download the VISTA Android app APK"
        >
          Get the app
          <Download className="btn-icon" aria-hidden="true" />
        </a>
        <button
          type="button"
          className="get-app-qr-button"
          onClick={() => {
            setIsQrUnavailable(false);
            setIsAppQrOpen(true);
          }}
          aria-label="Show QR code to download the VISTA Android app"
          title="Scan to download on your phone"
        >
          <QrCode aria-hidden="true" />
        </button>

        <img
          src={vistaLogo}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
          aria-hidden="true"
        />
      </div>
      {isAppQrOpen && (
        <div
          className="app-download-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAppQrOpen(false);
          }}
        >
          <section
            className="app-download-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-download-title"
          >
            <button
              type="button"
              className="app-download-close"
              onClick={() => setIsAppQrOpen(false)}
              aria-label="Close download dialog"
            >
              <X size={20} />
            </button>
            <h2 id="app-download-title">Get VISTA for Android</h2>
            {!isQrUnavailable ? (
              <img
                className="app-download-qr"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ANDROID_APK_URL)}`}
                alt="QR code linking directly to the VISTA Android APK download"
                onError={() => setIsQrUnavailable(true)}
              />
            ) : (
              <p className="app-download-fallback">
                QR code is unavailable. Open this page on your phone or use the download link below.
              </p>
            )}
            <p>Scan with your phone camera to download the APK.</p>
            <a href={ANDROID_APK_URL} download="vista-mobile.apk">
              Download vista-mobile.apk
            </a>
          </section>
        </div>
      )}
    </header>
  );
}
