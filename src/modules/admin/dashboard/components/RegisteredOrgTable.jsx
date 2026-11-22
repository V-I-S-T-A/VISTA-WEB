import DialogLayer from "../../../../components/DialogLayer";
import { TableRowsSkeleton } from "../../../../components/loading/Skeleton";
import ErrorNotice from "../../../../components/ErrorNotice";
import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  SquarePen,
  Trash2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import defaultUser from "../../../../assets/shared/default_user.webp";
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
      <td data-label="Organization" className="px-5 py-2.5 min-w-[240px]" style={{ paddingLeft: CONTENT_PADDING }}>
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
      <td data-label="Acronym" className="px-5 py-2.5 whitespace-nowrap">
        <span
          className="inline-flex items-center justify-center rounded-full px-4 py-1 font-inter font-semibold bg-[#dfe7fb] text-[#12345b] text-[12.5px] min-w-[70px]"
        >
          {org.acronym || "N/A"}
        </span>
      </td>
      <td data-label="Description" className="px-5 py-2.5">
        <p
          className="font-inter font-medium text-gray-500 text-[13px] truncate max-w-[240px]"
          title={org.description}
        >
          {org.description || "No description provided"}
        </p>
      </td>
      <td data-label="Date added"
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
      <td data-label="Status" className="px-5 py-2.5 whitespace-nowrap min-w-[120px]">
        <StatusBadge isActive={org.is_active} />
      </td>
      <td data-label="Actions" className="px-5 py-2.5 pl-6 whitespace-nowrap w-[170px]">
        <div className="flex items-center gap-2">
          <button data-ui="primary"
            type="button"
            onClick={handleEdit}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center gap-1 font-inter font-bold transition active:scale-95 border disabled:opacity-50"
            style={{  }}
          >
            <SquarePen
              style={{ width: "12px", height: "12px" }}
              aria-hidden="true"
            />
            EDIT
          </button>
          <button data-ui="destructive"
            type="button"
            onClick={handleDelete}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center gap-1 font-inter font-bold transition active:scale-95 border disabled:opacity-50"
            style={{  }}
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
        className="responsive-records"
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
              <TableRowsSkeleton columns={6} />
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
                  onDelete={(org) => { deleteOrgMutation.reset(); setDeleteConfirmOrg(org); }}
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
        <DialogLayer label={"Delete organization"} onDismiss={() => setDeleteConfirmOrg(null)} dismissDisabled={deleteOrgMutation.isPending}
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
          <div className="vista-surface"
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "var(--ui-surface)",
              borderRadius: "var(--radius-dialog)",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            maxHeight: "calc(100dvh - 32px)", overflowY: "auto",}}


          >
            {/* Modal Header */}
            <div className="vista-modal-heading"
              style={{
                backgroundColor: "var(--ui-surface)",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="vista-plain-icon"><Trash2 style={{ width: "16px", height: "16px", color: "var(--ui-navy)" }} /></span>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "var(--ui-navy)",
                      margin: 0,
                    }}
                  >
                    Delete Organization
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: "var(--ui-muted)",
                      margin: 0,
                    }}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <button aria-busy={Boolean(deleteOrgMutation.isPending)} data-ui="icon"
                type="button"
                onClick={() => setDeleteConfirmOrg(null)}
                disabled={deleteOrgMutation.isPending}
                style={{
                  background: "var(--ui-selected)",
                  border: "none",
                  borderRadius: "var(--radius-control)",
                  width: "30px",
                  height: "30px",
                  cursor: deleteOrgMutation.isPending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ui-navy)",
                }}
              >
                <X style={{ width: "15px", height: "15px" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "24px",
                fontFamily: "var(--font-body)",
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

            <ErrorNotice message={deleteOrgMutation.isError ? "Could not delete the organization. Please try again." : ""} />
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
              <button aria-busy={Boolean(deleteOrgMutation.isPending)} data-ui="secondary"
                type="button"
                onClick={() => setDeleteConfirmOrg(null)}
                disabled={deleteOrgMutation.isPending}
                style={{ cursor: deleteOrgMutation.isPending ? "not-allowed" : "pointer" }}
              >
                Cancel
              </button>
              <button aria-busy={Boolean(deleteOrgMutation.isPending)} data-ui="destructive"
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteOrgMutation.isPending}
                style={{ cursor: deleteOrgMutation.isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: deleteOrgMutation.isPending ? 0.7 : 1 }}
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
        </DialogLayer>
      )}
    </>
  );
}
