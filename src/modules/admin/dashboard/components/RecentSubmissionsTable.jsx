import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  Search,
  Filter,
  SquarePen,
  Trash2,
  Loader,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import EditUserModal from "../modals/EditUserModal";
import { useUsers } from "../../../../hooks/useUsers";
import {
  useUpdateUser,
  useDeleteUser,
} from "../../../../hooks/useUserMutations";
import { userService } from "../../../../services/userService";

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

const STATUS_CONFIG = {
  pending: { label: "New", color: "#1d4ed8" },
  under_review: { label: "Reviewing", color: "#b45309" },
  approved: { label: "Verified", color: "#15803d" },
  rejected: { label: "Flagged", color: "#b91c1c" },
  resubmission_required: { label: "Resubmission Required", color: "#6d28d9" },
};

const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Resubmission Required",
];

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
});

// Pulls the filename the backend suggested via Content-Disposition, falling
// back to a sensible default if the header isn't present.
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

// FilterPopover (matching staff design)
function FilterPopover({ role, onRoleChange, onClear, onClose }) {
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

// Memoized UserRow component to prevent re-renders of unchanged rows
const UserRow = memo(function UserRow({
  user,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) {
  const handleEdit = useCallback(() => onEdit(user), [user, onEdit]);
  const handleDelete = useCallback(
    () => onDelete(user.user_id),
    [user.user_id, onDelete],
  );

  return (
    <tr className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]">
      <td className="px-5 py-2.5" style={{ paddingLeft: CONTENT_PADDING }}>
        <div className="flex items-center gap-3">
          <img
            src={user.image_url || defaultUser}
            alt=""
            className="flex-shrink-0 rounded-full object-cover"
            style={{ width: "45px", height: "45px" }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p
              className="font-inter font-bold text-gray-900 leading-tight"
              style={{ fontSize: "15px" }}
            >
              {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "Unknown User"}
            </p>
            <p
              className="max-w-[200px] truncate font-inter font-medium text-gray-400 mt-0.5"
              style={{ fontSize: "12px" }}
            >
              {user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-2.5">
        <span
          className={`inline-flex items-center justify-center rounded-full px-7 py-3 font-inter font-semibold capitalize ${
            user.role === "staff"
              ? "bg-[#dfe7fb] text-[#12345b]"
              : "bg-[#e8e3ff] text-[#4a3f99]"
          }`}
          style={{ fontSize: "13px", minWidth: "80px" }}
        >
          {user.role}
        </span>
      </td>
      <td className="px-5 py-2.5">
        <span
          className="font-inter font-medium text-gray-700 whitespace-nowrap uppercase"
          style={{ fontSize: "13px" }}
        >
          {user.department || "N/A"}
        </span>
      </td>
      <td
        className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
        style={{ fontSize: "13px" }}
      >
        {user.last_login
          ? new Date(user.last_login).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Never"}
      </td>
      <td className="px-5 py-2.5">
        <StatusBadge isActive={user.is_active} />
      </td>
      <td className="px-5 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEdit}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center gap-1 rounded bg-[#ffe100] font-inter font-bold text-gray-900 transition hover:bg-[#e6c900] active:scale-95 border border-[#d4a000]/50 disabled:opacity-50"
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            <SquarePen
              style={{ width: "12px", height: "12px" }}
              aria-hidden="true"
            />
            EDIT
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center gap-1 rounded bg-[#ef4444] font-inter font-bold text-white transition hover:bg-[#dc2626] active:scale-95 border border-[#b91c1c]/50 disabled:opacity-50"
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            <Trash2
              style={{ width: "12px", height: "12px" }}
              aria-hidden="true"
            />
            DELETE
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function RecentSubmissionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(""); // Kept for api compatibility

  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // DEBOUNCE STATES
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
<<<<<<< HEAD
    status: statusFilter,
    search: searchTerm,
    dateFrom,
    dateTo,
=======
    search: searchQuery.trim(),
    role: roleFilter === "All Roles" ? "" : roleFilter,
    date: dateFilter, // Let the backend handle the date filtering
    isActive: true, // Only fetch active users to follow the backend's soft-delete
>>>>>>> c2c2d556050bc89c4c69380fab9cafedb57ee81d
  });
  const updateSubmissionStatus = useUpdateSubmissionStatus();
  const submissions = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const totalCount = data?.count ?? 0;

  // DEBOUNCE EFFECT: Waits 400ms after user stops typing
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle search button click (immediate search)
  const handleSearchClick = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery(searchInput);
    setCurrentPage(1);
    if (searchInput.trim() !== "" && roleFilter !== "All Roles") {
      setRoleFilter("All Roles");
    }
  }, [searchInput, roleFilter]);

  // Handle Enter key
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearchClick();
      }
    },
    [handleSearchClick],
  );

  // Handle role filter change
  const handleRoleFilterChange = useCallback((value) => {
    setRoleFilter(value);
    setCurrentPage(1);
    // Clear search when changing role filter
    setSearchInput("");
    setSearchQuery("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Navigation functions
  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages],
  );

  // Save edit handler
  const handleSaveEdit = useCallback(
    async (data) => {
      if (!editUser?.user_id) return;

      try {
        await updateUserMutation.mutateAsync({
          userId: editUser.user_id,
          userData: {
            full_name: data.full_name || data.fullName,
            role: data.role,
            org_id: data.org_id ?? null,
            is_active:
              data.is_active !== undefined ? data.is_active : data.isActive,
          },
        });
        setEditUser(null);
      } catch (err) {
        console.error("Error updating user:", err);
      }
    },
    [editUser, updateUserMutation],
  );

  // Delete handler
  const handleDeleteUser = useCallback(
    async (userId) => {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    },
    [deleteUserMutation],
  );

  // Export handler — streams the backend-generated PDF (respecting the
  // same search/role filters currently applied to the table) and saves it.
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError("");
    try {
      const response = await userService.exportUsers({
        search: searchQuery.trim(),
        role: roleFilter,
        isActive: true,
      });
      const filename = extractFilename(
        response.headers?.["content-disposition"],
        `users_export_${Date.now()}.pdf`,
      );
      downloadBlob(response.data, filename);
    } catch (err) {
      console.error("Error exporting users:", err);
      setExportError("Failed to export users. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [searchQuery, roleFilter]);

  // Pagination numbers
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
    <section
      className="overflow-hidden"
      style={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 3px rgba(15, 42, 74, 0.06)",
      }}
    >
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

        <div
          className="flex items-center gap-3"
          style={{ paddingRight: "20px" }}
        >
          {/* Search */}
          <div className="relative" style={{ width: "300px" }}>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
              style={{ width: "16px", height: "16px" }}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
<<<<<<< HEAD
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search submissions..."
              className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none"
=======
              onChange={(e) => {
                handleSearchInputChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, email"
              className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none disabled:opacity-50"
>>>>>>> c2c2d556050bc89c4c69380fab9cafedb57ee81d
              style={{
                height: "36px",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "0 12px 0 40px",
                fontSize: "13px",
              }}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 font-inter font-semibold text-white transition-colors"
              style={{
                fontSize: "12.5px",
                padding: "7px 14px",
                backgroundColor: "#12345b",
              }}
            >
              <Filter
                style={{ width: "13px", height: "13px" }}
                aria-hidden="true"
              />
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
                    marginLeft: "4px",
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

<<<<<<< HEAD
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 font-inter font-bold text-white transition-colors"
            style={{
              borderRadius: "8px",
              backgroundColor: COLORS.amber,
              color: "#6e5c00",
              padding: "9px 16px",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.amberHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.amber;
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
=======
          {/* Export */}
          <button
            onClick={handleExport}
            type="button"
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] font-inter font-semibold text-gray-900 transition-colors whitespace-nowrap disabled:opacity-60"
            style={{
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: isExporting ? "not-allowed" : "pointer",
            }}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {exportError && (
        <div
          className="flex items-center gap-2 bg-red-50 border-b border-red-200 text-red-700 font-inter"
          style={{ padding: "10px 24px", fontSize: "13px" }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {exportError}
        </div>
      )}

      {actionError && (
        <div
          className="flex items-center gap-2 bg-red-50 border-b border-red-200 text-red-700 font-inter"
          style={{ padding: "10px 24px", fontSize: "13px" }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {actionError}
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
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
              {[
                "USER",
                "ROLE",
                "ORGANIZATION",
                "LAST LOGIN",
                "STATUS",
                "ACTION",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                  style={
                    heading === "USER"
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
                        {submission.org_name || "Unknown"}
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
