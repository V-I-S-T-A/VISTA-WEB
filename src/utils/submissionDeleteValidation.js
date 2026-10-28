const VALID_REASONS = new Set(["duplicate", "incorrect", "other"]);

export function isSubmissionDeleteReady({ reasonType, reasonDetails, confirmation }) {
  const hasReason = VALID_REASONS.has(reasonType);
  const hasOtherExplanation = reasonType !== "other" || Boolean(reasonDetails?.trim());
  return hasReason && hasOtherExplanation && confirmation === "DELETE";
}
