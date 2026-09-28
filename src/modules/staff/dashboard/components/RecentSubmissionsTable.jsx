import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Loader2, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import { submissionService } from "../../../../services/submissionService";
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
  pending: "Process",
  under_review: "Process",
  approved: "Approved",
  rejected: "Returned",
  resubmission_required: "Returned",
  process: "Process",
  Process: "Process",
  Approved: "Approved",
  Returned: "Returned",
};

const STATUS_CONFIG = {
  Process: { dot: "#2563eb", text: "#1d4ed8", bg: "#eff6ff" },
  Approved: { dot: "#22c55e", text: "#15803d", bg: "#f0fdf4" },
  Returned: { dot: "#ef4444", text: "#b91c1c", bg: "#fef2f2" },
};

const STATUS_OPTIONS = [
  "All Status",
  "Process",
  "Approved",
  "Returned",
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
  const headers = ["ID", "Document Title", "Applicant", "Email", "Category", "Document Type", "Academic Year", "Date", "Status"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((s) =>
    [
      esc(`#${s.submission_id.slice(0, 8)}`),
      esc(s.title || "Untitled Document"),
      esc(s.org_name || s.submitted_by_name || "Unknown"),
      esc(s.submitted_by_email || "N/A"),
      esc(s.category_name || "N/A"),
      esc(s.doc_type_name || "N/A"),
      esc(s.academic_year || "N/A"),
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

function downloadXlsx(rows) {
  const headers = [
    "ID",
    "Document Title",
    "Applicant",
    "Email",
    "Organization",
    "Category",
    "Document Type",
    "Academic Year",
    "Date",
    "Status",
  ];
  const data = rows.map((s) => [
    `#${s.submission_id.slice(0, 8)}`,
    s.title || "Untitled Document",
    s.submitted_by_name || "Unknown",
    s.submitted_by_email || "N/A",
    s.org_name || "N/A",
    s.category_name || "N/A",
    s.doc_type_name || "N/A",
    s.academic_year || "N/A",
    formatDate(s.submitted_at),
    UI_STATUS_MAP[s.status] || s.status,
  ]);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws["!cols"] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 24 },
    { wch: 26 },
    { wch: 24 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Recent Submissions");
  XLSX.writeFile(wb, `recent_submissions_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export default function RecentSubmissionsTable({
  activeStatusFilter,
  onStatusChange,
} = {}) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(activeStatusFilter || "All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const exportRef = useRef(null);

  // Sync external status filter if passed from KPI cards or analytics
  useEffect(() => {
    if (activeStatusFilter !== undefined && activeStatusFilter !== statusFilter) {
      setStatusFilter(activeStatusFilter);
      setCurrentPage(1);
    }
  }, [activeStatusFilter]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    if (isExportOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExportOpen]);

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
    if (onStatusChange) {
      onStatusChange("All Status");
    }
  }


  async function handleExportPdf() {
    try {
      setIsExportingPdf(true);
      const response = await submissionService.exportList({
        search: searchTerm,
        status: statusFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submissions_report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to export PDF report. Please try again.");
    } finally {
      setIsExportingPdf(false);
      setIsExportOpen(false);
    }
  }

  function handleExportXlsx() {
    if (!filteredSubmissions.length) {
      alert("No submissions to export.");
      return;
    }
    downloadXlsx(filteredSubmissions);
    setIsExportOpen(false);
  }

  function handleExportCsv() {
    if (!filteredSubmissions.length) {
      alert("No submissions to export.");
      return;
    }
    downloadCsv(filteredSubmissions);
    setIsExportOpen(false);
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
                      handleStatusFilterChange(e.target.value);
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

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95 cursor-pointer disabled:opacity-60"
              style={{
                borderRadius: "6px",
                backgroundColor: "#ffc700",
                padding: "7px 14px",
                fontSize: "12.5px",
              }}
            >
              {isExportingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isExportingPdf ? "Exporting..." : "Export"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  isExportOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isExportOpen && (
              <div
                className="absolute right-0 top-full z-30"
                style={{
                  marginTop: "8px",
                  width: "210px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6ee",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "6px",
                }}
              >
                <div className="px-2.5 py-1.5 font-inter text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Export As
                </div>

                {/* PDF Option */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex items-center gap-2.5 w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] transition-colors rounded-lg px-2.5 py-2 text-[12.5px] cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span>Export as PDF</span>
                    <span className="text-[10px] text-gray-400 font-normal">.pdf document</span>
                  </div>
                </button>

                {/* Excel Option */}
                <button
                  type="button"
                  onClick={handleExportXlsx}
                  className="flex items-center gap-2.5 w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] transition-colors rounded-lg px-2.5 py-2 text-[12.5px] cursor-pointer mt-0.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span>Export as Excel</span>
                    <span className="text-[10px] text-gray-400 font-normal">.xlsx spreadsheet</span>
                  </div>
                </button>

                {/* CSV Option */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-2.5 w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] transition-colors rounded-lg px-2.5 py-2 text-[12.5px] cursor-pointer mt-0.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                    <Download className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span>Export as CSV</span>
                    <span className="text-[10px] text-gray-400 font-normal">.csv plain text</span>
                  </div>
                </button>
              </div>
            )}
          </div>
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