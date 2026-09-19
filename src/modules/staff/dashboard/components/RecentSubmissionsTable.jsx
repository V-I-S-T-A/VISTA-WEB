import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import {
  ActionButton,
  FilterButton,
  FilterPopover,
  FilterPopoverRow,
  FilterSelect,
  FilterDateInput,
} from "../../../../components";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "24px";

const UI_STATUS_MAP = {
  pending: "New",
  under_review: "Reviewing",
  approved: "Verified",
  rejected: "Flagged",
  resubmission_required: "Resubmission Required",
};

const STATUS_CONFIG = {
  Reviewing: { dot: "#f59e0b", text: "#b45309" },
  New: { dot: "#3b82f6", text: "#1d4ed8" },
  Verified: { dot: "#22c55e", text: "#15803d" },
  Flagged: { dot: "#ef4444", text: "#b91c1c" },
  "Resubmission Required": { dot: "#7c3aed", text: "#6d28d9" },
};

const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Resubmission Required",
];

const CATEGORY_OPTIONS = ["All Categories", "Off-Campus", "In-Campus"];

function StatusDot({ status }) {
  const uiStatus = UI_STATUS_MAP[status] || "New";
  const config = STATUS_CONFIG[uiStatus] ?? { dot: "#9ca3af", text: "#6b7280" };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-inter font-semibold"
      style={{ color: config.text, fontSize: "13px" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {uiStatus}
    </span>
  );
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
}

function downloadCsv(rows) {
  const headers = ["ID", "Document Title", "Applicant", "Email", "Category", "Date", "Status"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((s) =>
    [
      esc(`#${s.submission_id.slice(0, 8)}`),
      esc(s.title || "Untitled Document"),
      esc(s.org_name || s.submitted_by_name || "Unknown"),
      esc(s.submitted_by_email || "N/A"),
      esc(s.category_name || "N/A"),
      esc(formatDate(s.submitted_at)),
      esc(UI_STATUS_MAP[s.status] || s.status),
    ].join(","),
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `recent_submissions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function RecentSubmissionsTable() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: searchTerm,
    status: statusFilter, // submissionService maps the UI label -> API value
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const submissions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Category isn't a name-based server filter, so narrow it client-side
  const filteredSubmissions = useMemo(() => {
    if (categoryFilter === "All Categories") return submissions;
    return submissions.filter((s) => s.category_name === categoryFilter);
  }, [submissions, categoryFilter]);

  const activeFilterCount =
    (statusFilter !== "All Status" ? 1 : 0) +
    (categoryFilter !== "All Categories" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function clearFilters() {
    setStatusFilter("All Status");
    setCategoryFilter("All Categories");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  function handleReview(submission) {
    navigate("/staff/review-panel", {
      state: {
        submission: {
          id: submission.submission_id,
          title: submission.title || "Untitled Document",
          site: submission.org_name || "Unknown Organization",
          contactEmail: submission.submitted_by_email
            ? `${submission.submitted_by_name || ""} (${submission.submitted_by_email})`.trim()
            : submission.submitted_by_name || "N/A",
          documentType: submission.doc_type_name || "N/A",
          submittedDate: formatDate(submission.submitted_at),
        },
      },
    });
  }

  return (
    <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap bg-[#1f5cae]"
        style={{
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: "14px",
          paddingBottom: "14px",
        }}
      >
        <h3 className="font-inter text-[16px] font-bold text-white">
          Recent Submissions
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search submissions..."
              className="font-inter font-medium text-gray-700 placeholder-gray-400 outline-none rounded-md bg-white"
              style={{ fontSize: "12.5px", padding: "8px 12px 8px 32px", width: "220px" }}
            />
          </div>

          <div className="relative">
            <FilterButton
              onClick={() => setIsFilterOpen((o) => !o)}
              activeCount={activeFilterCount}
            />
            {isFilterOpen && (
              <FilterPopover onClear={clearFilters} onClose={() => setIsFilterOpen(false)}>
                <FilterPopoverRow label="Status">
                  <FilterSelect
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </FilterSelect>
                </FilterPopoverRow>

                <FilterPopoverRow label="Category">
                  <FilterSelect
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </FilterSelect>
                </FilterPopoverRow>

                <FilterPopoverRow label="From Date">
                  <FilterDateInput
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FilterPopoverRow>

                <FilterPopoverRow label="To Date">
                  <FilterDateInput
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FilterPopoverRow>
              </FilterPopover>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              filteredSubmissions.length
                ? downloadCsv(filteredSubmissions)
                : alert("No submissions to export.")
            }
            className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
            style={{
              borderRadius: "6px",
              backgroundColor: "#ffc700",
              padding: "7px 14px",
              fontSize: "12.5px",
            }}
          >
            <Download style={{ width: "13px", height: "13px" }} aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-12 border-b border-gray-100 bg-[#f8f9fc]">
              {["ID", "DOCUMENT / APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-5 py-2 text-left font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500"
                    style={heading === "ID" ? { paddingLeft: CONTENT_PADDING } : undefined}
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
                <td colSpan={6} className="px-5 py-10 text-center font-inter text-sm text-gray-500">
                  <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-gray-400" />
                  Loading submissions...
                </td>
              </tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-inter text-sm text-gray-500">
                  No submissions found.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
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
                    <div className="flex items-center gap-3">
                      <img
                        src={submission.org_image_url || defaultUser}
                        alt=""
                        className="flex-shrink-0 rounded-full object-cover border border-gray-200"
                        style={{ width: "36px", height: "36px" }}
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                      <div className="min-w-0">
                        <p
                          className="font-inter font-bold text-gray-900 leading-tight"
                          style={{ fontSize: "13.5px" }}
                        >
                          {submission.title || "Untitled Document"}
                        </p>
                        <p
                          className="font-inter font-medium text-gray-400 leading-tight mt-0.5"
                          style={{ fontSize: "12px" }}
                        >
                          {submission.org_name ||
                            submission.submitted_by_name ||
                            "Unknown Applicant"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-2.5">
                    <span
                      className="inline-flex items-center justify-center rounded font-inter font-semibold bg-gray-100 text-gray-600 whitespace-nowrap"
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      {submission.category_name || "N/A"}
                    </span>
                  </td>

                  <td
                    className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "13px" }}
                  >
                    {formatDate(submission.submitted_at)}
                  </td>

                  <td className="px-5 py-2.5">
                    <StatusDot status={submission.status} />
                  </td>

                  <td className="px-5 py-2.5">
                    <ActionButton
                      onClick={() => handleReview(submission)}
                      label="VIEW & REVIEW"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {totalCount > 0 && (
        <div
          className="flex items-center justify-between border-t border-gray-100 bg-white"
          style={{
            paddingLeft: CONTENT_PADDING,
            paddingRight: CONTENT_PADDING,
            paddingTop: "14px",
            paddingBottom: "14px",
          }}
        >
          <p className="font-inter text-[13px] font-medium text-gray-500">
            Showing {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(safeCurrentPage * PAGE_SIZE, totalCount)} of {totalCount} submissions
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-full border font-inter transition"
              style={{
                borderColor: "#d1d5db",
                color: safeCurrentPage === 1 ? "#c1c5cc" : "#374151",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft style={{ width: "14px", height: "14px" }} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= safeCurrentPage - 1 && page <= safeCurrentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border font-inter font-semibold transition"
                    style={{
                      fontSize: "12.5px",
                      borderColor: page === safeCurrentPage ? "#12345b" : "#d1d5db",
                      backgroundColor: page === safeCurrentPage ? "#12345b" : "#ffffff",
                      color: page === safeCurrentPage ? "#ffffff" : "#374151",
                    }}
                  >
                    {page}
                  </button>
                );
              }
              if (page === 2 && safeCurrentPage > 3)
                return <span key={page} className="px-1 text-gray-400">...</span>;
              if (page === totalPages - 1 && safeCurrentPage < totalPages - 2)
                return <span key={page} className="px-1 text-gray-400">...</span>;
              return null;
            })}

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-full border font-inter transition"
              style={{
                borderColor: "#d1d5db",
                color: safeCurrentPage >= totalPages ? "#c1c5cc" : "#374151",
                cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}