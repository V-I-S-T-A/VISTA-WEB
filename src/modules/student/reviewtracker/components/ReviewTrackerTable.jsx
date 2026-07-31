import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download, Eye, Loader2 } from "lucide-react";
import { useSubmissions } from "../../../../hooks/useSubmissions";

const PAGE_SIZE = 10;
const CONTENT_PADDING = "28px";

const COLORS = {
  navy: "#003370",
  navyHover: "#16385f",
  amber: "#FDC849",
  amberHover: "#e0951a",
  headerBg: "#1A59A5",
  border: "#e2e6ee",
};

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

export default function ReviewTrackerTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: searchTerm,
  });

  const submissions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

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

  function handleView(submission) {
    navigate(`/student/review-tracker/${submission.submission_id}`);
  }

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  // Frontend CSV Exporter
  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert("No submissions to export.");
      return;
    }

    const headers = [
      "ID",
      "TITLE",
      "ORGANIZATION/APPLICANT",
      "CATEGORY",
      "SUBMITTED DATE",
      "STATUS",
    ];
    const csvContent = [
      headers.join(","),
      ...submissions.map((sub) => {
        const id = sub.submission_id;
        const title = (sub.title || "Untitled Document").replace(/"/g, '""');
        const applicant = (
          sub.org_name ||
          sub.submitted_by_name ||
          sub.submitted_by_email ||
          "Unknown"
        ).replace(/"/g, '""');
        const category = sub.category_name || "N/A";
        const date = sub.submitted_at
          ? new Date(sub.submitted_at).toLocaleDateString("en-US")
          : "N/A";
        const status = sub.status || "Unknown";

        return `"${id}","${title}","${applicant}","${category}","${date}","${status}"`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my_submissions_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <section
      className="overflow-hidden"
      style={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 3px rgba(15, 42, 74, 0.06)",
      }}
    >
      {/* ---- Header ---- */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap"
        style={{
          backgroundColor: COLORS.headerBg,
          padding: "20px 24px",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <h3
          className="font-inter font-bold"
          style={{ fontSize: "19px", color: "white" }}
        >
          Recent Submissions
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              className="pointer-events-none absolute"
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "16px",
                width: "16px",
                color: "#9ca3af",
              }}
            />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search submissions..."
              className="font-inter outline-none text-black"
              style={{
                width: "230px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                padding: "9px 12px 9px 34px",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 font-inter font-semibold text-white transition-colors"
            style={{
              borderRadius: "8px",
              backgroundColor: COLORS.navy,
              padding: "9px 16px",
              fontSize: "14px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.navyHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.navy)
            }
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filter
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 font-inter font-bold transition-colors"
            style={{
              borderRadius: "8px",
              backgroundColor: COLORS.amber,
              color: "#6e5c00",
              padding: "9px 16px",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.amberHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.amber)
            }
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr
              className="h-14"
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                backgroundColor: "#f8f9fc",
              }}
            >
              {["ID", "APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="text-left font-inter font-bold uppercase tracking-wider text-gray-500"
                    style={{
                      padding: "12px 20px",
                      fontSize: "13px",
                      paddingLeft:
                        heading === "ID" ? CONTENT_PADDING : undefined,
                    }}
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
                  className="text-center font-inter text-sm text-gray-500"
                  style={{ padding: "40px 20px" }}
                >
                  <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-gray-400" />
                  Loading submissions...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center font-inter text-sm text-gray-500"
                  style={{ padding: "40px 20px" }}
                >
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((submission) => (
                <tr
                  key={submission.submission_id}
                  className="h-16 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                  style={{ borderBottom: `1px solid ${COLORS.border}` }}
                >
                  <td
                    className="font-inter font-semibold text-gray-700 whitespace-nowrap"
                    style={{
                      padding: "12px 20px",
                      paddingLeft: CONTENT_PADDING,
                      fontSize: "13px",
                    }}
                  >
                    #{submission.submission_id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <p
                      className="font-inter font-bold text-gray-900 leading-tight"
                      style={{ fontSize: "14px" }}
                    >
                      {submission.title || "Untitled Document"}
                    </p>
                    <p
                      className="font-inter text-gray-400 leading-tight"
                      style={{ fontSize: "12px", marginTop: "2px" }}
                    >
                      {submission.org_name || "Unknown Organization"}
                    </p>
                  </td>
                  <td style={{ padding: "12px 20px" }}>
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
                    className="font-inter font-medium text-gray-500 whitespace-nowrap"
                    style={{ padding: "12px 20px", fontSize: "13px" }}
                  >
                    {new Date(submission.submitted_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <StatusLabel status={submission.status} />
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <button
                      type="button"
                      onClick={() => handleView(submission)}
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

      {/* ---- Pagination ---- */}
      {totalCount > 0 && (
        <div
          className="flex items-center justify-between flex-wrap gap-3"
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            backgroundColor: "#ffffff",
            padding: `12px ${CONTENT_PADDING}`,
          }}
        >
          <p
            className="font-inter font-medium text-gray-500"
            style={{ fontSize: "14px" }}
          >
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(safeCurrentPage * PAGE_SIZE, totalCount)}
            </span>{" "}
            of <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
            submissions
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="font-inter font-semibold transition disabled:opacity-50"
              style={{
                width: "34px",
                height: "34px",
                fontSize: "14px",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              &lt;
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className="font-inter font-semibold transition"
                style={{
                  width: "34px",
                  height: "34px",
                  fontSize: "13px",
                  borderRadius: "9999px",
                  border: `1px solid ${page === safeCurrentPage ? COLORS.navy : "#d1d5db"}`,
                  backgroundColor:
                    page === safeCurrentPage ? COLORS.navy : "#ffffff",
                  color: page === safeCurrentPage ? "#ffffff" : "#374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="font-inter font-semibold transition disabled:opacity-50"
              style={{
                width: "34px",
                height: "34px",
                fontSize: "14px",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
