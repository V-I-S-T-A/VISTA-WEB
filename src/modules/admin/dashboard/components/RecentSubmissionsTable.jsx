import { getApiErrorMessage } from "../../../../utils/apiErrorMessage";
import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { SquarePen, Loader, Mail } from "lucide-react";
import { useToast } from "../../../../components/toastContext";
import ErrorNotice from "../../../../components/ErrorNotice";
import "../../../../components/AdminDataTable.css";
import { TABLE_PAGE_SIZE, pageNumbers as getPageNumbers } from "../../../../utils/tablePagination";
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

const PAGE_SIZE = TABLE_PAGE_SIZE;
const CONTENT_PADDING = "30px";
const SEARCH_DEBOUNCE_MS = 350;

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
  isUpdating,
  isDeleting,
  onResend,
  isResending,
}) {
  const handleEdit = useCallback(() => onEdit(user), [user, onEdit]);

  return (
    <tr className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]">
      <td data-label="User" className="px-5 py-2.5" style={{ paddingLeft: CONTENT_PADDING }}>
        <div className="flex min-w-0 items-center gap-3">
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
      <td data-label="Role" className="px-5 py-2.5">
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 font-inter font-semibold capitalize ${
            user.role === "staff"
              ? "bg-[#dfe7fb] text-[#12345b]"
              : "bg-[#e8e3ff] text-[#4a3f99]"
          }`}
          style={{ fontSize: "13px" }}
        >
          {user.role}
        </span>
      </td>
      <td data-label="Organization" className="px-5 py-2.5">
        <span
          className="font-inter font-medium text-gray-700 whitespace-nowrap uppercase"
          style={{ fontSize: "13px" }}
        >
          {user.department || "N/A"}
        </span>
      </td>
      <td
        data-label="Last login"
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
      <td data-label="Status" className="px-5 py-2.5">
        <StatusBadge isActive={user.is_active} />
      </td>
      <td data-label="Actions" className="px-5 py-2.5">
        <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap [&>button]:shrink-0">
          <button
            type="button"
            onClick={handleEdit}
            disabled={isUpdating || isDeleting || isResending}
            className="inline-flex items-center gap-1 rounded bg-[#ffe100] font-inter font-bold text-gray-900 transition hover:bg-[#e6c900] active:scale-95 border border-[#d4a000]/50 disabled:opacity-50"
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            <SquarePen
              style={{ width: "12px", height: "12px" }}
              aria-hidden="true"
            />
            EDIT
          </button>
          {user.is_active && !user.last_login && user.must_change_password && (
            <button
              type="button"
              onClick={() => onResend(user)}
              disabled={isUpdating || isDeleting || isResending}
              className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-3 py-1 font-inter text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
              aria-label={`Resend invitation to ${user.email}`}
            >
              <Mail className="h-3 w-3" aria-hidden="true" />
              {isResending ? "Sending..." : "Resend invitation"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

const STATUS_OPTIONS = ["All Status", "Active", "Inactive"];

export default function RecentSubmissionsTable() {
  const { showToast } = useToast();
  const [resendingUserId, setResendingUserId] = useState(null);
  const resendInProgress = useRef(false);

  const handleResendInvitation = useCallback(async (user) => {
    if (resendInProgress.current) return;
    if (!window.confirm(`Send a new invitation to ${user.email}? If sending succeeds, their previous temporary password will be replaced. Ask them to use the newest invitation.`)) return;
    resendInProgress.current = true;
    setResendingUserId(user.user_id);
    try {
      const result = await userService.resendInvitation(user.user_id);
      showToast(result.detail, "success", 12000);
    } catch (error) {
      const message = error.response?.status === 503 && error.response?.data?.code === "invitation_email_failed"
        ? "The invitation could not be sent. Ask your system administrator to check the email service and renew the Gmail authorization token if needed. The existing password has not changed. Try again after the email service is restored."
        : getApiErrorMessage(error, "Could not confirm whether the invitation was sent. Ask your administrator to check the email service before trying again.");
      showToast(message, "error", 20000);
    } finally {
      resendInProgress.current = false;
      setResendingUserId(null);
    }
  }, [showToast]);
  // State
  const [searchInput, setSearchInput] = useState(""); // For input control
  const [searchQuery, setSearchQuery] = useState(""); // For API calls
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [statusFilter, setStatusFilter] = useState("All Status");

  const isActiveParam =
    statusFilter === "Active"
      ? true
      : statusFilter === "Inactive"
        ? false
        : null;

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    isFetching: isLoading,
    error,
    refetch,
  } = useUsers({
    excludeAdmin: true,
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: searchQuery.trim(),
    role: roleFilter === "All Roles" ? "" : roleFilter,
    isActive: isActiveParam,
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
    () => usersData.count ?? users.length,
    [usersData, users.length],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const safeCurrentPage = useMemo(
    () => usersData.current_page || Math.min(currentPage, totalPages),
    [usersData.current_page, currentPage, totalPages],
  );

  const showPagination = totalCount > PAGE_SIZE;

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
      const [first, ...rest] = (data.full_name || "").trim().split(/\s+/);
      const last = rest.join(" ");
      try {
        await updateUserMutation.mutateAsync({
          userId: editUser.user_id,
          userData: {
            first_name: first,
            ...(last ? { last_name: last } : {}),
            role: data.role,
            org_id: data.org_id ?? null,
            is_active: data.is_active,
          },
        });
        setEditUser(null);
      } catch (err) {
        console.error("Error updating user:", err);
        throw err;
      }
    },
    [editUser, updateUserMutation],
  );

  // Delete handler
  const handleDeleteUser = useCallback(
    async (userId) => {
      if (!confirm("Permanently delete this user? This cannot be undone."))
        return;
      await deleteUserMutation.mutateAsync(userId);
      setEditUser(null);
      showToast("User account deleted.", "success");
    },
    [deleteUserMutation, showToast],
  );

  // Export handler — streams the backend-generated PDF (respecting the
  // same search/role filters currently applied to the table) and saves it.
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError("");
    try {
      const response = await userService.exportUsers({
        excludeAdmin: true,
        search: searchQuery.trim(),
        role: roleFilter,
        isActive: isActiveParam,
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
  }, [searchQuery, roleFilter, isActiveParam]);

  // Pagination numbers
  const pageNumbers = useMemo(() => getPageNumbers(safeCurrentPage, totalPages), [totalPages, safeCurrentPage]);

  // Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setEditUser(null);
  }, []);

  const activeFilterCount =
    (roleFilter !== "All Roles" ? 1 : 0) +
    (statusFilter !== "All Status" ? 1 : 0);

  return (
    <>
      <div className="admin-data-table">
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
                    setStatusFilter("All Status");
                    setIsFilterOpen(false);
                  }}
                  onClose={() => setIsFilterOpen(false)}
                >
                  <FilterPopoverRow label="Status">
                    <FilterSelect
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterPopoverRow>
                </FilterPopover>
              )}
            </div>

            <ExportButton onClick={handleExport} isLoading={isExporting} />
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
          <colgroup>
            <col />
            <col style={{ width: "10%" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "290px" }} />
          </colgroup>
          <thead>
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
              {[
                "USER",
                "ROLE",
                "ORGANIZATION",
                "LAST LOGIN",
                "STATUS",
                "ACTIONS",
              ].map((heading) => (
                <th
                  key={heading}
                  className="text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
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
            {!isLoading && error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-red-500"
                >
                  <ErrorNotice message="Failed to load users. Please try again." onRetry={refetch} />
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
                  onResend={handleResendInvitation}
                  isResending={resendingUserId === user.user_id}
                  isUpdating={updateUserMutation.isPending}
                  isDeleting={deleteUserMutation.isPending}
                />
              ))}
          </tbody>
        </table>
      </TableContainer>
      </div>

      <EditUserModal
        isOpen={editUser !== null}
        onClose={handleCloseEditModal}
        user={editUser}
        onSave={handleSaveEdit}
        onDelete={handleDeleteUser}
        isLoading={updateUserMutation.isPending || deleteUserMutation.isPending}
      />
    </>
  );
}
