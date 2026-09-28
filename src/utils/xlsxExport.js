import * as XLSX from "xlsx";

/**
 * Formats a date value cleanly for spreadsheet display
 */
function formatDate(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

const UI_STATUS_MAP = {
  pending: "Process",
  under_review: "Process",
  approved: "Approved",
  rejected: "Returned",
  resubmission_required: "Returned",
  process: "Process",
  Process: "Process",
  Approved: "Approved",
  Returned: "Returned",
};

/**
 * Generates and downloads a multi-sheet .xlsx workbook for VISTA Staff Analytics
 *
 * @param {Object} statistics - Statistics payload from API / hook
 * @param {Array} submissions - Detailed submissions array (optional, for registry sheet)
 * @param {Object} options - Additional metadata (e.g. timeframe, generatedBy)
 */
export function exportAnalyticsToXlsx(statistics = {}, submissions = [], options = {}) {
  const wb = XLSX.utils.book_new();
  const total = statistics.total || 0;
  const statusCounts = statistics.status_counts || {};

  const processCount = (statusCounts.pending || 0) + (statusCounts.under_review || 0);
  const approvedCount = statusCounts.approved || 0;
  const returnedCount = (statusCounts.rejected || 0) + (statusCounts.resubmission_required || 0);

  // -------------------------------------------------------------
  // Sheet 1: Executive KPI Overview
  // -------------------------------------------------------------
  const summaryRows = [
    ["VISTA - Institutional Document Tracking System"],
    ["Staff Analytics & Performance Report"],
    [],
    ["Metric", "Value", "Notes / Context"],
    ["Report Generated At", new Date().toLocaleString(), "System export timestamp"],
    ["Report Filter / Timeframe", options.timeframe || "All Time", "Applied date filter"],
    ["Total Submissions", total, "Total documents submitted"],
    ["Process (Pending / Review)", processCount, "Currently in processing or under review"],
    ["Approved", approvedCount, "Successfully completed and approved"],
    ["Returned (Rejected / Resubmit)", returnedCount, "Returned for revisions or rejected"],
    ["Approval Rate", `${statistics.approval_rate ?? 0}%`, "Share of resolved submissions that were approved"],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 32 }, { wch: 22 }, { wch: 44 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

  // -------------------------------------------------------------
  // Sheet 2: Status & Category Breakdown
  // -------------------------------------------------------------
  const statusRows = [
    ["Status Category (Consolidated)", "Count", "Percentage"],
    ["Process", processCount, total ? `${Math.round((processCount / total) * 100)}%` : "0%"],
    ["Approved", approvedCount, total ? `${Math.round((approvedCount / total) * 100)}%` : "0%"],
    ["Returned", returnedCount, total ? `${Math.round((returnedCount / total) * 100)}%` : "0%"],
    [],
    ["Detailed Sub-Status", "Count", "Percentage"],
    ["Pending", statusCounts.pending || 0, total ? `${Math.round(((statusCounts.pending || 0) / total) * 100)}%` : "0%"],
    ["Under Review", statusCounts.under_review || 0, total ? `${Math.round(((statusCounts.under_review || 0) / total) * 100)}%` : "0%"],
    ["Approved", statusCounts.approved || 0, total ? `${Math.round(((statusCounts.approved || 0) / total) * 100)}%` : "0%"],
    ["Rejected", statusCounts.rejected || 0, total ? `${Math.round(((statusCounts.rejected || 0) / total) * 100)}%` : "0%"],
    ["Resubmission Required", statusCounts.resubmission_required || 0, total ? `${Math.round(((statusCounts.resubmission_required || 0) / total) * 100)}%` : "0%"],

    [],
    ["Category Breakdown", "Count", "Percentage"],
    ...(statistics.category_data || []).map((c) => [
      c.category,
      c.count,
      total ? `${Math.round((c.count / total) * 100)}%` : "0%",
    ]),
  ];
  const wsStatus = XLSX.utils.aoa_to_sheet(statusRows);
  wsStatus["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsStatus, "Status & Category");

  // -------------------------------------------------------------
  // Sheet 3: Organization Activity
  // -------------------------------------------------------------
  const orgRows = [
    ["Organization Name", "Acronym", "Submissions Count", "Activity Share"],
    ...(statistics.organization_data || []).map((o) => [
      o.org_name,
      o.org_acronym,
      o.count,
      total ? `${Math.round((o.count / total) * 100)}%` : "0%",
    ]),
  ];
  const wsOrg = XLSX.utils.aoa_to_sheet(orgRows);
  wsOrg["!cols"] = [{ wch: 36 }, { wch: 16 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsOrg, "Organizations");

  // -------------------------------------------------------------
  // Sheet 4: Document Type Distribution & Timeline
  // -------------------------------------------------------------
  const docTypeRows = [
    ["Document Type", "Submissions Count", "Share"],
    ...(statistics.doc_type_data || []).map((d) => [
      d.doc_type,
      d.count,
      total ? `${Math.round((d.count / total) * 100)}%` : "0%",
    ]),
    [],
    ["Monthly Volume Trends", "Submissions Count", ""],
    ...(statistics.monthly_trends || []).map((m) => [
      m.month,
      m.count,
      "",
    ]),
  ];
  const wsDocTypes = XLSX.utils.aoa_to_sheet(docTypeRows);
  wsDocTypes["!cols"] = [{ wch: 34 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsDocTypes, "Doc Types & Trends");

  // -------------------------------------------------------------
  // Sheet 5: Detailed Submissions Registry (if data supplied)
  // -------------------------------------------------------------
  if (Array.isArray(submissions) && submissions.length > 0) {
    const registryHeaders = [
      "Submission ID",
      "Document Title",
      "Academic Year",
      "Organization",
      "Category",
      "Document Type",
      "Applicant Name",
      "Applicant Email",
      "Submitted Date",
      "Status",
    ];
    const registryRows = submissions.map((s) => [
      `#${(s.submission_id || "").slice(0, 8)}`,
      s.title || "Untitled Document",
      s.academic_year || "N/A",
      s.org_name || "N/A",
      s.category_name || "N/A",
      s.doc_type_name || "N/A",
      s.submitted_by_name || "Unknown",
      s.submitted_by_email || "N/A",
      formatDate(s.submitted_at),
      UI_STATUS_MAP[s.status] || s.status || "N/A",
    ]);
    const wsRegistry = XLSX.utils.aoa_to_sheet([registryHeaders, ...registryRows]);
    wsRegistry["!cols"] = [
      { wch: 16 },
      { wch: 34 },
      { wch: 16 },
      { wch: 28 },
      { wch: 16 },
      { wch: 24 },
      { wch: 24 },
      { wch: 28 },
      { wch: 16 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsRegistry, "Submissions Registry");
  }

  // Trigger browser download
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `VISTA_Staff_Analytics_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
