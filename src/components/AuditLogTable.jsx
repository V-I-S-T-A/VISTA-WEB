import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Loader2 } from "lucide-react";
import api from "../lib/axios";
import defaultUser from "../assets/shared/default_user.jpg";
import { useAuditLogPage } from "../hooks/useAuditLogs";
import { auditLogService } from "../services/auditLogService";
import { fetchAllPages } from "../utils/fetchAllPages";
import { auditLogParams, pageNumbers, TABLE_PAGE_SIZE } from "../utils/tablePagination";
import ErrorNotice from "./ErrorNotice";
import {
  PageHeader, TableContainer, TableSearchBar, FilterButton, FilterPopover,
  FilterPopoverRow, FilterSelect, FilterDateInput, ExportButton,
} from "./index";
import "./AdminDataTable.css";

const ACTION_COLORS = {
  login: { bg: "#dbeafe", text: "#1e40af" },
  logout: { bg: "#f3f4f6", text: "#374151" },
  create: { bg: "#dcfce7", text: "#166534" },
  update: { bg: "#fef3c7", text: "#92400e" },
  delete: { bg: "#fee2e2", text: "#991b1b" },
  status_change: { bg: "#e9d5ff", text: "#6b21a8" },
};
const formatDate = value => value ? new Date(value).toLocaleString("en-US", {
  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
}) : "N/A";
const csvCell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function AuditLogTable({ onViewLog, includeAuthActions = false }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All Actions");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [loadingDetail, setLoadingDetail] = useState("");
  const detailRequest = useRef(null);
  const exportRequest = useRef(null);
  const cache = useQueryClient();

  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timer = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => () => {
    detailRequest.current?.abort();
    exportRequest.current?.abort();
  }, []);

  const filters = useMemo(() => auditLogParams({ search, action, date }), [search, action, date]);
  const { data, isFetching, error, refetch } = useAuditLogPage({
    ...filters, page, page_size: TABLE_PAGE_SIZE,
  });
  const logs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / TABLE_PAGE_SIZE));
  const currentPage = data?.current_page || page;
  const actions = ["All Actions", ...(includeAuthActions ? ["login", "logout"] : []),
    "create", "update", "delete", "status_change"];

  async function viewDetails(log) {
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setLoadingDetail(log.audit_id);
    setDetailError("");
    try {
      const detail = await cache.fetchQuery({
        queryKey: ["audit-log", log.audit_id],
        queryFn: () => auditLogService.getDetail(log.audit_id, { signal: controller.signal }),
        staleTime: 30_000, gcTime: 120_000, retry: false,
      });
      if (!controller.signal.aborted) onViewLog?.(detail);
    } catch {
      if (!controller.signal.aborted) setDetailError("Could not load log details. Click View Details to retry.");
    } finally {
      if (!controller.signal.aborted) setLoadingDetail("");
    }
  }

  async function exportLogs() {
    const controller = new AbortController();
    exportRequest.current = controller;
    setIsExporting(true);
    setExportError("");
    try {
      const logs = await fetchAllPages(api, "/audit-logs/", { params: filters, signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!logs.length) { setExportError("No audit logs match your filters to export."); return; }
      const rows = logs.map(log => [formatDate(log.performed_at), log.performed_by || "System",
        log.action, log.table_name, log.audit_id].map(csvCell).join(","));
      const csv = ["TIMESTAMP,USER/ENTITY,ACTION,TABLE,AUDIT_ID", ...rows].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch {
      if (!controller.signal.aborted) setExportError("Could not export audit logs. Please try again.");
    } finally {
      if (!controller.signal.aborted) setIsExporting(false);
    }
  }

  return <>
    <PageHeader title="Audit Log History" subtitle="System-wide transparency of activities." />
    <div className="admin-data-table">
      <TableContainer title="Live Activity Stream"
        headerRight={<>
          <TableSearchBar value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search user, action, ID..." />
          <div className="relative">
            <FilterButton onClick={() => setFiltersOpen(open => !open)} activeCount={(action !== "All Actions" ? 1 : 0) + (date ? 1 : 0)} />
            {filtersOpen && <FilterPopover onClear={() => { setAction("All Actions"); setDate(""); setPage(1); }} onClose={() => setFiltersOpen(false)}>
              <FilterPopoverRow label="Action">
                <FilterSelect value={action} onChange={event => { setAction(event.target.value); setPage(1); }}>
                  {actions.map(action => <option key={action} value={action}>{action === "All Actions" ? action : action.toUpperCase()}</option>)}
                </FilterSelect>
              </FilterPopoverRow>
              <FilterPopoverRow label="Date">
                <FilterDateInput value={date} onChange={event => { setDate(event.target.value); setPage(1); }} />
              </FilterPopoverRow>
            </FilterPopover>}
          </div>
          <ExportButton onClick={exportLogs} isLoading={isExporting} />
        </>}
        totalCount={totalCount} shownCount={isFetching || error ? 0 : logs.length} recordLabel="entries"
        showPagination={totalCount > TABLE_PAGE_SIZE} currentPage={currentPage} totalPages={totalPages}
        pageNumbers={pageNumbers(currentPage, totalPages)} onGoToPage={page => setPage(Math.min(Math.max(page, 1), totalPages))}
        errorMessage={exportError || detailError}>
        <table className="border-collapse">
          <colgroup>{[23, 39, 18, 20].map((width, i) => <col key={i} style={{ width: `${width}%` }} />)}</colgroup>
          <thead><tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
            {["Timestamp", "User/Entity", "Action", "Details"].map(label => <th key={label} className="text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500">{label}</th>)}
          </tr></thead>
          <tbody>
            {isFetching ? <tr><td colSpan={4} className="p-10 text-center text-sm text-gray-500">Loading audit logs...</td></tr>
              : error ? <tr><td colSpan={4}><ErrorNotice message="Could not load audit logs. Please try again." onRetry={refetch} /></td></tr>
              : !logs.length ? <tr><td colSpan={4} className="p-10 text-center text-sm text-gray-500">No audit logs match your search.</td></tr>
              : logs.map(log => {
                const color = ACTION_COLORS[log.action] || { bg: "#f3f4f6", text: "#4b5563" };
                return <tr key={log.audit_id} className="h-16 border-b border-gray-100 last:border-b-0 hover:bg-[#f7f9ff]">
                  <td data-label="Timestamp" className="font-inter text-[13px] font-medium text-gray-700">{formatDate(log.performed_at)}</td>
                  <td data-label="User/Entity">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={log.performed_by_image || defaultUser} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" onError={event => { event.currentTarget.src = defaultUser; }} />
                      <div className="min-w-0">
                        <p className="font-inter text-[15px] font-bold text-gray-900">{log.performed_by || "System"}</p>
                        <p className="font-inter text-[12px] text-gray-500">{log.performed_by_org || "System User"}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Action"><span className="audit-action-badge inline-flex rounded-full text-[12px] font-semibold" style={{ backgroundColor: color.bg, color: color.text }}>{String(log.action).replaceAll("_", " ").toUpperCase()}</span></td>
                  <td data-label="Details"><button type="button" onClick={() => viewDetails(log)} disabled={!!loadingDetail}
                    className="audit-details-button inline-flex items-center rounded border border-[#d4a000]/50 bg-[#ffe100] font-inter text-[12px] font-bold text-gray-900 hover:bg-[#e6c900] disabled:opacity-60">
                    {loadingDetail === log.audit_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                    VIEW DETAILS
                  </button></td>
                </tr>;
              })}
          </tbody>
        </table>
      </TableContainer>
    </div>
  </>;
}
