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
import { getSubmissionPresentation } from '../config/submissionPresentation';

export default function SubmissionStatusLabel({ status }) {
  const config = getSubmissionPresentation(status);
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
