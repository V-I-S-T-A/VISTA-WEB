/**
 * BackButton
 *
 * The yellow pill-style back button used consistently across detail pages
 * (e.g. Audit Log Details, Review Tracker Details, OCR Results).
 *
 * Props:
 *  - onClick  {function}  — callback when the button is clicked
 *  - children {ReactNode} — button label (defaults to "Back")
 */
export default function BackButton({ onClick, children = "Back" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center transition hover:brightness-110 active:scale-95"
      style={{
        borderRadius: "9999px",
        backgroundColor: "#FFE452",
        padding: "4px",
        border: "none",
        cursor: "pointer",
      }}
    >
      <div
        className="flex items-center gap-1.5 font-inter text-[#1a1a1a]"
        style={{
          fontSize: "14px",
          padding: "4px 16px",
          borderRadius: "9999px",
          backgroundColor: "#FFF2A8",
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>›</span>
        {children}
      </div>
    </button>
  );
}
