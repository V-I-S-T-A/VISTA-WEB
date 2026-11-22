import { ArrowLeft } from 'lucide-react';
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
    <button data-ui="secondary"
      type="button"
      onClick={onClick}
    >
        <ArrowLeft size={16} aria-hidden="true" />
        {children}
    </button>
  );
}
