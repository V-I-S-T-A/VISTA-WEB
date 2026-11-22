import { cloneElement, isValidElement, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import VistaSelect from "./VistaSelect";
import AnchoredPopover from "./AnchoredPopover";
import CalendarPopover from "./CalendarPopover";

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

  return (
    <AnchoredPopover
      ref={ref}
      onDismiss={onClose}
      aria-label="Table filters"
      className="vista-filter-popover absolute right-0 top-full z-20"
      style={{
        marginTop: "8px",
        width: "288px",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--ui-border)",
        backgroundColor: "var(--ui-surface)",
        boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
        padding: "16px",
      }}
    >
      {/* Filter rows injected by caller */}
      {children}

      {/* Footer actions */}
      {(showClear || showDone) && (
        <div className="vista-filter-footer flex items-center justify-between mt-4">
          {showClear && (
            <button data-ui="tertiary"
              type="button"
              onClick={onClear}
              className="font-inter font-semibold text-gray-500 hover:text-gray-700"
              style={{ fontSize: "12px" }}
            >
              Clear filters
            </button>
          )}
          {showDone && (
            <button data-ui="primary"
              type="button"
              onClick={onClose}
              className="font-inter font-bold transition-colors"
              style={{ marginLeft: showClear ? undefined : "auto" }}


            >
              Done
            </button>
          )}
        </div>
      )}
    </AnchoredPopover>
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
      {isValidElement(children) ? cloneElement(children, { "aria-label": label }) : children}
    </div>
  );
}

/**
 * FilterSelect
 *
 * Shared VISTA dropdown for use inside FilterPopoverRow.
 *
 * Props:
 *  - value    {string}   — controlled value
 *  - onChange {function} — (e) => void
 *  - children {ReactNode} — <option> elements
 */
export function FilterSelect({ value, onChange, children, ...props }) {
  return (
    <VistaSelect
      {...props}
      value={value}
      onChange={onChange}
      className="w-full font-inter outline-none"
      style={{
        borderRadius: "var(--radius-field)",
        border: "1px solid #d1d5db",
        padding: "8px 10px",
        fontSize: "14px",
      }}
    >
      {children}
    </VistaSelect>
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
export function FilterDateInput({ value, onChange, disabled = false, min, max, name, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef(null);
  const label = props["aria-label"] || "Date";
  return <div className="relative">
    <div className="vista-date-field">
      <input {...props} type="date" value={value} onChange={onChange} name={name} min={min} max={max} disabled={disabled} />
      <button data-ui="icon" ref={trigger} type="button" disabled={disabled} aria-label={`Choose ${label.toLowerCase()} from calendar`} aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}><CalendarDays size={17} aria-hidden="true" /></button>
    </div>
    {isOpen && <CalendarPopover label={`${label} calendar`} value={value} min={min} max={max} allowClear onClose={() => setIsOpen(false)}
      onSelect={date => { onChange?.({ target: { name, value: date, type: "date" } }); setIsOpen(false); trigger.current?.focus(); }} />}
  </div>;
}
