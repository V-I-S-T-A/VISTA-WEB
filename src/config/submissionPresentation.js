// Display only. API identifiers, transition permissions and filter values remain
// owned by their existing services. Colors mirror VISTA Mobile's statusTones.
export const submissionPresentation = {
  pending: { label: 'New / Pending', color: 'var(--ui-warning)' },
  under_review: { label: 'On Process', color: 'var(--ui-blue)' },
  approved: { label: 'Approved', color: 'var(--ui-success)' },
  rejected: { label: 'Returned', color: 'var(--ui-danger)' },
  resubmission_required: { label: 'Resubmission Required', color: '#c2410c' },
};

export function getSubmissionPresentation(status) {
  return Object.hasOwn(submissionPresentation, status) ? submissionPresentation[status]
    : { label: status || 'Unknown status', color: 'var(--ui-muted)' };
}
