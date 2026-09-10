import { useState, useEffect, useMemo } from "react";
import { Eye } from "lucide-react";
import api from "../../../../lib/axios";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import {
  PageHeader,
  TableContainer,
  TableSearchBar,
  FilterButton,
  FilterPopover,
  FilterPopoverRow,
  FilterSelect,
  FilterDateInput,
  ExportButton,
} from "../../../../components";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "30px";

const ACTION_COLORS = {
  login: { bg: "#dbeafe", text: "#1e40af" },
  logout: { bg: "#f3f4f6", text: "#374151" },
  create: { bg: "#dcfce7", text: "#166534" },
  update: { bg: "#fef3c7", text: "#92400e" },
  delete: { bg: "#fee2e2", text: "#991b1b" },
  status_change: { bg: "#e9d5ff", text: "#6b21a8" },
  DEFAULT: { bg: "#f3f4f6", text: "#4b5563" },
};

export default function AuditLogHeader({ onViewLog }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ACTION_OPTIONS = [
    "All Actions",
    "login",
    "logout",
    "create",
    "update",
    "delete",
    "status_change",
  ];

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);
        let allLogs = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
          const response = await api.get(`/audit-logs/?page=${page}`);

          if (response.data && response.data.results) {
            allLogs = [...allLogs, ...response.data.results];

            if (response.data.next) {
              page++;
            } else {
              hasNextPage = false;
            }
          } else {
            allLogs = response.data;
            hasNextPage = false;
          }
        }

        setLogs(allLogs);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return logs.filter((log) => {
      const userName = log.performed_by || "System/Unknown";

      const matchesSearch =
        !query ||
        String(userName).toLowerCase().includes(query) ||
        String(log.action || "")
          .toLowerCase()
          .includes(query) ||
        String(log.audit_id || "")
          .toLowerCase()
          .includes(query) ||
        String(log.table_name || "")
          .toLowerCase()
          .includes(query);

      const matchesAction =
        actionFilter === "All Actions" || log.action === actionFilter;

      let matchesDate = true;
      if (dateFilter && log.performed_at) {
        const logDateObj = new Date(log.performed_at);
        const formattedLogDate = `${logDateObj.getFullYear()}-${String(logDateObj.getMonth() + 1).padStart(2, "0")}-${String(logDateObj.getDate()).padStart(2, "0")}`;
        matchesDate = formattedLogDate === dateFilter;
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, searchTerm, actionFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, safeCurrentPage]);

  const showPagination = filteredLogs.length > PAGE_SIZE;

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  const handleExport = () => {
    if (!filteredLogs.length) return;
    const headers = ["TIMESTAMP", "USER/ENTITY", "ACTION", "TABLE", "AUDIT_ID"];
    const rows = filteredLogs.map((log) => [
      `"${formatDate(log.performed_at)}"`,
      `"${(log.performed_by || "Unknown").replace(/"/g, '""')}"`,
      `"${(log.action || "").replace(/"/g, '""')}"`,
      `"${(log.table_name || "").replace(/"/g, '""')}"`,
      `"${(log.audit_id || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = 2;
    let start = Math.max(1, safeCurrentPage - half);
    let end = Math.min(totalPages, safeCurrentPage + half);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, 5);
      else start = Math.max(1, end - 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, safeCurrentPage]);

  return (
    <>
      <PageHeader
        title="Audit Log History"
        subtitle="System-wide transparency of activities."
      />

      <TableContainer
        title="Live Activity Stream"
        headerRight={
          <>
            <TableSearchBar
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search user, action, ID..."
            />

            <div className="relative">
              <FilterButton
                onClick={() => setShowMoreFilters((p) => !p)}
                activeCount={
                  (actionFilter !== "All Actions" ? 1 : 0) + (dateFilter ? 1 : 0)
                }
              />

              {showMoreFilters && (
                <FilterPopover
                  onClear={() => {
                    setActionFilter("All Actions");
                    setDateFilter("");
                    setCurrentPage(1);
                  }}
                  onClose={() => setShowMoreFilters(false)}
                >
                  <FilterPopoverRow label="Action">
                    <FilterSelect
                      value={actionFilter}
                      onChange={(e) => {
                        setActionFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {ACTION_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o === "All Actions" ? o : String(o).toUpperCase()}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterPopoverRow>

                  <FilterPopoverRow label="Date">
                    <FilterDateInput
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </FilterPopoverRow>
                </FilterPopover>
              )}
            </div>

            <ExportButton onClick={handleExport} />
          </>
        }
        totalCount={filteredLogs.length}
        shownCount={paginatedLogs.length}
        recordLabel="entries"
        showPagination={showPagination}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onGoToPage={goToPage}
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
              <th
                className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap w-[220px] min-w-[220px]"
                style={{ paddingLeft: CONTENT_PADDING }}
              >
                TIMESTAMP
              </th>
              <th className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap min-w-[260px]">
                USER/ENTITY
              </th>
              <th className="px-5 py-2.5 text-center font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap w-[200px] min-w-[200px]">
                ACTION
              </th>
              <th
                className="px-5 py-2.5 pl-6 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap w-[180px] min-w-[180px]"
                style={{ paddingRight: CONTENT_PADDING }}
              >
                DETAILS
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  Loading audit logs...
                </td>
              </tr>
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  No audit logs match your search.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const actionColor =
                  ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT;

                return (
                  <tr
                    key={log.audit_id}
                    className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                  >
                    <td
                      className="px-5 py-2.5 font-inter font-medium text-gray-700 w-[220px] min-w-[220px] whitespace-nowrap"
                      style={{
                        paddingLeft: CONTENT_PADDING,
                        fontSize: "13px",
                      }}
                    >
                      {formatDate(log.performed_at)}
                    </td>
                    <td className="px-5 py-2.5 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={log.performed_by_image || defaultUser}
                          alt=""
                          className="flex-shrink-0 rounded-full object-cover"
                          style={{ width: "40px", height: "40px" }}
                          onError={(e) => {
                            e.currentTarget.src = defaultUser;
                          }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p
                            className="font-inter font-bold text-gray-900 leading-tight"
                            style={{ fontSize: "15px" }}
                          >
                            {log.performed_by || "System"}
                          </p>
                          <p
                            className="max-w-[220px] truncate font-inter font-medium text-gray-400 mt-0.5"
                            style={{ fontSize: "12px" }}
                          >
                            {log.performed_by_org || "System User"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap w-[200px] min-w-[200px] text-center">
                      <span
                        className="inline-flex items-center justify-center rounded-full px-5 py-2 font-inter font-semibold whitespace-nowrap w-[150px] text-center"
                        style={{
                          fontSize: "12.5px",
                          backgroundColor: actionColor.bg,
                          color: actionColor.text,
                        }}
                      >
                        {String(log.action).toUpperCase()}
                      </span>
                    </td>
                    <td
                      className="px-5 py-2.5 pl-6 whitespace-nowrap w-[180px] min-w-[180px]"
                      style={{ paddingRight: CONTENT_PADDING }}
                    >
                      <button
                        type="button"
                        onClick={() => onViewLog && onViewLog(log)}
                        className="inline-flex items-center gap-1.5 rounded bg-[#ffe100] font-inter font-bold text-gray-900 transition hover:bg-[#e6c900] active:scale-95 border border-[#d4a000]/50"
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        <Eye style={{ width: "13px", height: "13px" }} aria-hidden="true" />
                        VIEW DETAILS
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableContainer>
    </>
  );
}
