import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  SquarePen,
  Trash2,
  Loader,
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
import {
  TableContainer,
  TableSearchBar,
  FilterButton,
  FilterPopover,
  FilterPopoverRow,
  FilterSelect,
  ExportButton,
  StatusBadge,
} from "../../../../components";

const PAGE_SIZE = 50;
const CONTENT_PADDING = "30px";
const SEARCH_DEBOUNCE_MS = 600;

const ROLE_OPTIONS = ["All Roles", "staff", "student"];

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
          className={`inline-flex items-center justify-center rounded-full px-7 py-3 font-inter font-semibold capitalize ${user.role === "staff"
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
      <td className="px-5 py-2.5 whitespace-nowrap min-w-[120px]">
        <StatusBadge isActive={user.is_active} />
      </td>
      <td className="px-5 py-2.5 pl-6 whitespace-nowrap w-[170px]">
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
  const [dateFilter] = useState(""); // Kept for api compatibility

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

  const activeFilterCount = roleFilter !== "All Roles" ? 1 : 0;

  return (
    <>
      <TableContainer
        title="Users Management"
        headerRight={
          <>
            <TableSearchBar
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, email"
            />

            <div className="relative">
              <FilterButton
                onClick={() => setIsFilterOpen((open) => !open)}
                activeCount={activeFilterCount}
              />
              {isFilterOpen && (
                <FilterPopover
                  onClear={() => {
                    handleRoleFilterChange("All Roles");
                    setIsFilterOpen(false);
                  }}
                  onClose={() => setIsFilterOpen(false)}
                >
                  <FilterPopoverRow label="Role">
                    <FilterSelect
                      value={roleFilter}
                      onChange={(e) => handleRoleFilterChange(e.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterPopoverRow>
                </FilterPopover>
              )}
            </div>

            <ExportButton
              onClick={handleExport}
              isLoading={isExporting}
            />
          </>
        }
        totalCount={totalCount}
        shownCount={users.length}
        recordLabel="users"
        showPagination={showPagination}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onGoToPage={goToPage}
        errorMessage={exportError}
      >
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
                  className={`px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${
                    heading === "ACTION" ? "pl-6 w-[170px]" : ""
                  } ${heading === "STATUS" ? "min-w-[120px]" : ""}`}
                  style={
                    heading === "USER"
                      ? { paddingLeft: CONTENT_PADDING, minWidth: "220px" }
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
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Failed to load users. Please try again.
                  </div>
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
      </TableContainer>

      <EditUserModal
        isOpen={editUser !== null}
        onClose={handleCloseEditModal}
        user={editUser}
        onSave={handleSaveEdit}
      />
    </>
  );
}
