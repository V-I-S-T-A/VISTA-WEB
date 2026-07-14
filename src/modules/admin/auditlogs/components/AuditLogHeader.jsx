import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  ChevronDown,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import api from "../../../../lib/axios";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "30px";

// Matched exactly to Django model ACTION_CHOICES
const ACTION_COLORS = {
  create: { bg: "#dcfce7", text: "#166534" },
  update: { bg: "#fef3c7", text: "#92400e" },
  delete: { bg: "#fee2e2", text: "#991b1b" },
  login: { bg: "#cffafe", text: "#164e63" },
  logout: { bg: "#f3f4f6", text: "#4b5563" },
  status_change: { bg: "#e9d5ff", text: "#6b21a8" },
  DEFAULT: { bg: "#f3f4f6", text: "#4b5563" },
};

function FilterDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target))
        setIsOpen(false);
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="appearance-none bg-white font-inter font-semibold text-gray-700 outline-none cursor-pointer inline-flex items-center gap-6 hover:bg-gray-50 transition-colors whitespace-nowrap"
        style={{
          border: "1.5px solid #d1d5db",
          borderRadius: "7px",
          padding: "7px 11px",
          fontSize: "12px",
        }}
      >
        {value === "All Actions" ? value : String(value).toUpperCase()}
        <ChevronDown
          className="pointer-events-none h-4 w-4 flex-shrink-0 text-gray-500 transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-inter font-semibold transition-colors",
                  isSelected
                    ? "bg-[#eef2ff] text-[#1f5cae]"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
                style={{ fontSize: "12px" }}
              >
                {option === "All Actions"
                  ? option
                  : String(option).toUpperCase()}
                {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AuditLogHistory({ onViewLog }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const moreFiltersRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Match Django database choices
  const ACTION_OPTIONS = [
    "All Actions",
    "create",
    "update",
    "delete",
    "login",
    "logout",
    "status_change",
  ];

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/audit-logs/");
        // Safely extract from pagination if it exists
        setLogs(response.data.results || response.data);
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
      // Map to Django serializer fields
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
    const headers = ["TIMESTAMP", "USER/ENTITY", "ACTION", "TABLE", "AUDIT_ID"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          formatDate(log.performed_at),
          log.performed_by || "Unknown",
          log.action,
          log.table_name,
          log.audit_id,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
      <div
        className="flex items-start justify-between w-full"
        style={{ marginBottom: "14px" }}
      >
        <div>
          <h2
            className="font-inter font-bold text-[#142d55]"
            style={{ fontSize: "26px", lineHeight: 1.15 }}
          >
            Audit Log History
          </h2>
          <p
            className="font-inter text-gray-500 mt-0.5"
            style={{ fontSize: "13px" }}
          >
            System-wide transparency of activities.
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white mx-4 sm:mx-6 lg:mx-8 my-4">
        <div
          className="bg-[#1f5cae] flex items-center justify-between px-4 py-3"
          style={{ minHeight: "64px" }}
        >
          <h3
            className="font-inter text-[18px] font-bold text-white"
            style={{ paddingLeft: CONTENT_PADDING }}
          >
            Live Activity Stream
          </h3>
          <div
            className="flex items-center gap-3"
            style={{ paddingRight: "20px" }}
          >
            <div className="relative" style={{ width: "300px" }}>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                style={{ width: "16px", height: "16px" }}
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search user, action, ID..."
                className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none"
                style={{
                  height: "36px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "0 12px 0 40px",
                  fontSize: "13px",
                }}
              />
            </div>
            <FilterDropdown
              label="Filter by action"
              options={ACTION_OPTIONS}
              value={actionFilter}
              onChange={(v) => {
                setActionFilter(v);
                setCurrentPage(1);
              }}
            />
            <div className="relative" ref={moreFiltersRef}>
              <button
                type="button"
                onClick={() => setShowMoreFilters((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 font-inter font-semibold transition-colors whitespace-nowrap ${showMoreFilters || dateFilter ? "bg-[#eef2ff] text-[#1f5cae] border-[#1f5cae]" : "bg-white text-gray-700 hover:bg-gray-50 border-[#d1d5db]"}`}
                style={{
                  borderWidth: "1.5px",
                  borderStyle: "solid",
                  borderRadius: "7px",
                  padding: "7px 13px",
                  fontSize: "12px",
                }}
              >
                <SlidersHorizontal className="h-4 w-4" /> More Filters
                {dateFilter && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 ml-1"></div>
                )}
              </button>
              {showMoreFilters && (
                <div className="absolute right-0 top-full z-10 mt-1.5 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg p-4">
                  <h4 className="font-inter text-[13px] font-bold text-gray-800 mb-3">
                    Additional Filters
                  </h4>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Filter by Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white font-inter text-gray-700 outline-none cursor-pointer"
                      style={{
                        height: "34px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        padding: "0 10px",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDateFilter("");
                        setCurrentPage(1);
                      }}
                      className="text-xs font-inter font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMoreFilters(false)}
                      className="bg-[#1f5cae] text-white px-3 py-1.5 rounded-md text-xs font-inter font-semibold hover:bg-[#154685] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleExport}
              type="button"
              className="inline-flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] font-inter font-semibold text-gray-900 transition-colors whitespace-nowrap"
              style={{
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
              }}
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
                {["TIMESTAMP", "USER/ENTITY", "ACTION", "ID/REFERENCE"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                      style={
                        heading === "TIMESTAMP"
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
                  const userName = log.performed_by || "System";
                  return (
                    <tr
                      key={log.audit_id}
                      onClick={() => onViewLog && onViewLog(log)}
                      className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff] cursor-pointer"
                    >
                      <td
                        className="px-5 py-2.5 font-inter font-medium text-gray-700"
                        style={{
                          paddingLeft: CONTENT_PADDING,
                          fontSize: "13px",
                        }}
                      >
                        {formatDate(log.performed_at)}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="min-w-0">
                          <p
                            className="font-inter font-bold text-gray-900 leading-tight"
                            style={{ fontSize: "15px" }}
                          >
                            {userName}
                          </p>
                          <p
                            className="font-inter font-medium text-gray-400 mt-0.5"
                            style={{ fontSize: "12px" }}
                          >
                            System User
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className="inline-flex items-center justify-center rounded-full px-8 py-3 font-inter font-semibold whitespace-nowrap"
                          style={{
                            fontSize: "13px",
                            backgroundColor: actionColor.bg,
                            color: actionColor.text,
                            minWidth: "200px",
                            minHeight: "23px",
                          }}
                        >
                          {String(log.action).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="min-w-0">
                          <p
                            className="font-inter font-semibold text-gray-700 truncate max-w-[200px]"
                            style={{ fontSize: "13px" }}
                            title={log.audit_id}
                          >
                            {log.audit_id}
                          </p>
                          <p
                            className="font-inter font-medium text-gray-400 mt-0.5"
                            style={{ fontSize: "11px" }}
                          >
                            Table: {log.table_name}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
            <span className="font-semibold text-gray-700">
              {paginatedLogs.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {filteredLogs.length}
            </span>{" "}
            entries
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
                    borderColor:
                      page === safeCurrentPage ? "#002b5c" : "#d1d5db",
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
    </>
  );
}
