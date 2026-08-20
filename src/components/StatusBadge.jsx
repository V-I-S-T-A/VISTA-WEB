import { memo } from "react";

/**
 * StatusBadge
 *
 * Green (Active) or grey (Inactive) dot + text badge for boolean is_active
 * fields. Used in RegisteredOrgTable and admin/staff RecentSubmissionsTable.
 *
 * Props:
 *  - isActive {boolean} — whether the entity is active
 */
const STATUS_CONFIG = {
  true: { dot: "#22c55e", text: "#16a34a", label: "Active" },
  false: { dot: "#9ca3af", text: "#6b7280", label: "Inactive" },
};

const StatusBadge = memo(function StatusBadge({ isActive }) {
  const config = STATUS_CONFIG[isActive] ?? STATUS_CONFIG.false;
  return (
    <span
      style={{ color: config.text, fontSize: "12px" }}
      className="inline-flex items-center gap-1.5 font-inter font-bold"
    >
      <span
        style={{ backgroundColor: config.dot }}
        className="h-2 w-2 rounded-full flex-shrink-0"
      />
      {config.label}
    </span>
  );
});

export default StatusBadge;
