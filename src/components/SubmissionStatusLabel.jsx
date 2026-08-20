/**
 * SubmissionStatusLabel
 *
 * Coloured dot + coloured text label for document submission statuses.
 * Used in ReviewTrackerTable (student) and RecentSubmissionsTable (staff).
 *
 * Status values map to Django model choices:
 *   pending | under_review | approved | rejected | resubmission_required
 *
 * Props:
 *  - status {string} — raw submission status string from the API
 */
const STATUS_CONFIG = {
  pending: { label: "New", color: "#1d4ed8" },
  under_review: { label: "Reviewing", color: "#b45309" },
  approved: { label: "Verified", color: "#15803d" },
  rejected: { label: "Flagged", color: "#b91c1c" },
  resubmission_required: { label: "Resubmission Required", color: "#6d28d9" },
};

export default function SubmissionStatusLabel({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    color: "#6b7280",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-inter font-bold whitespace-nowrap"
      style={{ fontSize: "13px", color: config.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
