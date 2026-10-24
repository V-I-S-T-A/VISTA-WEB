import ErrorNotice from "../../../../components/ErrorNotice";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  SquarePen,
  Trash2,
  Loader2,
  Building2,
  Calendar,
  FileText,
  Tag,
} from "lucide-react";
import api from "../../../../lib/axios";
import { fetchAllPages } from "../../../../utils/fetchAllPages";
import { fetchOrganizationPage, organizationFilters } from "../../../../utils/organizationPagination";
import "./ConfigTable.css";
import defaultUser from "../../../../assets/shared/default_user.jpg";
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

const CONTENT_PADDING = "30px";
const STATUS_OPTIONS = ["All", "Active", "Inactive"];

export default function ConfigTable({
  activeTab,
  tabLabel = "Entries",
  refreshTrigger,
  onEdit,
  onDelete,
}) {
  const pageSize = activeTab === "organizations" ? 8 : 10;
  const isOrganizations = activeTab === "organizations";
  const [data, setData] = useState([]);
  const [localLoadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isLocalLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    if (!isOrganizations || searchTerm.trim() === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, isOrganizations, debouncedSearch]);

  const organizations = useQuery({
    queryKey: ["registration-organizations", currentPage, debouncedSearch, statusFilter, refreshTrigger, retryCount],
    queryFn: ({ signal }) => fetchOrganizationPage(api, {
      page: currentPage, search: debouncedSearch, status: statusFilter, signal,
    }),
    enabled: isOrganizations,
    staleTime: 30_000,
    gcTime: 120_000,
    retry: 1,
  });
  const isLoading = isOrganizations ? organizations.isFetching : isLocalLoading;
  const loadError = isOrganizations
    ? (organizations.error ? "Could not load organizations. Please try again." : "")
    : localLoadError;

  const getEndpoint = (tab) => {
    return `/${tab.replace("_", "-")}/`;
  };

  useEffect(() => {
    if (activeTab === "organizations") return;
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const endpoint = getEndpoint(activeTab);
        const items = await api.get(endpoint, { signal: controller.signal })
          .then(({ data }) => data.results || data || []);
        if (!controller.signal.aborted) setData(items);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(`Error fetching data for ${activeTab}:`, error);
        setData([]);
        setLoadError(`Could not load ${tabLabel.toLowerCase()}. Please try again.`);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [activeTab, refreshTrigger, tabLabel, retryCount]);

  const getItemId = (item) => {
    return (
      item.org_id ||
      item.academic_year_id ||
      item.doc_type_id ||
      item.category_id ||
      item.id
    );
  };

  const filteredData = useMemo(() => {
    if (isOrganizations) return organizations.data?.results || [];
    const query = searchTerm.trim().toLowerCase();

    return data.filter((item) => {
      // Status filtering (only if item has is_active property)
      if (item.is_active !== undefined) {
        if (statusFilter === "Active" && !item.is_active) return false;
        if (statusFilter === "Inactive" && item.is_active) return false;
      }

      if (!query) return true;

      if (activeTab === "academic_years") {
        return (
          String(item.year || item.name || "").toLowerCase().includes(query) ||
          String(item.academic_year_id || "").toLowerCase().includes(query)
        );
      }
      if (activeTab === "document_types") {
        return (
          String(item.name || "").toLowerCase().includes(query) ||
          String(item.code || "").toLowerCase().includes(query) ||
          String(item.description || "").toLowerCase().includes(query) ||
          String(item.doc_type_id || "").toLowerCase().includes(query)
        );
      }
      if (activeTab === "categories") {
        return (
          String(item.name || "").toLowerCase().includes(query) ||
          String(item.category_id || "").toLowerCase().includes(query)
        );
      }
      return false;
    });
  }, [data, searchTerm, statusFilter, activeTab, isOrganizations, organizations.data]);

  const totalCount = isOrganizations ? (organizations.data?.count || 0) : filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = isOrganizations
    ? (organizations.data?.current_page || currentPage)
    : Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (isOrganizations) return filteredData;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safeCurrentPage, pageSize, isOrganizations]);

  const showPagination = totalCount > pageSize;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = 2;
    let start = Math.max(1, safeCurrentPage - half);
    let end = Math.min(totalPages, safeCurrentPage + half);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, 5);
      else start = Math.max(1, end - 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, safeCurrentPage]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages]
  );

  const handleExportCSV = useCallback(async () => {
    setIsExporting(true);
    setExportError("");
    try {
      // Full-list loading happens only when explicitly exporting.
      const exportData = isOrganizations
        ? await fetchAllPages(api, "/organizations/", {
          params: organizationFilters(searchTerm, statusFilter),
        })
        : filteredData;
      if (!exportData.length) {
        setExportError(`No ${tabLabel.toLowerCase()} data to export.`);
        return;
      }

      let headers = [];
      let rows = [];

      if (activeTab === "organizations") {
        headers = ["Org ID", "Org Name", "Acronym", "Description", "Status", "Date Added"];
        rows = exportData.map((item) => [
          `"${item.org_id || ""}"`,
          `"${(item.name || "").replace(/"/g, '""')}"`,
          `"${(item.acronym || "").replace(/"/g, '""')}"`,
          `"${(item.description || "").replace(/"/g, '""')}"`,
          item.is_active ? "Active" : "Inactive",
          `"${item.created_at ? new Date(item.created_at).toLocaleDateString("en-US") : "N/A"}"`,
        ]);
      } else if (activeTab === "academic_years") {
        headers = ["Academic Year ID", "Academic Year", "Status", "Date Added"];
        rows = filteredData.map((item) => [
          `"${item.academic_year_id || ""}"`,
          `"${(item.year || item.name || "").replace(/"/g, '""')}"`,
          item.is_active ? "Active" : "Inactive",
          `"${item.created_at ? new Date(item.created_at).toLocaleDateString("en-US") : "N/A"}"`,
        ]);
      } else if (activeTab === "document_types") {
        headers = ["Document ID", "Document Name", "Code", "Description", "Status"];
        rows = filteredData.map((item) => [
          `"${item.doc_type_id || ""}"`,
          `"${(item.name || "").replace(/"/g, '""')}"`,
          `"${(item.code || "").replace(/"/g, '""')}"`,
          `"${(item.description || "").replace(/"/g, '""')}"`,
          item.is_active ? "Active" : "Inactive",
        ]);
      } else {
        headers = ["Category ID", "Category Name"];
        rows = filteredData.map((item) => [
          `"${item.category_id || ""}"`,
          `"${(item.name || "").replace(/"/g, '""')}"`,
        ]);
      }

      const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error exporting ${activeTab}:`, err);
      setExportError(`Failed to export ${tabLabel.toLowerCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  }, [filteredData, activeTab, tabLabel, isOrganizations, searchTerm, statusFilter]);

  const renderEmptyIcon = () => {
    if (activeTab === "organizations")
      return <Building2 className="w-8 h-8 mb-3 text-gray-300" />;
    if (activeTab === "academic_years")
      return <Calendar className="w-8 h-8 mb-3 text-gray-300" />;
    if (activeTab === "document_types")
      return <FileText className="w-8 h-8 mb-3 text-gray-300" />;
    return <Tag className="w-8 h-8 mb-3 text-gray-300" />;
  };

  const getTableConfig = () => {
    switch (activeTab) {
      case "organizations":
        return {
          idHeader: "ORG ID",
          headers: [
            { label: "ORG ID" },
            { label: "ORG NAME" },
            { label: "ACRONYM" },
            { label: "DESCRIPTION" },
            { label: "STATUS" },
            { label: "DATE ADDED" },
            { label: "ACTIONS" },
          ],
          renderRow: (item) => (
            <>
              <td data-label="Organization" className="px-6 py-4 align-middle">
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={item.image_url || defaultUser}
                    alt=""
                    className="flex-shrink-0 rounded-full object-cover"
                    style={{ width: "40px", height: "40px" }}
                    onError={(e) => {
                      e.currentTarget.src = defaultUser;
                    }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-inter font-bold text-gray-900 text-[15px] leading-relaxed [overflow-wrap:anywhere]">
                      {item.name || "N/A"}
                    </p>
                  </div>
                </div>
              </td>
              <td data-label="Acronym" className="px-6 py-4 align-middle">
                <p className="font-inter font-medium text-gray-700 text-[13px] leading-relaxed [overflow-wrap:anywhere]">
                  {item.acronym || "N/A"}
                </p>
              </td>
              <td data-label="Description" className="px-6 py-4 align-middle">
                <p
                  className="line-clamp-2 font-inter font-medium text-gray-500 text-[13px] leading-relaxed [overflow-wrap:anywhere]"
                  title={item.description}
                >
                  {item.description || "N/A"}
                </p>
              </td>
              <td data-label="Status" className="px-6 py-4 align-middle whitespace-nowrap">
                <StatusBadge isActive={item.is_active} />
              </td>
              <td data-label="Date added" className="px-6 py-4 align-middle font-inter font-medium text-gray-500 whitespace-nowrap text-[13px]">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                  : "N/A"}
              </td>
            </>
          ),
        };
      case "categories":
        return {
          idHeader: "CATEGORY ID",
          headers: [
            { label: "CATEGORY ID", className: "w-[120px] min-w-[120px]" },
            { label: "CATEGORY NAME", className: "min-w-[240px]" },
            { label: "ACTIONS", className: "w-[170px] min-w-[170px] pl-6" },
          ],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5 min-w-[240px]">
                <p className="font-inter font-bold text-gray-900 text-[15px] leading-tight">
                  {item.name || "N/A"}
                </p>
              </td>
            </>
          ),
        };
      case "document_types":
        return {
          idHeader: "DOCUMENT ID",
          headers: [
            { label: "DOCUMENT ID", className: "w-[120px] min-w-[120px]" },
            { label: "DOCUMENT NAME", className: "min-w-[200px]" },
            { label: "CODE", className: "w-[110px] min-w-[110px]" },
            { label: "DESCRIPTION", className: "min-w-[180px] max-w-[220px]" },
            { label: "STATUS", className: "w-[100px] min-w-[100px]" },
            { label: "ACTIONS", className: "w-[170px] min-w-[170px] pl-6" },
          ],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5 min-w-[200px]">
                <p className="font-inter font-bold text-gray-900 text-[15px] leading-tight">
                  {item.name || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5 w-[110px] min-w-[110px] whitespace-nowrap">
                <span className="font-mono font-bold text-[#1f5cae] bg-blue-50 px-2.5 py-1 rounded text-[12px] border border-blue-100">
                  {item.code || "N/A"}
                </span>
              </td>
              <td className="px-5 py-2.5 min-w-[180px] max-w-[220px]">
                <p
                  className="font-inter font-medium text-gray-500 text-[13px] truncate"
                  title={item.description}
                >
                  {item.description || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5 w-[100px] min-w-[100px] whitespace-nowrap">
                <StatusBadge isActive={item.is_active} />
              </td>
            </>
          ),
        };
      case "academic_years":
      default:
        return {
          idHeader: "YEAR ID",
          headers: [
            { label: "YEAR ID", className: "w-[120px] min-w-[120px]" },
            { label: "ACADEMIC YEAR", className: "min-w-[200px]" },
            { label: "STATUS", className: "w-[100px] min-w-[100px]" },
            { label: "DATE ADDED", className: "w-[130px] min-w-[130px]" },
            { label: "ACTIONS", className: "w-[170px] min-w-[170px] pl-6" },
          ],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5 min-w-[200px]">
                <p className="font-inter font-bold text-gray-900 text-[15px] leading-tight">
                  {item.year || item.name || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5 w-[100px] min-w-[100px] whitespace-nowrap">
                <StatusBadge isActive={item.is_active} />
              </td>
              <td className="px-5 py-2.5 w-[130px] min-w-[130px] font-inter font-medium text-gray-500 whitespace-nowrap text-[13px]">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                  : "N/A"}
              </td>
            </>
          ),
        };
    }
  };

  const { headers, renderRow } = getTableConfig();
  const hasStatusFilter = activeTab !== "categories";

  return (
    <div className={activeTab === "organizations" ? "registration-orgs" : undefined}>
    <TableContainer
      title={`${tabLabel} Database`}
      headerRight={
        <>
          <TableSearchBar
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOrganizations) setCurrentPage(1);
            }}
            placeholder={`Search ${tabLabel.toLowerCase()}...`}
          />

          {hasStatusFilter && (
            <div className="relative">
              <FilterButton
                onClick={() => setIsFilterOpen((open) => !open)}
                activeCount={statusFilter !== "All" ? 1 : 0}
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
          )}

          <ExportButton
            onClick={handleExportCSV}
            isLoading={isExporting}
          />
        </>
      }
      totalCount={totalCount}
      shownCount={paginatedData.length}
      recordLabel={tabLabel.toLowerCase()}
      showPagination={showPagination}
      currentPage={safeCurrentPage}
      totalPages={totalPages}
      pageNumbers={pageNumbers}
      onGoToPage={goToPage}
      errorMessage={exportError}
    >
      <table className={activeTab === "organizations" ? "w-full table-fixed border-collapse" : "min-w-full border-collapse"}>
        {activeTab === "organizations" && (
          <colgroup>
            <col style={{ width: "10%" }} />
            <col />
            <col style={{ width: "10%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "210px" }} />
          </colgroup>
        )}
        <thead>
          <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
            {headers.map((col, idx) => (
              <th
                key={col.label}
                className={`${activeTab === "organizations" ? "px-6 py-4" : "px-5 py-2.5"} text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${col.className || ""}`}
                style={{
                  ...(idx === 0 ? { paddingLeft: CONTENT_PADDING } : {}),
                  ...(idx === headers.length - 1 ? { paddingRight: CONTENT_PADDING } : {}),
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-12 text-center">
                <div className="inline-flex items-center justify-center gap-2 text-[#1f5cae]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-inter text-[14px] font-medium text-gray-600">
                    Loading {tabLabel.toLowerCase()}...
                  </span>
                </div>
              </td>
            </tr>
          ) : loadError ? (
            <tr><td colSpan={headers.length}><ErrorNotice message={loadError} onRetry={() => setRetryCount(c => c + 1)} /></td></tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-5 py-12 text-center font-inter text-sm text-gray-500"
              >
                {searchTerm || statusFilter !== "All" ? (
                  <p>No {tabLabel.toLowerCase()} match your filters.</p>
                ) : (
                  <div className="inline-flex flex-col items-center justify-center text-gray-400">
                    {renderEmptyIcon()}
                    <p className="font-inter text-[14px] font-medium text-gray-500">
                      No{" "}
                      <span className="font-bold text-gray-700">
                        {tabLabel.toLowerCase()}
                      </span>{" "}
                      found in the database.
                    </p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            paginatedData.map((item) => (
              <tr
                key={getItemId(item)}
                className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
              >
                <td
                  data-label={headers[0].label}
                  className={`${activeTab === "organizations" ? "px-6 py-4" : "px-5 py-2.5"} whitespace-nowrap ${activeTab === "organizations" ? "" : headers[0]?.className || "w-[110px] min-w-[110px]"}`}
                  style={{ paddingLeft: CONTENT_PADDING }}
                >
                  <span className="font-mono text-[12px] font-semibold text-gray-400">
                    {String(getItemId(item)).slice(0, 8).toUpperCase()}
                  </span>
                </td>

                {renderRow(item)}

                <td
                  data-label="Actions"
                  className={`${activeTab === "organizations" ? "px-6 py-4" : "px-5 py-2.5 pl-6"} whitespace-nowrap ${activeTab === "organizations" ? "" : headers[headers.length - 1]?.className || "w-[170px] min-w-[170px]"}`}
                  style={{ paddingRight: CONTENT_PADDING }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-1 rounded bg-[#ffe100] font-inter font-bold text-gray-900 transition hover:bg-[#e6c900] active:scale-95 border border-[#d4a000]/50"
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
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center gap-1 rounded bg-[#ef4444] font-inter font-bold text-white transition hover:bg-[#dc2626] active:scale-95 border border-[#b91c1c]/50"
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
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
    </div>
  );
}
