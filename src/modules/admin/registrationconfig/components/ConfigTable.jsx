import { useState, useEffect, useMemo, useCallback } from "react";
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
const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["All", "Active", "Inactive"];

export default function ConfigTable({
  activeTab,
  tabLabel = "Entries",
  refreshTrigger,
  onEdit,
  onDelete,
}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const getEndpoint = (tab) => {
    return `/${tab.replace("_", "-")}/`;
  };

  useEffect(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
    setExportError("");
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(getEndpoint(activeTab));
        setData(response.data.results || response.data || []);
      } catch (error) {
        console.error(`Error fetching data for ${activeTab}:`, error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, refreshTrigger]);

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
    const query = searchTerm.trim().toLowerCase();

    return data.filter((item) => {
      // Status filtering (only if item has is_active property)
      if (item.is_active !== undefined) {
        if (statusFilter === "Active" && !item.is_active) return false;
        if (statusFilter === "Inactive" && item.is_active) return false;
      }

      if (!query) return true;

      if (activeTab === "organizations") {
        return (
          String(item.name || "").toLowerCase().includes(query) ||
          String(item.acronym || "").toLowerCase().includes(query) ||
          String(item.description || "").toLowerCase().includes(query) ||
          String(item.org_id || "").toLowerCase().includes(query)
        );
      }
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
  }, [data, searchTerm, statusFilter, activeTab]);

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, safeCurrentPage]);

  const showPagination = totalCount > PAGE_SIZE;

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

  const handleExportCSV = useCallback(() => {
    setIsExporting(true);
    setExportError("");
    try {
      if (!filteredData.length) {
        setExportError(`No ${tabLabel.toLowerCase()} data to export.`);
        return;
      }

      let headers = [];
      let rows = [];

      if (activeTab === "organizations") {
        headers = ["Org ID", "Org Name", "Acronym", "Description", "Status", "Date Added"];
        rows = filteredData.map((item) => [
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
  }, [filteredData, activeTab, tabLabel]);

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
            { label: "ORG ID", className: "w-[100px] min-w-[100px]" },
            { label: "ORG NAME", className: "min-w-[190px]" },
            { label: "ACRONYM", className: "w-[110px] min-w-[110px]" },
            { label: "DESCRIPTION", className: "min-w-[160px] max-w-[200px]" },
            { label: "STATUS", className: "w-[90px] min-w-[90px]" },
            { label: "DATE ADDED", className: "w-[110px] min-w-[110px]" },
            { label: "ACTIONS", className: "w-[170px] min-w-[170px] pl-6" },
          ],
          renderRow: (item) => (
            <>
              <td className="px-5 py-2.5 min-w-[190px]">
                <div className="flex items-center gap-3">
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
                  <div className="min-w-0">
                    <p className="font-inter font-bold text-gray-900 text-[15px] leading-tight">
                      {item.name || "N/A"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-2.5 w-[110px] min-w-[110px]">
                <p className="font-inter font-medium text-gray-700 text-[13px] leading-tight break-words">
                  {item.acronym || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5 min-w-[160px] max-w-[200px]">
                <p
                  className="font-inter font-medium text-gray-500 text-[13px] truncate"
                  title={item.description}
                >
                  {item.description || "N/A"}
                </p>
              </td>
              <td className="px-5 py-2.5 w-[90px] min-w-[90px] whitespace-nowrap">
                <StatusBadge isActive={item.is_active} />
              </td>
              <td className="px-5 py-2.5 w-[110px] min-w-[110px] font-inter font-medium text-gray-500 whitespace-nowrap text-[13px]">
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
    <TableContainer
      title={`${tabLabel} Database`}
      headerRight={
        <>
          <TableSearchBar
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
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
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
            {headers.map((col, idx) => (
              <th
                key={col.label}
                className={`px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${col.className || ""}`}
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
                  className={`px-5 py-2.5 whitespace-nowrap ${headers[0]?.className || "w-[110px] min-w-[110px]"}`}
                  style={{ paddingLeft: CONTENT_PADDING }}
                >
                  <span className="font-mono text-[12px] font-semibold text-gray-400">
                    {String(getItemId(item)).slice(0, 8).toUpperCase()}
                  </span>
                </td>

                {renderRow(item)}

                <td
                  className={`px-5 py-2.5 pl-6 whitespace-nowrap ${headers[headers.length - 1]?.className || "w-[170px] min-w-[170px]"}`}
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
  );
}
