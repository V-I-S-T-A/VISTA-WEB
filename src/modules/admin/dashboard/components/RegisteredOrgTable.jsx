import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  SquarePen,
  Trash2,
  Loader,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import EditOrgModal from "../modals/EditOrgModal";
import {
  useOrganizations,
  useUpdateOrganization,
  useDeleteOrganization,
} from "../../../../hooks/useOrganizations";
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
      <td className="px-5 py-2.5 min-w-[240px]" style={{ paddingLeft: CONTENT_PADDING }}>
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
      <td className="px-5 py-2.5 whitespace-nowrap">
        <span
          className="inline-flex items-center justify-center rounded-full px-4 py-1 font-inter font-semibold bg-[#dfe7fb] text-[#12345b] text-[12.5px] min-w-[70px]"
        >
          {org.acronym || "N/A"}
        </span>
      </td>
      <td className="px-5 py-2.5">
        <p
          className="font-inter font-medium text-gray-500 text-[13px] truncate max-w-[240px]"
          title={org.description}
        >
          {org.description || "No description provided"}
        </p>
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
      <td className="px-5 py-2.5 whitespace-nowrap min-w-[120px]">
        <StatusBadge isActive={org.is_active} />
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

const STATUS_OPTIONS = ["All", "Active", "Inactive"];

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

  const activeFilterCount = statusFilter !== "All" ? 1 : 0;

  return (
    <>
      <TableContainer
        title="Organization Management"
        headerRight={
          <>
            <TableSearchBar
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, acronym"
            />

            <div className="relative">
              <FilterButton
                onClick={() => setIsFilterOpen((open) => !open)}
                activeCount={activeFilterCount}
              />
              {isFilterOpen && (
                <FilterPopover
                  onClear={() => {
                    setStatusFilter("All");
                    setCurrentPage(1);
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
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === "All" ? "All Status" : opt}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterPopoverRow>
                </FilterPopover>
              )}
            </div>

            <ExportButton
              onClick={handleExportCSV}
              isLoading={isExporting}
            />
          </>
        }
        totalCount={totalCount}
        shownCount={paginatedOrgs.length}
        recordLabel="organizations"
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
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Failed to load organizations. Please try again.
                  </div>
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
      </TableContainer>

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
                {deleteOrgMutation.isPending ? (
                  <>
                    <Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Organization"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
