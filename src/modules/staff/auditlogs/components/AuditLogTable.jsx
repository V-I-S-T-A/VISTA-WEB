import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  ChevronDown,
  Check,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import {
  MOCK_AUDIT_LOGS,
  PAGE_SIZE,
  CONTENT_PADDING,
  ACTION_COLORS,
} from "./auditLogData";
import AuditLogDetails from "./AuditLogDetails";

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
}

export default function AuditLogHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [userTypeFilter, setUserTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null); // null = list view

  const ACTION_OPTIONS = [
    "All Actions",
    "USER_CREATION",
    "USER_DELETION",
    "SUBMISSION_APPROVED",
    "REVISION",
    "PENDING",
    "DOCUMENT_UPLOADED",
    "SYSTEM_CONFIG_CHANGED",
    "LOGIN",
    "BACKUP_COMPLETED",
  ];

  const USER_TYPE_OPTIONS = [
    "All Types",
    "Admin",
    "Staff",
    "Student",
    "Faculty",
    "OSA Staff",
    "Student Organization",
  ];

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return MOCK_AUDIT_LOGS.filter((log) => {
      const matchesSearch =
        !query ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.reference.toLowerCase().includes(query);
      const matchesAction =
        actionFilter === "All Actions" || log.action === actionFilter;
      const matchesUserType =
        userTypeFilter === "All Types" || log.userType === userTypeFilter;
      return matchesSearch && matchesAction && matchesUserType;
    });
  }, [searchTerm, actionFilter, userTypeFilter]);

  // Pagination logic
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

  // Export handler
  const handleExport = () => {
    const headers = ["TIMESTAMP", "USER/ENTITY", "ACTION", "ID/REFERENCE"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [log.timestamp, log.user, log.action, log.reference].join(","),
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

  // ---- Detail view ----
  if (selectedLog) {
    return (
      <AuditLogDetails log={selectedLog} onBack={() => setSelectedLog(null)} />
    );
  }

  // ---- List view ----
  return (
    <>
      {/* Table shell */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white mx-4 sm:mx-6 lg:mx-8 my-4">
        {/* Section header with controls */}
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
            {/* Search bar */}
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
                placeholder="Search user/ activity..."
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

            {/* Action filter dropdown */}
            <FilterDropdown
              label="Filter by action"
              options={ACTION_OPTIONS}
              value={actionFilter}
              onChange={(v) => {
                setActionFilter(v);
                setCurrentPage(1);
              }}
            />

            {/* User type filter dropdown */}
            <FilterDropdown
              label="Filter by user type"
              options={USER_TYPE_OPTIONS}
              value={userTypeFilter}
              onChange={(v) => {
                setUserTypeFilter(v);
                setCurrentPage(1);
              }}
            />

            {/* More Filters button */}
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

            {/* Export button */}
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
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
                {[
                  "TIMESTAMP",
                  "USER/ENTITY",
                  "ACTION",
                  "ID/REFERENCE",
                  "ACTIONS",
                ].map((heading) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                  >
                    No audit logs match your search.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const actionColor =
                    ACTION_COLORS[log.action] ||
                    ACTION_COLORS.SYSTEM_CONFIG_CHANGED;
                  return (
                    <tr
                      key={log.id}
                      className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                    >
                      <td
                        className="px-5 py-2.5 font-inter font-medium text-gray-700"
                        style={{
                          paddingLeft: CONTENT_PADDING,
                          fontSize: "13px",
                        }}
                      >
                        {log.timestamp}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="min-w-0">
                          <p
                            className="font-inter font-bold text-gray-900 leading-tight"
                            style={{ fontSize: "15px" }}
                          >
                            {log.user}
                          </p>
                          <p
                            className="font-inter font-medium text-gray-400 mt-0.5"
                            style={{ fontSize: "12px" }}
                          >
                            {log.userType}
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
                          {log.action}
                        </span>
                      </td>
                      <td
                        className="px-5 py-2.5 font-inter font-semibold text-gray-700"
                        style={{ fontSize: "13px" }}
                      >
                        {log.reference}
                      </td>
                      <td className="px-5 py-2.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] font-inter font-bold text-gray-900 transition-colors rounded-full whitespace-nowrap"
                          style={{
                            fontSize: "12px",
                            padding: "8px 16px",
                          }}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          VIEW &amp; REVIEW
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
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
