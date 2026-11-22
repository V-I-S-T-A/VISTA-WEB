import "./AuditActionLabel.css";

const COLORS = {
  login: ["#3b82f6", "#1d4ed8"], logout: ["#94a3b8", "#475569"],
  create: ["#22c55e", "#15803d"], update: ["#f59e0b", "#92400e"],
  delete: ["#ef4444", "#b91c1c"], status_change: ["#a855f7", "#7e22ce"],
};

export default function AuditActionLabel({ action, label }) {
  const [dot, text] = COLORS[String(action).toLowerCase().replaceAll(" ", "_")] || ["#94a3b8", "#475569"];
  return <span className="audit-action-label" style={{ color: text }}>
    <span aria-hidden="true" style={{ backgroundColor: dot }} />
    {label || String(action || "Unknown").replaceAll("_", " ").toUpperCase()}
  </span>;
}
