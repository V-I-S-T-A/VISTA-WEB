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
  X,
  Building2,
} from "lucide-react";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import EditOrgModal from "../modals/EditOrgModal";
import {
  useOrganizations,
  useUpdateOrganization,
  useDeleteOrganization,
} from "../../../../hooks/useOrganizations";

const PAGE_SIZE = 50;
const CONTENT_PADDING = "30px";
const SEARCH_DEBOUNCE_MS = 600;

const STATUS_CONFIG = {
  true: { dot: "#22c55e", text: "#16a34a", label: "Active" },
  false: { dot: "#9ca3af", text: "#6b7280", label: "Inactive" },
};

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

// Filter Popover matching Users Management design
function FilterPopover({ status, onStatusChange, onClear, onClose }) {
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
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
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

// Memoized OrgRow component
const OrgRow = memo(function OrgRow({
  org,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) {
  const handleEdit = useCallback(() => onEdit(org), [org, onEdit]);
  const handleDelete = useCallback(() => onDelete(org), [org, onDelete]);

  return (
    <tr className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]">
      <td className="px-5 py-2.5" style={{ paddingLeft: CONTENT_PADDING }}>
        <div className="flex items-center gap-3">
          <img
            src={org.image_url || defaultUser}
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
              {org.name || "Unknown Organization"}
            </p>
            <p
              className="max-w-[240px] truncate font-inter font-medium text-gray-400 mt-0.5"
              style={{ fontSize: "12px" }}
            >
              ID: {org.org_id ? String(org.org_id).slice(0, 8) : "N/A"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-2.5">
        <span
          className="inline-flex items-center justify-center rounded-full px-7 py-3 font-inter font-semibold capitalize bg-[#dfe7fb] text-[#12345b]"
          style={{ fontSize: "13px", minWidth: "80px" }}
        >
          {org.acronym || "N/A"}
        </span>
      </td>
      <td className="px-5 py-2.5">
        <span
          className="font-inter font-medium text-gray-700 whitespace-nowrap uppercase"
          style={{ fontSize: "13px" }}
        >
          {org.description || "No description provided"}
        </span>
      </td>
      <td
        className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
        style={{ fontSize: "13px" }}
      >
        {org.created_at
          ? new Date(org.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A"}
      </td>
      <td className="px-5 py-2.5">
        <StatusBadge isActive={org.is_active} />
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

export default function RegisteredOrgTable() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [editOrg, setEditOrg] = useState(null);
  const [deleteConfirmOrg, setDeleteConfirmOrg] = useState(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const debounceTimerRef = useRef(null);

  const {
    data: orgsData = [],
    isLoading,
    error,
  } = useOrganizations({
    search: searchQuery.trim(),
  });

  const updateOrgMutation = useUpdateOrganization();
  const deleteOrgMutation = useDeleteOrganization();

  const rawOrgs = useMemo(
    () => (Array.isArray(orgsData) ? orgsData : orgsData.results || []),
    [orgsData]
  );

  const filteredOrgs = useMemo(() => {
    return rawOrgs.filter((org) => {
      if (statusFilter === "Active") return org.is_active === true;
      if (statusFilter === "Inactive") return org.is_active === false;
      return true;
    });
  }, [rawOrgs, statusFilter]);

  const totalCount = filteredOrgs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrgs = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrgs.slice(start, start + PAGE_SIZE);
  }, [filteredOrgs, safeCurrentPage]);

  const showPagination = useMemo(() => totalCount >= 50, [totalCount]);

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

  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchClick = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery(searchInput);
    setCurrentPage(1);
  }, [searchInput]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearchClick();
      }
    },
    [handleSearchClick]
  );

  const handleSaveEdit = async (orgId, payload) => {
    try {
      await updateOrgMutation.mutateAsync({ orgId, data: payload });
      setEditOrg(null);
    } catch (err) {
      console.error("Failed to update organization:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmOrg) return;
    try {
      await deleteOrgMutation.mutateAsync(deleteConfirmOrg.org_id);
      setDeleteConfirmOrg(null);
    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };

  const handleExportCSV = useCallback(() => {
    setIsExporting(true);
    setExportError("");
    try {
      if (!filteredOrgs.length) {
        setExportError("No organization data to export.");
        return;
      }
      const headers = ["Organization ID", "Name", "Acronym", "Description", "Status", "Created At"];
      const rows = filteredOrgs.map((org) => [
        `"${org.org_id || ""}"`,
        `"${(org.name || "").replace(/"/g, '""')}"`,
        `"${(org.acronym || "").replace(/"/g, '""')}"`,
        `"${(org.description || "").replace(/"/g, '""')}"`,
        org.is_active ? "Active" : "Inactive",
        `"${org.created_at || ""}"`,
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `registered_organizations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting organizations:", err);
      setExportError("Failed to export organizations. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [filteredOrgs]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages]
  );

  return (
    <>
      <section
        style={{
          borderRadius: "12px",
          border: "1px solid #e2e6ee",
          boxShadow: "0 1px 3px rgba(15, 42, 74, 0.06)",
          marginBottom: "16px",
        }}
        className="bg-white"
      >
        {/* Top Header Bar */}
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
            Organization Management
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
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, acronym"
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
                {statusFilter !== "All" && (
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
                  status={statusFilter}
                  onStatusChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setStatusFilter("All");
                    setCurrentPage(1);
                  }}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}
            </div>

            {/* Export */}
            <button
              onClick={handleExportCSV}
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
                  "ORGANIZATION NAME",
                  "ACRONYM",
                  "DESCRIPTION",
                  "CREATED DATE",
                  "STATUS",
                  "ACTION",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                    style={
                      heading === "ORGANIZATION NAME"
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
                      Loading organizations...
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
                    Failed to load organizations. Please try again.
                  </td>
                </tr>
              )}
              {!isLoading && !error && paginatedOrgs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                  >
                    No organizations found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                paginatedOrgs.length > 0 &&
                paginatedOrgs.map((org) => (
                  <OrgRow
                    key={org.org_id}
                    org={org}
                    onEdit={setEditOrg}
                    onDelete={setDeleteConfirmOrg}
                    isUpdating={updateOrgMutation.isPending}
                    isDeleting={deleteOrgMutation.isPending}
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
            <span className="font-semibold text-gray-700">{paginatedOrgs.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
            organizations
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
      </section>

      {/* Edit Organization Modal */}
      {editOrg && (
        <EditOrgModal
          isOpen={Boolean(editOrg)}
          onClose={() => setEditOrg(null)}
          onSave={handleSaveEdit}
          org={editOrg}
          isLoading={updateOrgMutation.isPending}
          error={updateOrgMutation.error}
        />
      )}

      {/* Delete Organization Modal matching project modal design */}
      {deleteConfirmOrg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2px)",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: "#ef4444",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 style={{ width: "16px", height: "16px", color: "#ffffff" }} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    Delete Organization
                  </h2>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.85)",
                      margin: 0,
                    }}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteConfirmOrg(null)}
                disabled={deleteOrgMutation.isPending}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "7px",
                  width: "30px",
                  height: "30px",
                  cursor: deleteOrgMutation.isPending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <X style={{ width: "15px", height: "15px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "24px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to delete{" "}
                <strong style={{ color: "#111827" }}>
                  {deleteConfirmOrg.name}
                </strong>{" "}
                {deleteConfirmOrg.acronym ? `(${deleteConfirmOrg.acronym})` : ""}? All associated data for this organization will be removed.
              </p>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteConfirmOrg(null)}
                disabled={deleteOrgMutation.isPending}
                style={{
                  border: "1.5px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: "600",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: deleteOrgMutation.isPending ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteOrgMutation.isPending}
                style={{
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: deleteOrgMutation.isPending ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: deleteOrgMutation.isPending ? 0.7 : 1,
                }}
              >
                {deleteOrgMutation.isPending ? "Deleting..." : "Delete Organization"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
