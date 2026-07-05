import {
  CheckCircle2,
  RefreshCw,
  Trash2,
  LogIn,
  LogOut,
  ArrowRightLeft,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuditLogs } from "../../../../hooks/useAuditLogs";

const ACTION_ICON = {
  create: { icon: CheckCircle2, color: "#16a34a" },
  update: { icon: RefreshCw, color: "#2563eb" },
  delete: { icon: Trash2, color: "#dc2626" },
  login: { icon: LogIn, color: "#16a34a" },
  logout: { icon: LogOut, color: "#6b7280" },
  status_change: { icon: ArrowRightLeft, color: "#7c3aed" },
};

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function describeLog(log) {
  const actor = log.performed_by || "System";
  const table = (log.table_name || "").replace(/^tbl_/i, "");

  switch (log.action) {
    case "login":
      return `${actor} logged in`;
    case "logout":
      return `${actor} logged out`;
    case "create":
      return `${actor} created a record in ${table}`;
    case "update":
      return `${actor} updated a record in ${table}`;
    case "delete":
      return `${actor} deleted a record in ${table}`;
    case "status_change": {
      const oldStatus = log.changes?.old_status;
      const newStatus = log.changes?.new_status;
      if (oldStatus && newStatus) {
        return `${actor} changed a ${table} record from "${oldStatus}" to "${newStatus}"`;
      }
      return `${actor} changed a status on ${table}`;
    }
    default:
      return `${actor} performed an action on ${table}`;
  }
}

export default function AuditLogWidget() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAuditLogs({ page: 1, pageSize: 5 });
  const logs = data?.results ?? [];

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col"
      style={{ padding: "1rem" }}
    >
      <div className="px-6 pt-5 pb-3">
        <h3 className="font-inter text-[16px] font-bold text-[#142d55]">
          Audit Logs
        </h3>
      </div>

      <div className="px-6 flex-1">
        {isLoading ? (
          <p className="font-inter text-sm text-gray-500 py-6">
            Loading audit logs...
          </p>
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 py-6 font-inter">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Couldn't load audit logs.
          </div>
        ) : logs.length === 0 ? (
          <p className="font-inter text-sm text-gray-500 py-6">
            No audit activity in the last 24 hours.
          </p>
        ) : (
          <ul>
            {logs.map((log, index) => {
              const config = ACTION_ICON[log.action] ?? {
                icon: AlertCircle,
                color: "#6b7280",
              };
              const Icon = config.icon;
              return (
                <li
                  key={log.audit_id}
                  className={`flex gap-3 py-3 ${index !== logs.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: "28px",
                      height: "28px",
                      border: `1.5px solid ${config.color}`,
                    }}
                  >
                    <Icon
                      style={{
                        width: "14px",
                        height: "14px",
                        color: config.color,
                      }}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-inter text-[12px] text-gray-400">
                      {formatRelativeTime(log.performed_at)}
                    </p>
                    <p className="font-inter text-[13px] font-semibold text-gray-800 leading-snug">
                      {describeLog(log)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate("/staff/audit-logs")}
        className="w-full font-inter text-[12px] font-bold text-[#1f5cae] tracking-wide py-3.5 border-t border-gray-100 hover:bg-gray-50 transition-colors"
      >
        VIEW ALL LOGS
      </button>
    </div>
  );
}
