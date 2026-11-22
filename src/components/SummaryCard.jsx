import { Skeleton } from "./loading/Skeleton";
/**
 * SummaryCard
 *
 * Coloured stats card showing a label, a large numeric value, and a ghost icon.
 * Used in UserSummaryCards (admin), SubmissionSummaryCards (staff & student).
 *
 * Two visual variants are supported via the `size` prop:
 *  - "lg"  — taller card, larger value font (used for the wide/featured card)
 *  - "sm"  — standard card height (used for supporting stats)
 *
 * Props:
 *  - label     {string}          — card label, e.g. "Total Users"
 *  - value     {string|number}   — the statistic value displayed prominently
 *  - icon      {ComponentType}   — Lucide icon component (not JSX)
 *  - bg        {string}          — Tailwind bg-* class, e.g. "bg-[var(--ui-blue)]"
 *  - isLoading {boolean}         — shows "—" when true
 *  - size      {"lg"|"sm"}       — card variant (default "sm")
 *  - className {string}          — additional classes for the wrapper (e.g. col-span)
 */
export default function SummaryCard({
  label,
  value,
  icon: Icon,
  bg = "bg-[var(--ui-blue)]",
  isLoading = false,
  size = "sm",
  className = "",
}) {
  const isLarge = size === "lg";

  return (
    <div
      className={`vista-summary-card relative overflow-hidden ${bg} text-white flex flex-col justify-between ${className}`}
      style={{
        padding: isLarge ? "16px 20px" : "20px 22px",
        minHeight: isLarge ? "150px" : "140px",
      }}
    >
      {/* Label */}
      <p
        className="relative z-10 font-inter font-semibold text-white/90"
        style={{ fontSize: isLarge ? "13px" : "14px" }}
      >
        {label}
      </p>

      {isLarge ? (
        /* Large variant — big number + ghost icon positioned on right */
        <>
          <p
            className="relative z-10 font-inter font-bold leading-none"
            style={{ fontSize: "72px" }}
          >
            {isLoading ? <Skeleton width={72} height={40} /> : String(value)}
          </p>
          <Icon
            className="absolute text-white/20"
            style={{
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "88px",
              height: "88px",
            }}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </>
      ) : (
        /* Small variant — number + icon in a row at the bottom */
        <div className="flex items-end justify-between">
          <p
            className="font-inter font-bold leading-none"
            style={{ fontSize: "44px" }}
          >
            {isLoading ? <Skeleton width={72} height={40} /> : String(value)}
          </p>
          <span className="vista-plain-icon"><Icon style={{ width: "22px", height: "22px" }} aria-hidden="true" /></span>
        </div>
      )}
    </div>
  );
}
