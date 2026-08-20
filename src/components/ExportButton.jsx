import { Download, Loader2 } from "lucide-react";

/**
 * ExportButton
 *
 * Amber Export button with a Download icon and optional loading/spinning state.
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
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] font-inter font-semibold text-gray-900 transition-colors whitespace-nowrap disabled:opacity-60"
      style={{
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "12px",
        cursor: isLoading ? "not-allowed" : "pointer",
      }}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      {isLoading ? "Exporting..." : label}
    </button>
  );
}
