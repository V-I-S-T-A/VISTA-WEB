import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * TablePagination
 *
 * Circular Previous / numbered-page-buttons / Next pagination row.
 * Used in all paginated tables (admin, staff, student).
 *
 * Props:
 *  - currentPage {number}    — the currently active page (1-indexed)
 *  - totalPages  {number}    — total number of pages
 *  - pageNumbers {number[]}  — array of page numbers to render (windowed)
 *  - onGoToPage  {function}  — (page: number) => void
 */
export default function TablePagination({
  currentPage,
  totalPages,
  pageNumbers,
  onGoToPage,
}) {
  return (
    <div className="table-pagination-row flex items-center gap-1.5">
      {/* Previous */}
      <button
        type="button"
        onClick={() => onGoToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-7 w-7 items-center justify-center rounded-full border font-inter transition disabled:opacity-50"
        style={{
          borderColor: "#d1d5db",
          backgroundColor: "#ffffff",
          color: currentPage === 1 ? "#c1c5cc" : "#374151",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
        aria-label="Previous page"
      >
        <ChevronLeft style={{ width: "14px", height: "14px" }} />
      </button>

      {/* Page numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onGoToPage(page)}
          className="flex h-7 w-7 items-center justify-center rounded-full border font-inter font-semibold transition"
          style={{
            fontSize: "12.5px",
            borderColor: page === currentPage ? "#12345b" : "#d1d5db",
            backgroundColor: page === currentPage ? "#12345b" : "#ffffff",
            color: page === currentPage ? "#ffffff" : "#374151",
          }}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        type="button"
        onClick={() => onGoToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-7 w-7 items-center justify-center rounded-full border font-inter transition disabled:opacity-50"
        style={{
          borderColor: "#d1d5db",
          backgroundColor: "#ffffff",
          color: currentPage >= totalPages ? "#c1c5cc" : "#374151",
          cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
        }}
        aria-label="Next page"
      >
        <ChevronRight style={{ width: "14px", height: "14px" }} />
      </button>
    </div>
  );
}
