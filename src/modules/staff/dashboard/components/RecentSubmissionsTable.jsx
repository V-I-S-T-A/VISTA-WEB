import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Loader2,
  Check,
  MoreVertical,
  AlertCircle,
  SquarePen,
} from "lucide-react";
import {
  useSubmissions,
  useUpdateSubmissionStatus,
} from "../../../../hooks/useSubmissions";
import { submissionService } from "../../../../services/submissionService";

const PAGE_SIZE = 50;
const CONTENT_PADDING = "28px";

const COLORS = {
  navy: "#003370",
  navyHover: "#16385f",
  amber: "#FDC849",
  amberHover: "#e0951a",
  headerBg: "#1A59A5",
  border: "#e2e6ee",
};

// Maps the backend's raw status values to display labels/colors.
// Rendered as a dot + colored label (no background pill) per design.
const STATUS_CONFIG = {
  pending: { label: "New", color: "#1d4ed8" },
  under_review: { label: "Reviewing", color: "#b45309" },
  approved: { label: "Verified", color: "#15803d" },
  rejected: { label: "Flagged", color: "#b91c1c" },
  resubmission_required: { label: "Resubmission Required", color: "#6d28d9" },
};

// Filter dropdown options — must match submissionService's STATUS_API_MAP keys.
const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Resubmission Required",
];

// Only transitions allowed by SubmissionStatusUpdateSerializer.validate_status()
// on the backend. Terminal statuses (approved/rejected) get no entry.
const PRIMARY_ACTION = {
  pending: { label: "VIEW & REVIEW", target: "under_review" },
  under_review: { label: "VIEW & REVIEW", target: "approved" },
  resubmission_required: { label: "VIEW & REVIEW", target: "under_review" },
};

