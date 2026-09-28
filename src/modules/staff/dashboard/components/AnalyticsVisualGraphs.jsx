import { useState, useMemo, useRef, useEffect } from "react";
import {
  Download,
  Loader2,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useSubmissionStatistics } from "../../../../hooks/useSubmissions";
import { submissionService } from "../../../../services/submissionService";
import { exportAnalyticsToXlsx } from "../../../../utils/xlsxExport";

const TIME_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "Last 6 Months", value: "180d" },
  { label: "This Year", value: "year" },
];

const CATEGORY_OPTIONS = ["All Categories", "In-Campus", "Off-Campus"];

const TIMELINE_INTERVALS = [
  { key: "weeks", label: "Weeks", unitLabel: "week", unitPlural: "weeks" },
  { key: "months", label: "Months", unitLabel: "month", unitPlural: "months" },
  { key: "years", label: "Years", unitLabel: "year", unitPlural: "years" },
];

const STATUS_CATEGORY_OPTIONS = [
  { key: "all", label: "All" },
  { key: "in_campus", label: "In-Campus" },
  { key: "off_campus", label: "Off-Campus" },
];

const DOC_TYPE_INTERVALS = [
  { key: "weeks", label: "Weeks" },
  { key: "months", label: "Months" },
  { key: "years", label: "Years" },
];

const TIMELINE_BAR_COLORS = [
  "#1f5cae", // VISTA Deep Blue
  "#f59e0b", // VISTA Amber / Gold
  "#22c55e", // VISTA Emerald Green
  "#0284c7", // VISTA Sky Blue
  "#8b5cf6", // VISTA Purple
  "#ef4444", // VISTA Coral Red
  "#3b82f6", // VISTA Royal Blue
  "#10b981", // VISTA Teal
  "#f97316", // VISTA Sunset Orange
  "#6366f1", // VISTA Indigo
];

// Consolidated 3 statuses: Process, Approved, Returned
const STATUS_CONFIG_3 = [
  { key: "process", label: "Process", color: "#2563eb" },
  { key: "approved", label: "Approved", color: "#22c55e" },
  { key: "returned", label: "Returned", color: "#ef4444" },
];

function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const docFullName = data.payload?.fullName;
    const title = docFullName || label || data.name;
    const barColor = data.payload?.color || data.payload?.fill || data.color || "#1f5cae";
    const shareText = data.payload?.sharePct !== undefined ? ` (${data.payload.sharePct}%)` : "";

    return (
      <div
        className="font-inter"
        style={{
          padding: "8px 14px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
        }}
      >
        <p style={{ fontSize: "12px", fontWeight: "600", color: "#1f2937" }}>
          {title}
        </p>
        <p style={{ fontSize: "13px", fontWeight: "700", color: barColor, marginTop: "2px" }}>
          {data.value} {data.unit || (data.value === 1 ? "submission" : "submissions")}{shareText}
        </p>
      </div>
    );
  }
  return null;
}



