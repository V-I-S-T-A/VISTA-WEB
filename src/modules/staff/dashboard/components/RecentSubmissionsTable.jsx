import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  ImageIcon,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import defaultUser from "../../../../assets/shared/default_user.jpg";

const PAGE_SIZE = 15;
const CONTENT_PADDING = "24px";

// Map frontend UI names to backend database statuses for filtering
const API_STATUS_MAP = {
  New: "pending",
  Reviewing: "under_review",
  Verified: "approved",
  Flagged: "rejected",
};

// Map backend database statuses to frontend UI names for display
const UI_STATUS_MAP = {
  pending: "New",
  under_review: "Reviewing",
  approved: "Verified",
  rejected: "Flagged",
  resubmission_required: "Resubmission Required",
};

const STATUS_CONFIG = {
  Reviewing: { dot: "#f59e0b", text: "#b45309" },
  New: { dot: "#3b82f6", text: "#1d4ed8" },
  Verified: { dot: "#22c55e", text: "#15803d" },
  Flagged: { dot: "#ef4444", text: "#b91c1c" },
  "Resubmission Required": { dot: "#7c3aed", text: "#6d28d9" },
};

function StatusDot({ status }) {
  const uiStatus = UI_STATUS_MAP[status] || status || "New";
  const config = STATUS_CONFIG[uiStatus] ?? { dot: "#9ca3af", text: "#6b7280" };

  return (
    <span
      className="inline-flex items-center gap-1.5 font-inter font-semibold"
      style={{ color: config.text, fontSize: "13px" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {uiStatus}
    </span>
  );
}

const STATUS_OPTIONS = [
  "All Status",
  "Reviewing",
  "New",
  "Verified",
  "Flagged",
];

const CATEGORY_OPTIONS = ["All Categories", "Off-Campus", "In-Campus"];

function downloadCsv(rows) {
  const headers = [
    "ID",
    "Document Title",
    "Applicant",
    "Email",
    "Category",
    "Date",
    "Status",
  ];
  const lines = rows.map((s) => {
    const uiStatus = UI_STATUS_MAP[s.status] || s.status;
    const dateStr = s.submitted_at
      ? new Date(s.submitted_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

    return [
      `#${s.submission_id.slice(0, 8)}`,
      `"${(s.title || "Untitled Document").replace(/"/g, '""')}"`,
      `"${(s.org_name || s.submitted_by_name || "Unknown").replace(/"/g, '""')}"`,
      s.submitted_by_email || "N/A",
      s.category_name || "N/A",
      dateStr,
      uiStatus,
    ].join(",");
  });

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `recent_submissions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function RecentSubmissionsTable({ onViewReview }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [filterOpen, setFilterOpen] = useState(false);

  const apiStatus =
    statusFilter === "All Status" ? "" : API_STATUS_MAP[statusFilter] || "";

  // Fetch recent 1-15 submissions from backend
  const { data, isLoading } = useSubmissions({
    page: 1,
    pageSize: PAGE_SIZE,
    search: searchTerm,
    status: apiStatus,
  });

  const submissions = data?.results ?? [];
  const totalCount = data?.count ?? 0;

  // Client-side category filtering if active
  const filteredSubmissions = useMemo(() => {
    if (categoryFilter === "All Categories") return submissions;
    return submissions.filter((s) => s.category_name?.includes(categoryFilter));
  }, [submissions, categoryFilter]);

  function handleViewReview(submission) {
    const formatted = {
      id: submission.submission_id,
      title: submission.title || "Untitled Document",
      site: submission.org_name || "Unknown Organization",
      contactEmail: submission.submitted_by_email
        ? `${submission.submitted_by_name || ""} (${submission.submitted_by_email})`.trim()
        : submission.submitted_by_name || "N/A",
      documentType: submission.doc_type_name || "N/A",
      submittedDate: submission.submitted_at
        ? new Date(submission.submitted_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
    };

    if (onViewReview) {
      onViewReview(formatted);
    } else {
      navigate("/staff/review-panel", {
        state: { selectedSubmission: formatted },
      });
    }
  }

  const activeFilterCount =
    (statusFilter !== "All Status" ? 1 : 0) +
    (categoryFilter !== "All Categories" ? 1 : 0);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Toolbar / Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 bg-[#1f5cae]"
        style={{
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: "14px",
          paddingBottom: "14px",
        }}
      >
        <h3 className="font-inter text-[16px] font-bold text-white">
          Recent Submissions
        </h3>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search submissions..."
              className="font-inter font-medium text-gray-700 placeholder-gray-400 outline-none rounded-md bg-white"
              style={{
                fontSize: "12.5px",
                padding: "7px 12px 7px 30px",
                width: "190px",
              }}
            />
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-md font-inter font-bold text-white transition hover:brightness-110 active:scale-95 cursor-pointer"
              style={{
                fontSize: "12.5px",
                padding: "7px 14px",
                backgroundColor: "#12345b",
              }}
            >
              <Filter
                style={{ width: "13px", height: "13px" }}
                aria-hidden="true"
              />
              Filter
              {activeFilterCount > 0 && (
                <span
                  className="inline-flex items-center justify-center font-bold"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "9999px",
                    backgroundColor: "#ffffff",
                    color: "#12345b",
                    fontSize: "10px",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                className="absolute right-0 top-full z-20"
                style={{
                  marginTop: "8px",
                  width: "288px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6ee",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 25px rgba(15, 42, 74, 0.12)",
                  padding: "16px",
                }}
              >
                <div style={{ marginBottom: "14px" }}>
                  <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full font-inter outline-none"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      padding: "8px 10px",
                      fontSize: "14px",
                    }}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label className="block font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full font-inter outline-none"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      padding: "8px 10px",
                      fontSize: "14px",
                    }}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("All Status");
                    setCategoryFilter("All Categories");
                    setSearchTerm("");
                  }}
                  className="w-full font-inter font-bold transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#4b5563",
                    padding: "8px 0",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e5e7eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f3f4f6")
                  }
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => downloadCsv(filteredSubmissions)}
            className="inline-flex items-center gap-1.5 rounded-md font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95 cursor-pointer"
            style={{
              fontSize: "12.5px",
              padding: "7px 14px",
              backgroundColor: "#ffc700",
            }}
          >
            <Download
              style={{ width: "13px", height: "13px" }}
              aria-hidden="true"
            />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-12 border-b border-gray-100 bg-[#f8f9fc]">
              {[
                "ID",
                "DOCUMENT / APPLICANT",
                "CATEGORY",
                "DATE",
                "STATUS",
                "ACTIONS",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-5 py-2 text-left font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${
                    heading === "ACTIONS" ? "pl-6 w-[170px]" : ""
                  }`}
                  style={
                    heading === "ID"
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-gray-400" />
                  Loading submissions...
                </td>
              </tr>
            ) : filteredSubmissions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  No submissions found.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr
                  key={submission.submission_id}
                  className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                >
                  {/* ID */}
                  <td
                    className="px-5 py-2.5 font-inter font-bold text-gray-900 whitespace-nowrap"
                    style={{ paddingLeft: CONTENT_PADDING, fontSize: "13px" }}
                  >
                    #{submission.submission_id.slice(0, 8)}
                  </td>

                  {/* Document / Applicant */}
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={submission.org_image_url || defaultUser}
                        alt=""
                        className="flex-shrink-0 rounded-full object-cover border border-gray-200"
                        style={{ width: "36px", height: "36px" }}
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                      <div className="min-w-0">
                        <p
                          className="font-inter font-bold text-gray-900 leading-tight"
                          style={{ fontSize: "13.5px" }}
                        >
                          {submission.title || "Untitled Document"}
                        </p>
                        <p
                          className="font-inter font-medium text-gray-400 leading-tight mt-0.5"
                          style={{ fontSize: "12px" }}
                        >
                          {submission.org_name ||
                            submission.submitted_by_name ||
                            "Unknown Applicant"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-2.5">
                    <span
                      className="inline-flex items-center justify-center rounded font-inter font-semibold bg-gray-100 text-gray-600 whitespace-nowrap"
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      {submission.category_name || "N/A"}
                    </span>
                  </td>

                  {/* Date */}
                  <td
                    className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
                    style={{ fontSize: "13px" }}
                  >
                    {submission.submitted_at
                      ? new Date(submission.submitted_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "N/A"}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-2.5 whitespace-nowrap">
                    <StatusDot status={submission.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-2.5 pl-6 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleViewReview(submission)}
                      className="inline-flex items-center gap-1.5 rounded font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95 whitespace-nowrap cursor-pointer"
                      style={{
                        fontSize: "12px",
                        padding: "6px 14px",
                        backgroundColor: "#ffc700",
                      }}
                    >
                      <ImageIcon
                        style={{ width: "13px", height: "13px" }}
                        aria-hidden="true"
                      />
                      VIEW &amp; REVIEW
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Showing 1-X of Y submissions and "View All Submissions" button */}
      <div
        className="flex items-center justify-between border-t border-gray-100 bg-white"
        style={{
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: "14px",
          paddingBottom: "14px",
        }}
      >
        <p className="font-inter text-[13px] font-medium text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {totalCount === 0 ? 0 : 1}–
            {Math.min(filteredSubmissions.length, PAGE_SIZE)}
          </span>{" "}
          of <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
          submissions
        </p>

        <button
          type="button"
          onClick={() => navigate("/staff/review-panel")}
          className="inline-flex items-center gap-2 rounded-lg font-inter font-bold text-white transition hover:brightness-110 active:scale-95 shadow-sm cursor-pointer"
          style={{
            backgroundColor: "#1f5cae",
            padding: "8px 18px",
            fontSize: "13px",
          }}
        >
          View All Submissions
          <ArrowRight style={{ width: "15px", height: "15px" }} />
        </button>
      </div>
    </section>
  );
}
