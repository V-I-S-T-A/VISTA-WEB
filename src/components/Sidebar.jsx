import { useNavigate, useLocation } from "react-router-dom";
import { Users, FileText, LogOut, LayoutDashboard, ClipboardList, ClipboardCheck, CloudUpload } from "lucide-react";
import { getSidebarConfig } from "../config/navigation";
import { useCurrentUser, useLogout } from "../hooks/useAuth";

const ICON_MAP = {
  Users,
  FileText,
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  CloudUpload,
};

export default function Sidebar({ role = "admin" }) {
  const config = getSidebarConfig(role);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  if (!config) return null;

  return (
    <aside className="sticky top-0 flex h-screen w-[275px] flex-col bg-[#1f5cae] text-white justify-between">
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div style={{ paddingTop: "38px" }}>
          <div
            className="flex items-center justify-center gap-3.5"
            style={{ paddingLeft: "12px", paddingRight: "12px" }}
          >
            <img
              src={config.logo}
              alt=""
              className="h-14 w-14 object-contain"
              aria-hidden="true"
            />

            <h1 className="font-inter text-3xl font-black tracking-wide leading-none">
              {config.brand}
            </h1>
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

          <div
            className="flex items-center gap-3.5"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              marginTop: "14px",
            }}
          >
            <img
              src={currentUser?.avatar ?? config.user.avatar}
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
                  ? "Loading..."
                  : (currentUser?.full_name ?? config.user.name)}
              </p>
            </div>
          </div>
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
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.label}
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
          <button
            type="button"
            onClick={async () => {
              try {
                const refresh = localStorage.getItem("refresh_token");
                await logoutMutation.mutateAsync({ refresh });
              } catch (err) {
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
