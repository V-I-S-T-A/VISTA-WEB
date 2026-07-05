import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "24px";

// Static placeholder data — swap for real API data later
const now = new Date();
function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}

const STATIC_SUBMISSIONS = [
  {
    id: "V-9082",
    applicant: "SITE: Hackathon Even.",
    email: "site.ustp@example.com",
    category: "Inbound",
    submitted_at: daysAgo(1),
    status: "Reviewing",
    title: "Annual Activity Proposal 2024",
    documentType: "Budgetary/Activity Proposal",
  },
  {
    id: "V-9082",
    applicant: "SITE: Hackathon Even.",
    email: "site.ustp@example.com",
    category: "Inbound",
    submitted_at: daysAgo(1),
    status: "New",
    title: "Annual Activity Proposal 2024",
    documentType: "Budgetary/Activity Proposal",
  },
  {
    id: "V-9082",
    applicant: "SITE: Hackathon Even.",
    email: "site.ustp@example.com",
    category: "Outbound",
    submitted_at: daysAgo(2),
    status: "Verified",
    title: "Annual Activity Proposal 2024",
    documentType: "Budgetary/Activity Proposal",
  },
  {
    id: "V-9082",
    applicant: "SITE: Hackathon Even.",
    email: "site.ustp@example.com",
    category: "Outbound",
    submitted_at: daysAgo(2),
    status: "Reviewing",
    title: "Annual Activity Proposal 2024",
    documentType: "Budgetary/Activity Proposal",
  },
  {
    id: "V-9082",
    applicant: "SITE: Hackathon Even.",
    email: "site.ustp@example.com",
    category: "Outbound",
    submitted_at: daysAgo(3),
    status: "Flagged",
    title: "Annual Activity Proposal 2024",
    documentType: "Budgetary/Activity Proposal",
  },
  {
    id: "V-9083",
    applicant: "SITE: Orientation Day",
    email: "orient.ustp@example.com",
    category: "Inbound",
    submitted_at: daysAgo(4),
    status: "New",
    title: "Freshman Orientation Plan",
    documentType: "Event Proposal",
  },
  {
    id: "V-9084",
    applicant: "SITE: Sports Fest Fund",
    email: "sports.ustp@example.com",
    category: "Outbound",
    submitted_at: daysAgo(5),
    status: "Verified",
    title: "Sports Fest Liquidation",
    documentType: "Liquidation Report",
  },
];

const TOTAL_SUBMISSIONS = 345;

const STATUS_CONFIG = {
  Reviewing: { dot: "#f59e0b", text: "#b45309" },
  New: { dot: "#3b82f6", text: "#1d4ed8" },
  Verified: { dot: "#22c55e", text: "#15803d" },
  Flagged: { dot: "#ef4444", text: "#b91c1c" },
};

