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
const CONTENT_PADDING = "30px";
const SEARCH_DEBOUNCE_MS = 600;

const ROLE_OPTIONS = ["All Roles", "staff", "student"];
const STATUS_OPTIONS = ["All Status"];

const STATUS_CONFIG = {
  true: { dot: "#22c55e", text: "#16a34a", label: "Active" },
  false: { dot: "#9ca3af", text: "#6b7280", label: "Inactive" },
};

// Memoized StatusBadge to prevent re-renders
const StatusBadge = memo(function StatusBadge({ isActive }) {
  const config = STATUS_CONFIG[isActive] || STATUS_CONFIG.false;
  return (
    <span
      style={{ color: config.text, fontSize: "12px" }}
      className="inline-flex items-center gap-1.5 font-inter font-bold"
    >
      <span
        style={{ backgroundColor: config.dot }}
        className="h-2 w-2 rounded-full flex-shrink-0"
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
        border: `1px solid #e2e6ee`,
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
        padding: "16px",
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full font-inter outline-none"
          style={{
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            padding: "8px 10px",
            fontSize: "14px",
          }}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mt-4">
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
          className="font-inter font-bold text-white transition-colors"
          style={{
            borderRadius: "8px",
            backgroundColor: "#003370",
            padding: "7px 14px",
            fontSize: "12px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#16385f")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#003370")
          }
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
  // State
  const [searchInput, setSearchInput] = useState(""); // For input control
  const [searchQuery, setSearchQuery] = useState(""); // For API calls
  const [roleFilter, setRoleFilter] = useState("All Roles");

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState(""); // Kept for api compatibility

  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // Refs
  const debounceTimerRef = useRef(null);

  // Fetch users from API
  const {
    data: usersData = [],
    isLoading,
    error,
  } = useUsers({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: searchQuery.trim(),
    role: roleFilter === "All Roles" ? "" : roleFilter,
    date: dateFilter, // Let the backend handle the date filtering
    isActive: true, // Only fetch active users to follow the backend's soft-delete
  });

  // Setup mutations
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Transform API response
  const users = useMemo(
    () => (Array.isArray(usersData) ? usersData : usersData.results || []),
    [usersData],
  );

  const totalCount = useMemo(
    () => usersData.count || users.length,
    [usersData, users.length],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const safeCurrentPage = useMemo(
    () => Math.min(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const showPagination = useMemo(() => totalCount >= 50, [totalCount]);

  // Handle search with debounce
  const handleSearchInputChange = useCallback(
    (value) => {
      setSearchInput(value);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on new search
        // Reset role filter when searching
        if (value.trim() !== "" && roleFilter !== "All Roles") {
          setRoleFilter("All Roles");
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [roleFilter],
  );

  // Clean up debounce on unmount
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
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = 2;
    let start = Math.max(1, safeCurrentPage - half);
    let end = Math.min(totalPages, safeCurrentPage + half);

    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(totalPages, 5);
      } else {
        start = Math.max(1, end - 4);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, safeCurrentPage]);

  // Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setEditUser(null);
  }, []);

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
          style={{ fontSize: "18px", paddingLeft: CONTENT_PADDING }}
        >
          Users Management
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
              onChange={(e) => {
                handleSearchInputChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, email"
              className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none disabled:opacity-50"
              style={{
                height: "36px",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "0 12px 0 40px",
                fontSize: "13px",
              }}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-md font-inter font-bold text-white transition hover:brightness-110 active:scale-95"
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
              {roleFilter !== "All Roles" && (
                <span
                  className="inline-flex items-center justify-center font-bold"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    color: "#12345b",
                    fontSize: "10px",
                    marginLeft: "4px",
                  }}
                >
                  1
                </span>
              )}
            </button>
            {isFilterOpen && (
              <FilterPopover
                role={roleFilter}
                onRoleChange={handleRoleFilterChange}
                onClear={() => handleRoleFilterChange("All Roles")}
                onClose={() => setIsFilterOpen(false)}
              />
            )}
          </div>

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

      {/* Table */}
      <div className="overflow-x-auto">
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
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-red-500"
                >
                  Failed to load users. Please try again.
                </td>
              </tr>
            )}
            {!isLoading && !error && users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !error &&
              users.length > 0 &&
              users.map((user) => (
                <UserRow
                  key={user.user_id}
                  user={user}
                  onEdit={setEditUser}
                  onDelete={handleDeleteUser}
                  isUpdating={updateUserMutation.isLoading}
                  isDeleting={deleteUserMutation.isLoading}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
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
          <span className="font-semibold text-gray-700">{users.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
          users
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

      <EditUserModal
        isOpen={editUser !== null}
        onClose={handleCloseEditModal}
        user={editUser}
        onSave={handleSaveEdit}
      />
    </section>
  );
}