const SECONDARY_ACTIONS = {
  pending: [{ label: "Reject", target: "rejected" }],
  under_review: [
    { label: "Reject", target: "rejected" },
    { label: "Request Resubmission", target: "resubmission_required" },
  ],
  resubmission_required: [{ label: "Reset to Pending", target: "pending" }],
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

function extractFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [updatingSubmissionId, setUpdatingSubmissionId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const { data, isLoading, isFetching } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
    status: statusFilter,
    search: searchTerm,
    dateFrom,
    dateTo,
  });
  const updateSubmissionStatus = useUpdateSubmissionStatus();
  const submissions = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const totalCount = data?.count ?? 0;

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

  function clearFilters() {
    setStatusFilter("All Status");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  // `status` is always a raw backend value (from PRIMARY_ACTION/SECONDARY_ACTIONS
  // targets), which the API expects as-is.
  async function handleStatusUpdate(submissionId, status) {
    setUpdatingSubmissionId(submissionId);
    setActionError("");
    setOpenMenuId(null);
    try {
      await updateSubmissionStatus.mutateAsync({ submissionId, status });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.status?.[0] ||
        error?.response?.data?.detail ||
        "Failed to update submission status. Please try again.";
      setActionError(backendMessage);
    } finally {
      setUpdatingSubmissionId(null);
    }
  }

  // All filtering (status, search, date range) is applied server-side by
  // SubmissionViewSet.export_list — this just streams back whatever PDF the
  // backend generates for the currently active filters and saves it.
  async function handleExport() {
    setIsExporting(true);
    setExportError("");
    try {
      const response = await submissionService.exportList({
        search: searchTerm,
        status: statusFilter,
        dateFrom,
        dateTo,
      });
      const filename = extractFilename(
        response.headers?.["content-disposition"],
        `submissions_export_${Date.now()}.pdf`,
      );
      downloadBlob(response.data, filename);
    } catch (error) {
      setExportError("Failed to export submissions. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  const activeFilterCount =
    (statusFilter !== "All Status" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <section
      className="overflow-hidden"
      style={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 3px rgba(15, 42, 74, 0.06)",
      }}
    >
      {/* ---- Header: title / search / filter / export ---- */}
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
          style={{ fontSize: "19px", color: "white"}}
        >
          Recent Submissions
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
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
              aria-hidden="true"
            />
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search submissions..."
              className="font-inter outline-none"
              style={{
                width: "230px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                padding: "9px 12px 9px 34px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
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
              {activeFilterCount > 0 && (
                <span
                  className="inline-flex items-center justify-center font-bold"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    color: COLORS.navy,
                    fontSize: "10px",
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

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 font-inter font-bold text-white transition-colors"
            style={{
              borderRadius: "8px",
              backgroundColor: COLORS.amber,
              color: "#6e5c00",
              padding: "9px 16px",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              opacity: isExporting ? 0.6 : 1,
              cursor: isExporting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isExporting)
                e.currentTarget.style.backgroundColor = COLORS.amberHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.amber;
            }}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Export
          </button>
        </div>
      </div>

      {(actionError || exportError) && (
        <div
          className="flex items-center gap-2 bg-red-50 border-b border-red-200 text-red-700 font-inter"
          style={{ padding: "10px 24px", fontSize: "13px" }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {actionError || exportError}
        </div>
      )}

      {isFetching && !isLoading && (
        <div
          className="bg-gray-50 text-gray-500 font-inter"
          style={{ padding: "6px 24px", fontSize: "12px" }}
        >
          Refreshing…
        </div>
      )}

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
              submissions.map((submission) => {
                const primary = PRIMARY_ACTION[submission.status];
                const secondary = SECONDARY_ACTIONS[submission.status] ?? [];
                const isUpdatingRow =
                  updatingSubmissionId === submission.submission_id;
                const isMenuOpen = openMenuId === submission.submission_id;

                return (
                  <tr
                    key={submission.submission_id}
                    className="h-16 transition-colors last:border-b-0"
                    style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f7f9ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
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
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <StatusLabel status={submission.status} />
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      {!primary ? (
                        <span className="font-inter text-xs text-gray-400">
                          No action needed
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 relative">
                          <button
                            type="button"
                            disabled={isUpdatingRow}
                            onClick={() =>
                              handleStatusUpdate(
                                submission.submission_id,
                                primary.target,
                              )
                            }
                            className="inline-flex items-center gap-1.5 font-inter font-bold text-white active:scale-95"
                            style={{
                              fontSize: "12px",
                              padding: "8px 18px",
                              borderRadius: "9999px",
                              backgroundColor: COLORS.amber,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                              opacity: isUpdatingRow ? 0.6 : 1,
                              cursor: isUpdatingRow ? "not-allowed" : "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isUpdatingRow)
                                e.currentTarget.style.backgroundColor =
                                  COLORS.amberHover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                COLORS.amber;
                            }}
                          >
                            {isUpdatingRow ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <SquarePen className="h-3.5 w-3.5" />
                                {primary.label}
                              </>
                            )}
                          </button>

                          {secondary.length > 0 && (
                            <div className="relative">
                              <button
                                type="button"
                                disabled={isUpdatingRow}
                                onClick={() =>
                                  setOpenMenuId(
                                    isMenuOpen
                                      ? null
                                      : submission.submission_id,
                                  )
                                }
                                className="inline-flex items-center justify-center border text-gray-500 hover:bg-gray-100"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "6px",
                                  borderColor: "#d1d5db",
                                  opacity: isUpdatingRow ? 0.6 : 1,
                                }}
                                aria-label="More actions"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                              {isMenuOpen && (
                                <div
                                  className="absolute right-0 top-full z-10 overflow-hidden"
                                  style={{
                                    marginTop: "4px",
                                    minWidth: "170px",
                                    borderRadius: "8px",
                                    border: `1px solid ${COLORS.border}`,
                                    backgroundColor: "#ffffff",
                                    boxShadow:
                                      "0 10px 25px rgba(15, 42, 74, 0.12)",
                                  }}
                                >
                                  {secondary.map((action) => (
                                    <button
                                      key={action.target}
                                      type="button"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          submission.submission_id,
                                          action.target,
                                        )
                                      }
                                      className="block w-full text-left font-inter font-semibold text-gray-700 hover:bg-gray-50"
                                      style={{
                                        padding: "8px 12px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          backgroundColor: "#ffffff",
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: "12px",
          paddingBottom: "12px",
        }}
      >
        <p
          className="font-inter font-medium text-gray-500"
          style={{ fontSize: "14px" }}
        >
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {totalCount === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}–
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
            className="font-inter font-semibold transition"
            style={{
              width: "34px",
              height: "34px",
              fontSize: "14px",
              borderRadius: "9999px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: safeCurrentPage === 1 ? "#9ca3af" : "#374151",
              cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
            className="font-inter font-semibold transition"
            style={{
              width: "34px",
              height: "34px",
              fontSize: "14px",
              borderRadius: "9999px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: safeCurrentPage >= totalPages ? "#9ca3af" : "#374151",
              cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}
