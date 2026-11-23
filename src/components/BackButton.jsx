/**
 * BackButton
 *
 * Shared secondary navigation action across detail pages
 * (e.g. Audit Log Details, Review Tracker Details, OCR Results).
 *
 * Props:
 *  - onClick  {function}  — callback when the button is clicked
 *  - children {ReactNode} — button label (defaults to "Back")
 */
export default function BackButton({ onClick, children = "Back" }) {
  return (
    <button data-ui="navigation"
      className="vista-back-button"
      type="button"
      onClick={onClick}
    >
        <span aria-hidden="true">›</span>
        {children}
    </button>
  );
}
