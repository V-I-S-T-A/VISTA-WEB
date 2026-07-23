import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  Search,
  SlidersHorizontal,
  SquarePen,
  Trash2,
  ChevronDown,
  Check,
  Loader,
} from "lucide-react";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import EditUserModal from "../modals/EditUserModal";
import { useUsers } from "../../../../hooks/useUsers";
import {
  useUpdateUser,
  useDeleteUser,
} from "../../../../hooks/useUserMutations";

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

// Memoized FilterDropdown
const FilterDropdown = memo(function FilterDropdown({
  label,
  options,
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (option) => {
      onChange(option);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        className="appearance-none bg-white font-inter font-semibold text-gray-700 outline-none cursor-pointer inline-flex items-center gap-6 hover:bg-gray-50 transition-colors whitespace-nowrap"
        style={{
          border: "1.5px solid #d1d5db",
          borderRadius: "7px",
          padding: "7px 11px",
          fontSize: "12px",
        }}
      >
        {value}
        <ChevronDown
          className="pointer-events-none h-4 w-4 flex-shrink-0 text-gray-500 transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option)}
                className={[
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-inter font-semibold transition-colors",
                  isSelected
                    ? "bg-[#eef2ff] text-[#1f5cae]"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
                style={{ fontSize: "12px" }}
              >
                {option}
                {isSelected && (
                  <Check
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

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
            src={defaultUser}
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
              {user.full_name}
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
        <StatusBadge isActive={user.is_active} />
      </td>
      <td
        className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
        style={{ fontSize: "13px" }}
      >
        {new Date(user.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
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
            className="inline-flex items-center gap-1 rounded bg-[#fee2e2] font-inter font-bold text-red-700 transition hover:bg-[#fecaca] active:scale-95 border border-red-300 disabled:opacity-50"
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

  // New States for "More Filters"
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const moreFiltersRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null);

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
    <section>
      {/* Toolbar */}
      <div className="bg-[#eef1f7] border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-4 h-auto">
          <div
            className="relative flex-shrink-0 flex items-center gap-2"
            style={{
              width: "480px",
              paddingTop: "18px",
              paddingBottom: "18px",
              paddingLeft: CONTENT_PADDING,
            }}
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
                style={{ width: "58px", height: "18px" }}
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, email"
                disabled={isLoading}
                className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none disabled:opacity-50"
                style={{
                  height: "40px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "0 16px 0 48px",
                  fontSize: "13px",
                }}
              />
            </div>
            <button
              onClick={handleSearchClick}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 bg-[#1f5cae] text-white font-inter font-semibold hover:bg-[#164a8a] transition-colors whitespace-nowrap disabled:opacity-50"
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "7px 16px",
                fontSize: "13px",
                height: "40px",
              }}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </div>

          <div
            className="flex items-center gap-2.5"
            style={{ paddingRight: "20px" }}
          >
            <FilterDropdown
              label="Filter by role"
              options={ROLE_OPTIONS}
              value={roleFilter}
              onChange={handleRoleFilterChange}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 bg-white font-inter font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: "7px",
                padding: "7px 13px",
                fontSize: "12px",
              }}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div
        className="bg-[#1f5cae] h-16 flex items-center"
        style={{ paddingLeft: CONTENT_PADDING }}
      >
        <h3 className="font-inter text-[18px] font-bold text-white">
          Users Management
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
              {["USER", "ROLE", "STATUS", "CREATED", "ACTION"].map(
                (heading) => (
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
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
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
                  colSpan={5}
                  className="px-5 py-10 text-center font-inter text-sm text-red-500"
                >
                  Failed to load users. Please try again.
                </td>
              </tr>
            )}
            {!isLoading && !error && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
