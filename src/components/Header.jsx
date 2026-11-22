import DialogLayer from "./DialogLayer";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Download, Menu, QrCode, X } from "lucide-react";
import vistaLogo from "../assets/shared/vista_logo.webp";
import downloadQr from "../assets/public/vista_v1.0.8.webp";
import { getHeaderConfig } from "../config/navigation";
import { useCurrentUser, useLogout } from "../hooks/useAuth";
import { Skeleton } from "./loading/Skeleton";

import { ANDROID_APK_URL, ANDROID_VERSION_LABEL, APP_ONBOARDING_PATH } from "../config/appDownload";
import NotificationCenter from "./NotificationCenter";
import AnchoredPopover from "./AnchoredPopover";

export default function Header({ layout = "public", profilePath, onMenuToggle }) {
  const navigate = useNavigate();
  const config = getHeaderConfig(layout);
  const profileRole = profilePath?.split("/")[1];
  const profileTitle = {
    admin: "Admin Profile",
    staff: "Staff Profile",
    student: "Student Profile",
  }[profileRole];
  const headerTitle = layout === "profile" ? profileTitle || config.title : config.title;
  const { data: currentUser, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAppQrOpen, setIsAppQrOpen] = useState(false);
  const [isQrUnavailable, setIsQrUnavailable] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownPanelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !dropdownPanelRef.current?.contains(event.target)) {
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
        className="dashboard-header sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div className="flex items-center">
          {/* Hamburger — visible only on mobile via CSS */}
          <button data-ui="navigation"
            type="button"
            className="hamburger-btn"
            onClick={onMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="font-inter text-sm font-medium text-[#1a51a5]">
            {headerTitle}
          </h1>
        </div>

        {profilePath ? (
          <div className="flex items-center gap-3">
            {currentUser?.user_id && <NotificationCenter />}
          <div className="relative" ref={dropdownRef}>
            <button data-ui="navigation"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="vista-profile-trigger flex-shrink-0 rounded-full transition hover:opacity-80"
              aria-label="Toggle profile menu"
              aria-expanded={isDropdownOpen}
            >
              {isLoading ? <Skeleton circle width={40} height={40} /> : <img
                src={currentUser?.image_url ?? config.avatar}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />}
            </button>

            {isDropdownOpen && (
              <AnchoredPopover
                ref={dropdownPanelRef}
                onDismiss={() => setIsDropdownOpen(false)}
                aria-label="Profile actions"
                className="vista-profile-menu absolute right-0 top-full z-20"
                style={{
                  marginTop: "8px",
                  width: "180px",
                  borderRadius: "var(--radius-chip)",
                  border: "1px solid #b8cbe0",
                  backgroundColor: "#f7faff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "8px",
                }}
              >
                <button data-ui="navigation"
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate(profilePath);
                  }}
                  className="block w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] transition-colors"
                  style={{
                    padding: "10px 14px",
                    fontSize: "13px",
                    borderRadius: "var(--radius-control)",
                  }}
                >
                  Profile
                </button>
                <button data-ui="navigation"
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left font-inter font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  style={{
                    padding: "10px 14px",
                    fontSize: "13px",
                    borderRadius: "var(--radius-control)",
                    marginTop: "4px",
                  }}
                >
                  Logout
                </button>
              </AnchoredPopover>
            )}
          </div>
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
    <header className="public-header">
      <div className="public-shell public-header-inner">
      <div className="header-left">
        <button data-ui="navigation"
          type="button"
          onClick={() => navigate("/")}
          className="header-brand-link cursor-pointer border-none bg-transparent p-0"
        >
          <span className="public-brand-name">VISTA</span>
        </button>
      </div>

      <nav className="header-right" aria-label="Public navigation">
        <button data-ui="navigation"
          type="button"
          onClick={() => navigate("/login")}
          className="btn btn-primary"
        >
          Login
          <ArrowRight className="btn-icon" aria-hidden="true" />
        </button>

        <Link
          className="btn btn-outline get-app-link"
          to={APP_ONBOARDING_PATH}
          aria-label="Get the VISTA app"
        >
          <span className="app-label-full">Get the app</span><span className="app-label-short">Get app</span>
          <Download className="btn-icon" aria-hidden="true" />
        </Link>
        <button data-ui="navigation"
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
      </nav>
      </div>
      {isAppQrOpen && (
        <DialogLayer aria-labelledby="app-download-title" label={"Get VISTA for Android"} onDismiss={() => setIsAppQrOpen(false)} dismissDisabled={false}
          className="app-download-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAppQrOpen(false);
          }}
        >
          <section className="app-download-dialog">
            <div className="app-download-brand"><img src={vistaLogo} alt="" /><span>VISTA</span></div>
            <button data-ui="navigation"
              type="button"
              className="app-download-close"
              onClick={() => setIsAppQrOpen(false)}
              aria-label="Close download dialog"
            >
              <X size={20} />
            </button>
            <div className="app-download-qr-card">
            {!isQrUnavailable ? (
              <img
                className="app-download-qr"
                src={downloadQr}
                alt="Scan to open the VISTA Android build on Expo"
                width="540"
                height="540"
                onError={() => setIsQrUnavailable(true)}
              />
            ) : (
              <p className="app-download-fallback">
                QR code is unavailable. Open this page on your phone or use the download link below.
              </p>
            )}
            </div>
            <h2 id="app-download-title">Scan to Get VISTA</h2>
            <span className="app-download-version">Version {ANDROID_VERSION_LABEL}</span>
            <p>Open your Android phone’s camera and scan this QR code to download the VISTA APK.</p>
            <a href={ANDROID_APK_URL}>
              <Download size={19} aria-hidden="true" />Download APK Directly
            </a>
          </section>
        </DialogLayer>
      )}
    </header>
  );
}
