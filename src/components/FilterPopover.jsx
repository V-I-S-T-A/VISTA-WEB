import { useEffect, useRef } from "react";

/**
 * FilterPopover
 *
 * Dropdown white-card filter panel. Closes when clicking outside.
 * Renders any filter rows (selects, date inputs, etc.) as children.
 *
 * Props:
 *  - children  {ReactNode} — filter field rows (label + input pairs)
 *  - onClear   {function}  — called when "Clear filters" is clicked
 *  - onClose   {function}  — called when "Done" is clicked or user clicks outside
 *  - showClear {boolean}   — show the "Clear filters" link (default true)
 *  - showDone  {boolean}   — show the "Done" button (default true)
 */
export default function FilterPopover({
  children,
  onClear,
  onClose,
  showClear = true,
  showDone = true,
}) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-20"
      style={{
        marginTop: "8px",
        width: "288px",
        borderRadius: "10px",
        border: "1px solid #e2e6ee",
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
        padding: "16px",
      }}
    >
      {/* Filter rows injected by caller */}
      {children}

      {/* Footer actions */}
      {(showClear || showDone) && (
        <div className="flex items-center justify-between mt-4">
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              className="font-inter font-semibold text-gray-500 hover:text-gray-700"
              style={{ fontSize: "12px" }}
            >
              Clear filters
            </button>
          )}
          {showDone && (
            <button
              type="button"
              onClick={onClose}
              className="font-inter font-bold text-white transition-colors"
              style={{
                borderRadius: "8px",
                backgroundColor: "#003370",
                padding: "7px 14px",
                fontSize: "12px",
                marginLeft: showClear ? undefined : "auto",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#16385f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#003370")
              }
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * FilterPopoverRow
 *
 * A labelled filter field row for use inside FilterPopover.
 *
 * Props:
 *  - label    {string}    — uppercase field label
 *  - children {ReactNode} — the input/select element
 */
export function FilterPopoverRow({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * FilterSelect
 *
 * Styled <select> element for use inside FilterPopoverRow.
 *
 * Props:
 *  - value    {string}   — controlled value
 *  - onChange {function} — (e) => void
 *  - children {ReactNode} — <option> elements
 */
export function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full font-inter outline-none"
      style={{
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        padding: "8px 10px",
        fontSize: "14px",
      }}
    >
      {children}
    </select>
  );
}

/**
 * FilterDateInput
 *
 * Styled date input for use inside FilterPopoverRow.
 *
 * Props:
 *  - value    {string}   — controlled value (YYYY-MM-DD)
 *  - onChange {function} — (e) => void
 */
export function FilterDateInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full font-inter outline-none cursor-pointer"
      style={{
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        padding: "8px 10px",
        fontSize: "14px",
      }}
    />
  );
}