export default function AnalyticsVisualGraphs({
  selectedStatus,
  onStatusSelect,
} = {}) {
  const [timeRange, setTimeRange] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const timeRangeRef = useRef(null);
  const categoryRef = useRef(null);
  const exportRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
      if (timeRangeRef.current && !timeRangeRef.current.contains(event.target)) {
        setIsTimeRangeOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute date range query params
  const { dateFrom, dateTo } = useMemo(() => {
    if (timeRange === "all") return { dateFrom: "", dateTo: "" };
    const now = new Date();
    const to = now.toISOString().split("T")[0];
    const fromDate = new Date();

    if (timeRange === "30d") fromDate.setDate(now.getDate() - 30);
    else if (timeRange === "90d") fromDate.setDate(now.getDate() - 90);
    else if (timeRange === "180d") fromDate.setDate(now.getDate() - 180);
    else if (timeRange === "year") fromDate.setMonth(0, 1);

    return {
      dateFrom: fromDate.toISOString().split("T")[0],
      dateTo: to,
    };
  }, [timeRange]);

  const { data: stats, isLoading } = useSubmissionStatistics({
    dateFrom,
    dateTo,
    category: categoryFilter,
  });

  const [statusCategoryFilter, setStatusCategoryFilter] = useState("all");
  const [docTypeInterval, setDocTypeInterval] = useState("months");

  const total = stats?.total ?? 0;

  // Category-specific status counts for Submission Status card
  const activeStatusCounts = useMemo(() => {
    if (stats?.status_by_category && stats.status_by_category[statusCategoryFilter]) {
      return stats.status_by_category[statusCategoryFilter];
    }
    return stats?.status_counts ?? {};
  }, [stats, statusCategoryFilter]);

  // Consolidated 3-status counts
  const processCount = (activeStatusCounts.pending || 0) + (activeStatusCounts.under_review || 0);
  const approvedCount = activeStatusCounts.approved || 0;
  const returnedCount = (activeStatusCounts.rejected || 0) + (activeStatusCounts.resubmission_required || 0);
  const statusCardTotal = processCount + approvedCount + returnedCount;

  const statusSummary = {
    process: processCount,
    approved: approvedCount,
    returned: returnedCount,
  };

  // Donut chart data with exactly 3 consolidated statuses
  const statusData = useMemo(() => {
    return STATUS_CONFIG_3.map(({ key, label, color }) => ({
      key,
      name: label,
      value: statusSummary[key] || 0,
      color,
    })).filter((item) => item.value > 0);
  }, [processCount, approvedCount, returnedCount]);

  // Document types breakdown by selected interval (Weeks | Months | Years)
  const activeDocTypeRaw = useMemo(() => {
    if (stats?.doc_type_trends && stats.doc_type_trends[docTypeInterval]) {
      return stats.doc_type_trends[docTypeInterval];
    }
    return stats?.doc_type_data ?? [];
  }, [stats, docTypeInterval]);

  const docTypeBarData = useMemo(() => {
    const rawTotal = activeDocTypeRaw.reduce((sum, d) => sum + (d.count || 0), 0);
    return activeDocTypeRaw.map((doc, idx) => {
      let shortName = doc.doc_type || "Other";
      const match = shortName.match(/\(([^)]+)\)/);
      if (match) {
        shortName = match[1];
      } else if (shortName.length > 15) {
        shortName = shortName.slice(0, 13) + "…";
      }

      const sharePct = rawTotal > 0 ? Math.round((doc.count / rawTotal) * 100) : 0;
      const colors = ["#1f5cae", "#f59e0b", "#22c55e", "#0284c7", "#8b5cf6", "#ef4444"];
      const color = colors[idx % colors.length];

      return {
        fullName: doc.doc_type,
        shortName,
        name: shortName,
        count: doc.count,
        sharePct,
        color,
      };
    });
  }, [activeDocTypeRaw]);



  // Timeline trends state (Weeks, Months, Years)
  const [timelineInterval, setTimelineInterval] = useState("months");

  const activeIntervalConfig = useMemo(() => {
    return TIMELINE_INTERVALS.find((i) => i.key === timelineInterval) || TIMELINE_INTERVALS[1];
  }, [timelineInterval]);

  const timelineData = useMemo(() => {
    if (stats?.trends && stats.trends[timelineInterval]) {
      return stats.trends[timelineInterval];
    }
    // Fallback if trends is not yet populated
    return (stats?.monthly_trends ?? []).map((d) => ({
      label: d.month,
      count: d.count,
    }));
  }, [stats, timelineInterval]);

  // Top organizations
  const organizationData = (stats?.organization_data ?? []).slice(0, 5).map((org) => ({
    name: org.org_acronym || (org.org_name ? org.org_name.slice(0, 14) : "Unknown"),
    fullName: org.org_name,
    count: org.count,
  }));

  // Export handlers (includes Academic Year in exports)
  async function handleExportXlsx() {
    try {
      setIsExporting(true);
      const rawSubmissions = await submissionService.getExportData({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const selectedTimeLabel = TIME_RANGES.find((t) => t.value === timeRange)?.label || "Custom";
      exportAnalyticsToXlsx(stats || {}, rawSubmissions || [], {
        timeframe: `${selectedTimeLabel} (${categoryFilter})`,
      });
    } catch (error) {
      console.error("Failed to export Excel analytics:", error);
      alert("Unable to generate Excel report. Please try again.");
    } finally {
      setIsExporting(false);
      setIsExportOpen(false);
    }
  }

  async function handleExportPdf() {
    try {
      setIsExporting(true);
      const response = await submissionService.exportList({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submissions_analytics_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export PDF analytics:", error);
      alert("Unable to generate PDF report. Please try again.");
    } finally {
      setIsExporting(false);
      setIsExportOpen(false);
    }
  }

  return (
    <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm mb-5">
      {/* ── Standard Blue Header Bar matching VISTA Toolbar ── */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap bg-[#1f5cae]"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "14px",
          paddingBottom: "14px",
        }}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-inter text-[16px] font-bold text-white">
            Submission Analytics
          </h3>
          {stats && (
            <span
              className="hidden sm:inline-flex items-center font-inter text-[12px] font-semibold text-white/90 bg-white/15 rounded-full"
              style={{ padding: "2px 10px" }}
            >
              {stats.approval_rate ?? 0}% Approval Rate
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Time Range Custom Dropdown */}
          <div className="relative" ref={timeRangeRef}>
            <button
              type="button"
              onClick={() => {
                setIsTimeRangeOpen((prev) => !prev);
                setIsCategoryOpen(false);
                setIsExportOpen(false);
              }}
              className="inline-flex items-center justify-between gap-2 font-inter font-semibold text-gray-700 bg-white transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              style={{
                borderRadius: "6px",
                padding: "7px 14px",
                fontSize: "12.5px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                minWidth: "130px",
              }}
            >
              <span>{TIME_RANGES.find((r) => r.value === timeRange)?.label || "All Time"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-150 ${
                  isTimeRangeOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isTimeRangeOpen && (
              <div
                className="absolute left-0 top-full z-30"
                style={{
                  marginTop: "6px",
                  width: "175px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6ee",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "5px",
                }}
              >
                <div className="px-2.5 py-1 font-inter text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                  Timeframe
                </div>
                {TIME_RANGES.map((r) => {
                  const isSelected = timeRange === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setTimeRange(r.value);
                        setIsTimeRangeOpen(false);
                      }}
                      className={`flex items-center justify-between w-full text-left font-inter rounded-lg px-2.5 py-2 text-[12.5px] transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-[#1f5cae] font-bold"
                          : "text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] font-medium"
                      }`}
                    >
                      <span>{r.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#1f5cae]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Custom Dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              type="button"
              onClick={() => {
                setIsCategoryOpen((prev) => !prev);
                setIsTimeRangeOpen(false);
                setIsExportOpen(false);
              }}
              className="inline-flex items-center justify-between gap-2 font-inter font-semibold text-gray-700 bg-white transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              style={{
                borderRadius: "6px",
                padding: "7px 14px",
                fontSize: "12.5px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                minWidth: "140px",
              }}
            >
              <span>{categoryFilter}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-150 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isCategoryOpen && (
              <div
                className="absolute left-0 top-full z-30"
                style={{
                  marginTop: "6px",
                  width: "175px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6ee",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "5px",
                }}
              >
                <div className="px-2.5 py-1 font-inter text-[10.5px] font-bold uppercase tracking-wider text-gray-400">
                  Category
                </div>
                {CATEGORY_OPTIONS.map((c) => {
                  const isSelected = categoryFilter === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(c);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center justify-between w-full text-left font-inter rounded-lg px-2.5 py-2 text-[12.5px] transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-[#1f5cae] font-bold"
                          : "text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] font-medium"
                      }`}
                    >
                      <span>{c}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#1f5cae]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Dropdown Button */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => {
                setIsExportOpen((prev) => !prev);
                setIsTimeRangeOpen(false);
                setIsCategoryOpen(false);
              }}
              disabled={isExporting || isLoading}
              className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95 cursor-pointer disabled:opacity-60"
              style={{
                borderRadius: "6px",
                backgroundColor: "#ffc700",
                padding: "7px 14px",
                fontSize: "12.5px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isExporting ? "Exporting..." : "Export"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  isExportOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isExportOpen && (
              <div
                className="absolute right-0 top-full z-30"
                style={{
                  marginTop: "8px",
                  width: "210px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6ee",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "6px",
                }}
              >
                <div className="px-2.5 py-1.5 font-inter text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Export As
                </div>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex items-center gap-2.5 w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] transition-colors rounded-lg px-2.5 py-2 text-[12.5px] cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span>Export as PDF</span>
                    <span className="text-[10px] text-gray-400 font-normal">.pdf report</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleExportXlsx}
                  className="flex items-center gap-2.5 w-full text-left font-inter font-semibold text-gray-700 hover:bg-[#f5f7fb] hover:text-[#142d55] transition-colors rounded-lg px-2.5 py-2 text-[12.5px] cursor-pointer mt-0.5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-col">
                    <span>Export as Excel</span>
                    <span className="text-[10px] text-gray-400 font-normal">.xlsx spreadsheet</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Card Body matching the approved single container ── */}
      <div style={{ padding: "24px 28px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: "28px" }}>
          
          {/* 1. Submission Status Donut Chart (Top Left) - 3 Consolidated Statuses */}
          <div className="flex flex-col justify-between">
            <div style={{ marginBottom: "14px" }}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-inter text-[15px] font-bold text-[#142d55]">
                  Submission Status
                </h4>

                {/* Category Filter Buttons: All | In-Campus | Off-Campus */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "3px",
                    gap: "4px",
                  }}
                >
                  {STATUS_CATEGORY_OPTIONS.map((item) => {
                    const isSelected = statusCategoryFilter === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setStatusCategoryFilter(item.key)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          backgroundColor: isSelected ? "#1f5cae" : "transparent",
                          color: isSelected ? "#ffffff" : "#64748b",
                          boxShadow: isSelected ? "0 1px 3px rgba(31, 92, 174, 0.25)" : "none",
                          lineHeight: "1.3",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="font-inter text-[12px] text-gray-500">
                Segmented share of current submissions by state
              </p>
            </div>

            <div className="h-[210px] w-full relative flex items-center justify-center">
              {statusCardTotal === 0 ? (
                <p className="font-inter text-[12.5px] text-gray-400">
                  No submissions found for selected category
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={3}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={2}
                          className="cursor-pointer transition-opacity hover:opacity-85"
                          onClick={() => onStatusSelect && onStatusSelect(entry.name)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Elevated Center Circular Island */}
              {statusCardTotal > 0 && (
                <div
                  className="pointer-events-none absolute flex flex-col items-center justify-center rounded-full bg-white border border-gray-100"
                  style={{
                    width: "82px",
                    height: "82px",
                    boxShadow: "0 4px 14px rgba(15, 42, 74, 0.08)",
                  }}
                >
                  <span className="font-inter text-[22px] font-extrabold text-[#142d55] leading-none">
                    {statusCardTotal}
                  </span>
                  <span className="font-inter text-[9.5px] uppercase font-bold text-gray-400 mt-1 tracking-wider">
                    TOTAL
                  </span>
                </div>
              )}
            </div>

            {/* Status Pills: 3 Statuses (Process, Approved, Returned) */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 mt-2">
              {STATUS_CONFIG_3.map(({ key, label, color }) => {
                const count = statusSummary[key] || 0;
                const isSelected = selectedStatus === label;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onStatusSelect && onStatusSelect(label)}
                    className={`flex items-center justify-between text-[11.5px] font-inter px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20"
                        : "border-gray-100 bg-gray-50/60 hover:bg-gray-100/80 hover:border-gray-200"
                    }`}
                    title={`Click to filter by ${label}`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-gray-700 font-semibold truncate">{label}</span>
                    </div>
                    <span className="font-extrabold text-gray-900 ml-1">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Submissions by Document Type (Top Right) - Column Bar Graph */}
          <div className="flex flex-col justify-between">
            <div style={{ marginBottom: "14px" }}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-inter text-[15px] font-bold text-[#142d55]">
                  Submissions by Document Type
                </h4>

                {/* Interval Buttons: Weeks | Months | Years */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "3px",
                    gap: "4px",
                  }}
                >
                  {DOC_TYPE_INTERVALS.map((item) => {
                    const isSelected = docTypeInterval === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setDocTypeInterval(item.key)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          backgroundColor: isSelected ? "#1f5cae" : "transparent",
                          color: isSelected ? "#ffffff" : "#64748b",
                          boxShadow: isSelected ? "0 1px 3px rgba(31, 92, 174, 0.25)" : "none",
                          lineHeight: "1.3",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="font-inter text-[12px] text-gray-500">
                {docTypeInterval === "weeks" && "Recent weekly volume distribution across institutional document categories"}
                {docTypeInterval === "months" && "Monthly volume distribution across institutional document categories"}
                {docTypeInterval === "years" && "All-time volume distribution across institutional document categories"}
              </p>
            </div>

            {/* Vertical Bar Graph with system colors */}
            <div className="h-[200px] w-full">
              {docTypeBarData.length === 0 ? (
                <div className="h-full flex items-center justify-center font-inter text-[12.5px] text-gray-400">
                  No document type records found
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={docTypeBarData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Submissions"
                      barSize={docTypeBarData.length <= 2 ? 38 : docTypeBarData.length <= 4 ? 30 : 22}
                      radius={[6, 6, 0, 0]}
                    >
                      {docTypeBarData.map((entry, index) => (
                        <Cell
                          key={`doctype-bar-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Highlights footer */}
            <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between text-[11.5px] font-inter text-gray-500">
              <span>{docTypeBarData.length} document {docTypeBarData.length === 1 ? "category" : "categories"} recorded</span>
              <span className="text-[#1f5cae] font-semibold">Active Classification</span>
            </div>
          </div>

          {/* 3. Capsule Column Bar Chart (Bottom Left) - Weeks, Months, Years */}
          <div className="flex flex-col justify-between pt-5 border-t border-gray-100">
            <div style={{ marginBottom: "14px" }}>
              <div className="flex items-center justify-between">
                <h4 className="font-inter text-[15px] font-bold text-[#142d55]">
                  Submission Intake Timeline
                </h4>

                {/* Interval Buttons: Weeks | Months | Years - Matching system styles */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "3px",
                    gap: "4px",
                  }}
                >
                  {TIMELINE_INTERVALS.map((item) => {
                    const isSelected = timelineInterval === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTimelineInterval(item.key)}
                        style={{
                          padding: "4px 14px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          backgroundColor: isSelected ? "#1f5cae" : "transparent",
                          color: isSelected ? "#ffffff" : "#64748b",
                          boxShadow: isSelected ? "0 1px 3px rgba(31, 92, 174, 0.25)" : "none",
                          lineHeight: "1.3",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="font-inter text-[12px] text-gray-500">
                {timelineInterval === "weeks" && "Weekly submission intake volume and velocity"}
                {timelineInterval === "months" && "Temporal volume trends with capsule-style intake columns"}
                {timelineInterval === "years" && "Multi-year institutional intake volume comparisons"}
              </p>
            </div>

            <div className="h-[200px] w-full">
              {timelineData.length === 0 ? (
                <div className="h-full flex items-center justify-center font-inter text-[12.5px] text-gray-400">
                  No {timelineInterval} activity recorded
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timelineData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar
                      dataKey="count"
                      name="Submissions"
                      barSize={timelineData.length <= 2 ? 38 : timelineData.length <= 4 ? 30 : timelineData.length <= 8 ? 22 : 16}
                      radius={[6, 6, 0, 0]}
                    >
                      {timelineData.map((entry, index) => (
                        <Cell
                          key={`timeline-cell-${index}`}
                          fill={TIMELINE_BAR_COLORS[index % TIMELINE_BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>



            <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between text-[11.5px] font-inter text-gray-500">
              <span>
                Peak: {timelineData.length ? Math.max(...timelineData.map((d) => d.count)) : 0} docs/{activeIntervalConfig.unitLabel}
              </span>
              <span className="text-[#1f5cae] font-semibold">
                {timelineData.length} recorded {activeIntervalConfig.unitPlural}
              </span>
            </div>
          </div>

          {/* 4. Horizontal Capsule Progress Ranking (Bottom Right) */}
          <div className="flex flex-col justify-between pt-5 border-t border-gray-100">
            <div style={{ marginBottom: "14px" }}>
              <div className="flex items-center justify-between">
                <h4 className="font-inter text-[15px] font-bold text-[#142d55]">
                  Active Student Organizations
                </h4>
                <span className="font-inter text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Rankings
                </span>
              </div>
              <p className="font-inter text-[12px] text-gray-500">
                Submission volume share by student councils and societies
              </p>
            </div>

            {/* Custom Horizontal Capsule Bars */}
            <div className="h-[200px] w-full flex flex-col justify-around py-1">
              {organizationData.length === 0 ? (
                <div className="h-full flex items-center justify-center font-inter text-[12.5px] text-gray-400">
                  No organization submissions recorded
                </div>
              ) : (
                organizationData.map((org) => {
                  const maxCount = Math.max(...organizationData.map((o) => o.count), 1);
                  const pct = Math.round((org.count / maxCount) * 100);

                  return (
                    <div key={org.name} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[12px] font-inter">
                        <span className="font-bold text-gray-800 truncate" title={org.fullName}>
                          {org.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-gray-400">
                            {org.count} {org.count === 1 ? "doc" : "docs"}
                          </span>
                          <span className="text-[10.5px] font-bold text-[#1f5cae] bg-blue-50 px-1.5 py-0.2 rounded">
                            {total ? Math.round((org.count / total) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1f5cae] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between text-[11.5px] font-inter text-gray-500">
              <span>Top {organizationData.length} contributing bodies</span>
              <span className="text-gray-400">Updated in real-time</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
