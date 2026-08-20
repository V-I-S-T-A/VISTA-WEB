import { AlertCircle } from "lucide-react";
import TablePagination from "./TablePagination";

const CONTENT_PADDING = "30px";

/**
 * TableContainer
 *
 * The standard white card wrapper used by every data table in the app.
 * Consists of:
 *  1. A blue top header bar  — table title + right-side controls slot
 *  2. An optional error/alert banner slot
 *  3. The scrollable table body slot (children)
 *  4. A footer bar            — record count text + optional pagination
 *
 * Props:
 *  - title          {string}    — table title shown in the blue header
 *  - headerRight    {ReactNode} — search / filter / export controls
 *  - children       {ReactNode} — the <table> element
 *  - totalCount     {number}    — total records (shown in footer)
 *  - shownCount     {number}    — records on current page (shown in footer)
 *  - recordLabel    {string}    — plural noun for records, e.g. "users" (default "entries")
 *  - showPagination {boolean}   — whether to render pagination controls
 *  - currentPage    {number}    — active page (passed to TablePagination)
 *  - totalPages     {number}    — total pages (passed to TablePagination)
 *  - pageNumbers    {number[]}  — windowed page numbers array
 *  - onGoToPage     {function}  — (page) => void
 *  - errorMessage   {string}    — optional inline error banner text
 *  - headerPadding  {string}    — left padding of title in header (default "30px")
 */
export default function TableContainer({
  title,
  headerRight,
  children,
  totalCount = 0,
  shownCount = 0,
  recordLabel = "entries",
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  pageNumbers = [],
  onGoToPage,
  errorMessage,
  headerPadding = CONTENT_PADDING,
}) {
  return (
    <section
      style={{
        borderRadius: "12px",
        border: "1px solid #e2e6ee",
        boxShadow: "0 1px 3px rgba(15, 42, 74, 0.06)",
        marginBottom: "16px",
      }}
      className="bg-white"
    >
      {/* ── Blue header bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-wrap"
        style={{
          backgroundColor: "#1f5cae",
          minHeight: "64px",
          borderBottom: "1px solid #e2e6ee",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <h3
          className="font-inter font-bold text-white"
          style={{ fontSize: "18px", paddingLeft: headerPadding }}
        >
          {title}
        </h3>

        {headerRight && (
          <div
            className="flex items-center gap-3"
            style={{ paddingRight: "20px" }}
          >
            {headerRight}
          </div>
        )}
      </div>

      {/* ── Optional error/alert banner ── */}
      {errorMessage && (
        <div
          className="flex items-center gap-2 bg-red-50 border-b border-red-200 text-red-700 font-inter"
          style={{ padding: "10px 24px", fontSize: "13px" }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {errorMessage}
        </div>
      )}

      {/* ── Table body ── */}
      <div className="overflow-x-auto">{children}</div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between border-t border-gray-200 bg-white"
        style={{
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: "12px",
          paddingBottom: "12px",
        }}
      >
        <p className="font-inter text-[14px] font-medium text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">{shownCount}</span> of{" "}
          <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
          {recordLabel}
        </p>

        {showPagination && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            onGoToPage={onGoToPage}
          />
        )}
      </div>
    </section>
  );
}
