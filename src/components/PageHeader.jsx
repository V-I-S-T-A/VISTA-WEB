/**
 * PageHeader
 *
 * Standard page-level title + subtitle header block used across all module
 * pages (UserManagementHeader, AuditLogHistory header, ReviewTrackerHeader, etc.).
 *
 * Props:
 *  - title    {string}    — main page heading (h2)
 *  - subtitle {string}    — supporting description below the title
 *  - children {ReactNode} — optional right-side action buttons slot
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div
      className="flex items-start justify-between w-full"
      style={{ marginBottom: "14px" }}
    >
      <div>
        <h2
          className="font-inter font-bold text-[#142d55]"
          style={{ fontSize: "26px", lineHeight: 1.15 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="font-inter text-gray-500 mt-0.5"
            style={{ fontSize: "13px" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
