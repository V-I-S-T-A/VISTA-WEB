import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useSubmissions } from "../../../../hooks/useSubmissions";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "28px";

// Maps backend status values to the labels/colors used across the app's
// submission tables (see staff RecentSubmissionsTable / SystemSubmissionsPanel).
const STATUS_CONFIG = {
  pending: { label: "New", color: "#1d4ed8" },
  under_review: { label: "Reviewing", color: "#b45309" },
  approved: { label: "Verified", color: "#15803d" },
  rejected: { label: "Flagged", color: "#b91c1c" },
  resubmission_required: { label: "Resubmission Required", color: "#6d28d9" },
};

function StatusLabel({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    color: "#6b7280",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-inter font-bold whitespace-nowrap"
      style={{ fontSize: "13px", color: config.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}

export default function RecentSubmissionsTable({ onView }) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const submissions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const showPagination = totalCount > PAGE_SIZE;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = 2;
    let start = Math.max(1, safeCurrentPage - half);
    let end = Math.min(totalPages, safeCurrentPage + half);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, 5);
      else start = Math.max(1, end - 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, safeCurrentPage]);

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className="bg-[#1f5cae] h-16 flex items-center"
        style={{ paddingLeft: CONTENT_PADDING }}
      >
        <h3 className="font-inter text-[18px] font-bold text-white">
          Recent Submissions
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
              {["ID", "APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                    style={
                      heading === "ID"
                        ? { paddingLeft: CONTENT_PADDING }
                        : undefined
                    }
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  Loading submissions...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((submission) => (
                <tr
                  key={submission.submission_id}
                  className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                >
                  <td
                    className="px-5 py-2.5 font-inter font-bold text-gray-900 whitespace-nowrap"
                    style={{ paddingLeft: CONTENT_PADDING, fontSize: "13px" }}
                  >
                    #{submission.submission_id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-2.5">
                    <p
                      className="font-inter font-bold text-gray-900 leading-tight"
                      style={{ fontSize: "14px" }}
                    >
                      {submission.submitted_by_name || "Unknown"}
                    </p>
                    {submission.submitted_by_email && (
                      <p
                        className="font-inter text-gray-400 leading-tight"
                        style={{ fontSize: "12px", marginTop: "2px" }}
                      >
                        {submission.submitted_by_email}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className="inline-flex items-center justify-center font-inter font-semibold"
                      style={{
                        fontSize: "12px",
                        padding: "5px 14px",
                        borderRadius: "9999px",
                        backgroundColor: "#eef1f8",
                        color: "#4b5b78",
                      }}
                    >
                      {submission.category_name || "N/A"}
                    </span>
                  </td>
                  <td
                    className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "13px" }}
                  >
                    {new Date(submission.submitted_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <StatusLabel status={submission.status} />
                  </td>
                  <td className="px-5 py-2.5">
                    <button
                      type="button"
                      onClick={() => onView?.(submission)}
                      className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
                      style={{
                        fontSize: "12px",
                        padding: "7px 16px",
                        borderRadius: "9999px",
                        backgroundColor: "#ffc700",
                      }}
                    >
                      <Eye style={{ width: "13px", height: "13px" }} />
                      VIEW
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          <span className="font-semibold text-gray-700">
            {submissions.length}
          </span>{" "}
          of <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
          submissions
        </p>

        {showPagination && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="font-inter font-semibold border rounded-md transition"
              style={{
                height: "30px",
                padding: "0 14px",
                fontSize: "13px",
                borderColor: "#d1d5db",
                backgroundColor: "#f9fafb",
                color: safeCurrentPage === 1 ? "#9ca3af" : "#374151",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className="font-inter font-semibold border rounded-md transition"
                style={{
                  width: "34px",
                  height: "30px",
                  fontSize: "13px",
                  borderColor: page === safeCurrentPage ? "#002b5c" : "#d1d5db",
                  backgroundColor:
                    page === safeCurrentPage ? "#002b5c" : "#ffffff",
                  color: page === safeCurrentPage ? "#ffffff" : "#374151",
                }}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="font-inter font-semibold border rounded-md transition"
              style={{
                height: "30px",
                padding: "0 14px",
                fontSize: "13px",
                borderColor: "#d1d5db",
                backgroundColor: "#ffffff",
                color: safeCurrentPage >= totalPages ? "#9ca3af" : "#374151",
                cursor:
                  safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