function StatusDot({ status }) {
  const config = STATUS_CONFIG[status] ?? { dot: "#9ca3af", text: "#6b7280" };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-inter font-semibold"
      style={{ color: config.text, fontSize: "13px" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {status}
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
const CATEGORY_OPTIONS = ["All Categories", "Inbound", "Outbound"];

function downloadCsv(rows) {
  const headers = ["ID", "Applicant", "Email", "Category", "Date", "Status"];
  const lines = rows.map((s) =>
    [
      `#${s.id}`,
      s.applicant,
      s.email,
      s.category,
      s.submitted_at.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      s.status,
    ].join(","),
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "submissions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function SystemSubmissionsPanel({ onViewReview }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    return STATIC_SUBMISSIONS.filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.applicant.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All Status" || s.status === statusFilter;
      const matchCategory =
        categoryFilter === "All Categories" || s.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [searchTerm, statusFilter, categoryFilter]);

  const totalPages = 3; // static, mirrors "Showing 1-100 of 345 submissions"
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginated = filtered.slice(0, PAGE_SIZE);

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  return (
    <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
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
          System Submissions
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search submissions..."
              className="font-inter font-medium text-gray-700 placeholder-gray-400 outline-none rounded-md bg-white"
              style={{
                fontSize: "12.5px",
                padding: "7px 12px 7px 30px",
                width: "190px",
              }}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-md font-inter font-bold text-white transition hover:brightness-110 active:scale-95"
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
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full z-10 mt-1.5 w-48 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                <label
                  className="font-inter font-bold uppercase text-gray-400"
                  style={{ fontSize: "10.5px" }}
                >
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="mb-2 mt-1 w-full rounded-md border border-gray-200 font-inter font-semibold text-gray-700 outline-none"
                  style={{ fontSize: "12px", padding: "6px 8px" }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>

                <label
                  className="font-inter font-bold uppercase text-gray-400"
                  style={{ fontSize: "10.5px" }}
                >
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="mt-1 w-full rounded-md border border-gray-200 font-inter font-semibold text-gray-700 outline-none"
                  style={{ fontSize: "12px", padding: "6px 8px" }}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => downloadCsv(filtered)}
            className="inline-flex items-center gap-1.5 rounded-md font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
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
              {["ID", "APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-5 py-2 text-left font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500"
                    style={
                      heading === "ID"
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
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-inter text-sm text-gray-500"
                >
                  No submissions found.
                </td>
              </tr>
            )}
            {paginated.map((submission, idx) => (
              <tr
                key={`${submission.id}-${idx}`}
                className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
              >
                {/* ID */}
                <td
                  className="px-5 py-2.5 font-inter font-bold text-gray-900 whitespace-nowrap"
                  style={{ paddingLeft: CONTENT_PADDING, fontSize: "13px" }}
                >
                  #{submission.id}
                </td>

                {/* Applicant */}
                <td className="px-5 py-2.5">
                  <p
                    className="font-inter font-bold text-gray-900 leading-tight"
                    style={{ fontSize: "13.5px" }}
                  >
                    {submission.applicant}
                  </p>
                  <p
                    className="font-inter font-medium text-gray-400 leading-tight"
                    style={{ fontSize: "12px" }}
                  >
                    {submission.email}
                  </p>
                </td>

                {/* Category */}
                <td className="px-5 py-2.5">
                  <span
                    className="inline-flex items-center justify-center rounded font-inter font-semibold bg-gray-100 text-gray-600"
                    style={{ fontSize: "12px", padding: "4px 12px" }}
                  >
                    {submission.category}
                  </span>
                </td>

                {/* Date */}
                <td
                  className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
                  style={{ fontSize: "13px" }}
                >
                  {submission.submitted_at.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                {/* Status */}
                <td className="px-5 py-2.5">
                  <StatusDot status={submission.status} />
                </td>

                {/* Actions */}
                <td className="px-5 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      onViewReview?.({
                        id: submission.id,
                        title: submission.title,
                        site: submission.applicant.replace(/^SITE:\s*/i, ""),
                        contactEmail: submission.email,
                        documentType: submission.documentType,
                        submittedDate:
                          submission.submitted_at.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }),
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
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
          Showing 1–{PAGE_SIZE * 20} of {TOTAL_SUBMISSIONS} submissions
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border font-inter transition"
            style={{
              borderColor: "#d1d5db",
              color: safeCurrentPage === 1 ? "#c1c5cc" : "#374151",
              cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className="flex h-7 w-7 items-center justify-center rounded-full border font-inter font-semibold transition"
              style={{
                fontSize: "12.5px",
                borderColor: page === safeCurrentPage ? "#12345b" : "#d1d5db",
                backgroundColor:
                  page === safeCurrentPage ? "#12345b" : "#ffffff",
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
            className="flex h-7 w-7 items-center justify-center rounded-full border font-inter transition"
            style={{
              borderColor: "#d1d5db",
              color: safeCurrentPage >= totalPages ? "#c1c5cc" : "#374151",
              cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      </div>
    </section>
  );
}
