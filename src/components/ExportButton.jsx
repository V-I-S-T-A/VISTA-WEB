import { Download, Loader2 } from "lucide-react";

/**
 * ExportButton
 *
 * Brand-blue export action with a Download icon and pending state.
 * Used in every table header bar across all modules.
 *
 * Props:
 *  - onClick   {function} — called when the button is clicked
 *  - isLoading {boolean}  — shows a spinner and "Exporting..." label when true
 *  - label     {string}   — button label (default "Export")
 */
export default function ExportButton({
  onClick,
  isLoading = false,
  label = "Export",
}) {
  return (
    <button aria-busy={Boolean(isLoading)} data-ui="primary"
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="export-btn inline-flex items-center gap-1.5 font-inter font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
      style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="btn-label">{isLoading ? "Exporting..." : label}</span>
    </button>
  );
}
