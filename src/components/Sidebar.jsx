import { Skeleton } from "./loading/Skeleton";
import { useEffect, useRef } from "react";
import { registerDialog } from "../utils/dialogFocus";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  Settings,
  X,
} from "lucide-react";
import GoogleDriveLogo from "./GoogleDriveLogo";
import { getSidebarConfig } from "../config/navigation";
import { useCurrentUser, useLogout } from "../hooks/useAuth";

const ICON_MAP = {
  Users,
  FileText,
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  CloudUpload: GoogleDriveLogo,
  Settings,
};

export default function Sidebar({ role = "admin", isOpen = false, onClose }) {
  const config = getSidebarConfig(role);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const displayName = [currentUser?.first_name, currentUser?.last_name]
    .filter(Boolean).join(" ").trim() || currentUser?.full_name?.trim() || config?.user.name;
  const logoutMutation = useLogout();
  const drawerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const media = window.matchMedia('(max-width: 1024px)');
    let release;
    const sync = () => {
      if (media.matches && !release) release = registerDialog(drawerRef.current, { onDismiss: onClose });
      else if (!media.matches && release) { release(); release = undefined; }
    };
    sync();
    media.addEventListener('change', sync);
    return () => { media.removeEventListener('change', sync); release?.(); };
  }, [isOpen, onClose]);

  if (!config) return null;

  return (
    <aside
      ref={drawerRef}
      aria-label="Workspace navigation"
      tabIndex={-1}
      className={[
        "vista-sidebar sticky top-0 flex h-screen w-[275px] flex-col bg-[#1f5cae] text-white justify-between",
        isOpen ? "sidebar--open" : "",
      ].join(" ")}
    >
      <div className="flex flex-col flex-1">
        {/* Mobile close button — hidden on big screens via CSS */}
        <button data-ui="navigation"
          type="button"
          onClick={onClose}
          className="sidebar-close-btn absolute top-3 right-3 items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div style={{ paddingTop: "38px" }}>
          <div className="vista-brand" aria-label="VISTA — Office of Student Affairs">
            <img src={config.logo} alt="" aria-hidden="true" />
            <div className="vista-brand__wordmark">
              <h1>{config.brand}</h1>
              <p>Office of Student Affairs</p>
            </div>
          </div>

          <div style={{ paddingLeft: "12px", paddingRight: "12px" }}>
            <p
              className="font-inter font-bold uppercase text-white/70"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                marginTop: "12px",
              }}
            >
              {config.accessLabel}
            </p>
          </div>

          {/* Profile shortcut — click avatar/name to go to the profile page */}
          <button data-ui="navigation"
            type="button"
            onClick={() => navigate(`/${role}/profile`)}
            className={`flex items-center gap-3.5 w-full rounded-md text-left transition-colors ${
              location.pathname.startsWith(`/${role}/profile`)
                ? "bg-[#ffd100] text-[#1f2937]"
                : "text-white hover:bg-white/10"
            }`}
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "6px",
              paddingBottom: "6px",
              marginTop: "10px",
            }}
            aria-label="View profile"
          >
            <img
              src={currentUser?.image_url ?? config.user.avatar}
              alt=""
              className="h-11 w-11 rounded-full object-cover border border-white/10"
              aria-hidden="true"
            />

            <div>
              <p
                className="font-inter font-bold leading-none"
                style={{ fontSize: "15px" }}
              >
                {userLoading
                  ? <Skeleton width={110} height={15} />
                  : displayName}
              </p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 space-y-1"
          style={{
            paddingLeft: "12px",
            paddingRight: "12px",
            marginTop: "14px",
          }}
        >
          {config.navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive = location.pathname.startsWith(item.path);

            return (
              <button data-ui="navigation"
                key={item.label}
                aria-current={isActive ? "page" : undefined}
                type="button"
                onClick={() => navigate(item.path)}
                className={[
                  "flex items-center gap-3.5 px-4 rounded-md transition-colors w-full",
                  isActive
                    ? "bg-[#ffd100] text-[#1f2937]"
                    : "text-white hover:bg-white/10",
                ].join(" ")}
                style={{
                  height: "46px",
                }}
              >
                {Icon && (
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={2.2}
                  />
                )}

                <span
                  className="font-inter font-bold uppercase"
                  style={{
                    fontSize: "13px",
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div>
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        />

        {/* Logout */}
        <div
          style={{
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        >
          <button data-ui="navigation"
            type="button"
            onClick={async () => {
              try {
                const refresh = localStorage.getItem("refresh_token");
                await logoutMutation.mutateAsync({ refresh });
              } catch {
                // fallback: clear tokens and navigate to login
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
              }
            }}
            className="flex items-center gap-3.5 text-white hover:text-white/80 w-full rounded-md px-4 hover:bg-white/5 transition-colors"
            style={{
              height: "46px",
            }}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />

            <span
              className="font-inter font-bold uppercase"
              style={{
                fontSize: "13px",
                letterSpacing: "0.03em",
              }}
            >
              {config.logout.label}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
