/**
 * TablePagination
 *
 * Previous / numbered-page-buttons / Next pagination row.
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
    <div className="flex items-center gap-2">
      {/* Previous */}
      <button
        type="button"
        onClick={() => onGoToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-inter font-semibold border rounded-md transition"
        style={{
          height: "30px",
          padding: "0 14px",
          fontSize: "13px",
          borderColor: "#d1d5db",
          backgroundColor: "#f9fafb",
          color: currentPage === 1 ? "#9ca3af" : "#374151",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        Previous
      </button>

      {/* Page numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onGoToPage(page)}
          className="font-inter font-semibold border rounded-md transition"
          style={{
            width: "34px",
            height: "30px",
            fontSize: "13px",
            borderColor: page === currentPage ? "#002b5c" : "#d1d5db",
            backgroundColor: page === currentPage ? "#002b5c" : "#ffffff",
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
        className="font-inter font-semibold border rounded-md transition"
        style={{
          height: "30px",
          padding: "0 14px",
          fontSize: "13px",
          borderColor: "#d1d5db",
          backgroundColor: "#ffffff",
          color: currentPage >= totalPages ? "#9ca3af" : "#374151",
          cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
}
