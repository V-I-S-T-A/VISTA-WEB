import { Image as ImageIcon } from "lucide-react";

/**
 * ActionButton
 *
 * Global action button for viewing/reviewing submissions across all modules
 * (staff and student).
 *
 * Matches the staff review panel / dashboard action buttons:
 *  - Gold background: #ffc700
 *  - Rounded corners: rounded (4px)
 *  - Font: font-inter font-bold text-gray-900 (12px)
 *  - Icon: ImageIcon (13x13px)
 *  - Label: "VIEW" or "VIEW & REVIEW"
 *
 * Props:
 *  - onClick   {function}  — click handler
 *  - label     {string}    — button text (default: "VIEW")
 *  - icon      {ReactNode} — optional icon replacement
 *  - className {string}    — optional extra classes
 *  - style     {object}    — optional extra inline styles
 */
export default function ActionButton({
  onClick,
  label = "VIEW",
  icon,
  className = "",
  style = {},
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95 whitespace-nowrap ${className}`}
      style={{
        fontSize: "12px",
        padding: "6px 14px",
        backgroundColor: "#ffc700",
        cursor: "pointer",
        ...style,
      }}
      {...rest}
    >
      {icon !== undefined ? (
        icon
      ) : (
        <ImageIcon
          style={{ width: "13px", height: "13px" }}
          aria-hidden="true"
        />
      )}
      {label}
    </button>
  );
}
