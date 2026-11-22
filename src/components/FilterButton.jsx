import { Filter } from "lucide-react";

/**
 * FilterButton
 *
 * Brand-blue Filter button with an optional active-filter count badge.
 * Used in every table header bar across all modules.
 *
 * Props:
 *  - onClick     {function} — callback when the button is clicked
 *  - activeCount {number}   — number of active filters; renders a badge when > 0
 */
export default function FilterButton({ onClick, activeCount = 0 }) {
  return (
    <button data-ui="primary"
      type="button"
      onClick={onClick}
      className="filter-btn inline-flex items-center gap-1.5 font-inter font-bold transition hover:brightness-110 active:scale-95"
      style={{  }}
    >
      <Filter style={{ width: "13px", height: "13px" }} aria-hidden="true" />
      <span className="btn-label">Filter</span>
      {activeCount > 0 && (
        <span
          className="inline-flex items-center justify-center font-bold"
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "9999px",
            backgroundColor: "var(--ui-surface)",
            color: "#12345b",
            fontSize: "10px",
            marginLeft: "4px",
          }}
        >
          {activeCount}
        </span>
      )}
    </button>
  );
}
