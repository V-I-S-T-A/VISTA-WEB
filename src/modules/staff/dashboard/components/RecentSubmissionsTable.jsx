import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Loader2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import { ActionButton } from "../../../../components";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "24px";

const COLORS = {
  navy: "#12345b",
  navyHover: "#1d4ed8",
  amber: "#ffc700",
  amberHover: "#e6b800",
  headerBg: "#1f5cae",
  border: "#e2e6ee",
};

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

const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Resubmission Required",
];

function FilterPopover({
  status,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  onClose,
}) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-20"
      style={{
        marginTop: "8px",
        width: "288px",
        borderRadius: "10px",
        border: `1px solid ${COLORS.border}`,
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
        padding: "16px",
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full font-inter outline-none"
          style={{
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            padding: "8px 10px",
            fontSize: "14px",
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: "14px" }}>
        <div>
          <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full font-inter outline-none"
            style={{
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              padding: "6px 8px",
              fontSize: "14px",
            }}
          />
        </div>
        <div>
          <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full font-inter outline-none"
            style={{
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              padding: "6px 8px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClear}
          className="font-inter font-semibold text-gray-500 hover:text-gray-700"
          style={{ fontSize: "12px" }}
        >
          Clear filters
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-inter font-bold text-white"
          style={{
            borderRadius: "8px",
            backgroundColor: COLORS.navy,
            padding: "7px 14px",
            fontSize: "12px",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function RecentSubmissionsTable() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data, isLoading } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
    status: statusFilter,
    search: searchTerm,
    dateFrom,
    dateTo,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const submissions = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const totalCount = data?.count ?? 0;

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function clearFilters() {
    setStatusFilter("All Status");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  // Frontend CSV Exporter
  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert("No submissions to export.");
      return;
    }

    const headers = [
      "ID",
      "DOCUMENT / APPLICANT",
      "CATEGORY",
      "DATE",
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
          "Unknown"
        ).replace(/"/g, '""');
        const category = sub.category_name || "N/A";
        const date = sub.submitted_at
          ? new Date(sub.submitted_at).toLocaleDateString("en-US")
          : "N/A";
        const status = sub.status || "Unknown";

        return `"${id}","${title} (${applicant})","${category}","${date}","${status}"`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recent_submissions_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const activeFilterCount =
    (statusFilter !== "All Status" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

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

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              className="pointer-events-none absolute"
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "14px",
                width: "14px",
                color: "#9ca3af",
              }}
              aria-hidden="true"
            />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search submissions..."
              className="font-inter outline-none"
              style={{
                width: "220px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                padding: "8px 12px 8px 32px",
                fontSize: "13px",
              }}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 font-inter font-bold text-white transition hover:brightness-110 active:scale-95"
              style={{
                borderRadius: "6px",
                backgroundColor: "#12345b",
                padding: "7px 14px",
                fontSize: "12.5px",
              }}
            >
              <Filter style={{ width: "13px", height: "13px" }} aria-hidden="true" />
              Filter
              {activeFilterCount > 0 && (
                <span
                  className="inline-flex items-center justify-center font-bold"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    color: "#12345b",
                    fontSize: "10px",
                    marginLeft: "2px",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            {isFilterOpen && (
              <FilterPopover
                status={statusFilter}
                onStatusChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={(v) => {
                  setDateFrom(v);
                  setCurrentPage(1);
                }}
                onDateToChange={(v) => {
                  setDateTo(v);
                  setCurrentPage(1);
                }}
                onClear={clearFilters}
                onClose={() => setIsFilterOpen(false)}
              />
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
            style={{
              borderRadius: "6px",
              backgroundColor: "#ffc700",
              padding: "6px 14px",
              fontSize: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
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
              {[
                "ID",
                "DOCUMENT / APPLICANT",
                "CATEGORY",
                "DATE",
                "STATUS",
                "ACTIONS",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-2 text-left font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500"
                  style={
                    heading === "ID"
                      ? { paddingLeft: CONTENT_PADDING }
                      : undefined
                  }
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-gray-400" />
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
                  {/* ID */}
                  <td
                    className="px-5 py-2.5 font-inter font-bold text-gray-900 whitespace-nowrap"
                    style={{ paddingLeft: CONTENT_PADDING, fontSize: "13px" }}
                  >
                    #{submission.submission_id.slice(0, 8)}
                  </td>

                  {/* Document / Applicant */}
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

                  {/* Category */}
                  <td className="px-5 py-2.5">
                    <span
                      className="inline-flex items-center justify-center rounded font-inter font-semibold bg-gray-100 text-gray-600 whitespace-nowrap"
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      {submission.category_name || "N/A"}
                    </span>
                  </td>

                  {/* Date */}
                  <td
                    className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "13px" }}
                  >
                    {new Date(submission.submitted_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-2.5">
                    <StatusDot status={submission.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-2.5">
                    <ActionButton
                      onClick={() => {
                        const submissionData = {
                          id: submission.submission_id,
                          title: submission.title || "Untitled Document",
                          site: submission.org_name || "Unknown Organization",
                          contactEmail: submission.submitted_by_email
                            ? `${submission.submitted_by_name || ""} (${submission.submitted_by_email})`.trim()
                            : submission.submitted_by_name || "N/A",
                          documentType: submission.doc_type_name || "N/A",
                          submittedDate: new Date(
                            submission.submitted_at,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }),
                        };
                        navigate("/staff/review-panel", {
                          state: { submission: submissionData },
                        });
                      }}
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
            {Math.min(safeCurrentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
            submissions
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
                      borderColor:
                        page === safeCurrentPage ? "#12345b" : "#d1d5db",
                      backgroundColor:
                        page === safeCurrentPage ? "#12345b" : "#ffffff",
                      color: page === safeCurrentPage ? "#ffffff" : "#374151",
                    }}
                  >
                    {page}
                  </button>
                );
              }
              if (page === 2 && safeCurrentPage > 3)
                return (
                  <span key={page} className="px-1 text-gray-400">
                    ...
                  </span>
                );
              if (page === totalPages - 1 && safeCurrentPage < totalPages - 2)
                return (
                  <span key={page} className="px-1 text-gray-400">
                    ...
                  </span>
                );
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
                cursor:
                  safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
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
