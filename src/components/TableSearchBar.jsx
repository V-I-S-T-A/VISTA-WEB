import { Search } from "lucide-react";

/**
 * TableSearchBar
 *
 * White search input with a left-anchored magnifier icon. Used in every table
 * header bar across all modules (admin, staff, student).
 *
 * Props:
 *  - value       {string}   — controlled input value
 *  - onChange    {function} — (e) => void — native input change handler
 *  - onKeyDown   {function} — (e) => void — optional keydown (e.g. Enter to search)
 *  - placeholder {string}   — input placeholder text
 *  - width       {string}   — CSS width of the container (default "300px")
 */
export default function TableSearchBar({
  value,
  onChange,
  onKeyDown,
  placeholder = "Search...",
  width = "300px",
}) {
  return (
    <div className="relative" style={{ width }}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
        style={{ width: "16px", height: "16px" }}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none disabled:opacity-50"
        style={{
          height: "36px",
          border: "1.5px solid #d1d5db",
          borderRadius: "8px",
          padding: "0 12px 0 40px",
          fontSize: "13px",
        }}
      />
    </div>
  );
}
