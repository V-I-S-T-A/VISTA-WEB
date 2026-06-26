import { useMemo, useState } from "react";
import { Eye, ClipboardCheck, ChevronDown, Check } from "lucide-react";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "30px";

// Generate static data — 15 submissions within the last 30 days
const now = new Date();
function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}

const STATIC_SUBMISSIONS = [
  {
    submission_id: "SUB-2024-0001",
    applicant: "Maria Santos",
    category: "Organization Budget",
    submitted_at: daysAgo(1),
    status: "Pending",
  },
  {
    submission_id: "SUB-2024-0002",
    applicant: "Juan dela Cruz",
    category: "Event Proposal",
    submitted_at: daysAgo(2),
    status: "Under Review",
  },
  {
    submission_id: "SUB-2024-0003",
    applicant: "Ana Reyes",
    category: "Activity Report",
    submitted_at: daysAgo(3),
    status: "Approved",
  },
  {
    submission_id: "SUB-2024-0004",
    applicant: "Carlo Mendoza",
    category: "Liquidation Report",
    submitted_at: daysAgo(4),
    status: "Returned",
  },
  {
    submission_id: "SUB-2024-0005",
    applicant: "Sofia Ramos",
    category: "Organization Budget",
    submitted_at: daysAgo(5),
    status: "Approved",
  },
  {
    submission_id: "SUB-2024-0006",
    applicant: "Miguel Torres",
    category: "Event Proposal",
    submitted_at: daysAgo(7),
    status: "Pending",
  },
  {
    submission_id: "SUB-2024-0007",
    applicant: "Isabella Lim",
    category: "Financial Statement",
    submitted_at: daysAgo(8),
    status: "Under Review",
  },
  {
    submission_id: "SUB-2024-0008",
    applicant: "Paolo Aquino",
    category: "Activity Report",
    submitted_at: daysAgo(10),
    status: "Approved",
  },
  {
    submission_id: "SUB-2024-0009",
    applicant: "Gabriela Cruz",
    category: "Liquidation Report",
    submitted_at: daysAgo(12),
    status: "Returned",
  },
  {
    submission_id: "SUB-2024-0010",
    applicant: "Luis Garcia",
    category: "Organization Budget",
    submitted_at: daysAgo(14),
    status: "Pending",
  },
  {
    submission_id: "SUB-2024-0011",
    applicant: "Camille Bautista",
    category: "Event Proposal",
    submitted_at: daysAgo(17),
    status: "Under Review",
  },
  {
    submission_id: "SUB-2024-0012",
    applicant: "Rafael Navarro",
    category: "Financial Statement",
    submitted_at: daysAgo(19),
    status: "Approved",
  },
  {
    submission_id: "SUB-2024-0013",
    applicant: "Jasmine Ong",
    category: "Activity Report",
    submitted_at: daysAgo(22),
    status: "Pending",
  },
  {
    submission_id: "SUB-2024-0014",
    applicant: "Marco Villanueva",
    category: "Liquidation Report",
    submitted_at: daysAgo(25),
    status: "Returned",
  },
  {
    submission_id: "SUB-2024-0015",
    applicant: "Patricia Flores",
    category: "Organization Budget",
    submitted_at: daysAgo(28),
    status: "Approved",
  },
];

const STATUS_CONFIG = {
  Pending: { dot: "#f59e0b", text: "#b45309", bg: "#fffbeb" },
  "Under Review": { dot: "#3b82f6", text: "#1d4ed8", bg: "#eff6ff" },
  Approved: { dot: "#22c55e", text: "#15803d", bg: "#f0fdf4" },
  Returned: { dot: "#ef4444", text: "#b91c1c", bg: "#fef2f2" },
};

const STATUS_OPTIONS = ["All Status", "Pending", "Under Review", "Approved", "Returned"];
const CATEGORY_OPTIONS = [
  "All Categories",
  "Organization Budget",
  "Event Proposal",
  "Activity Report",
  "Liquidation Report",
  "Financial Statement",
];

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { dot: "#9ca3af", text: "#6b7280", bg: "#f9fafb" };
  return (
    <span
      style={{ color: config.text, backgroundColor: config.bg, fontSize: "12px", padding: "3px 10px", borderRadius: "99px" }}
      className="inline-flex items-center gap-1.5 font-inter font-bold"
    >
      <span
        style={{ backgroundColor: config.dot }}
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
      />
      {status}
    </span>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
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
          className="absolute left-0 top-full z-10 mt-1.5 min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={[
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-inter font-semibold transition-colors whitespace-nowrap",
                  isSelected ? "bg-[#eef2ff] text-[#1f5cae]" : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
                style={{ fontSize: "12px" }}
              >
                {option}
                {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RecentSubmissionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const filtered = useMemo(() => {
    return STATIC_SUBMISSIONS.filter((s) => {
      const matchStatus = statusFilter === "All Status" || s.status === statusFilter;
      const matchCategory = categoryFilter === "All Categories" || s.category === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safeCurrentPage]);

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
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
    <section>
      {/* Toolbar */}
      <div className="bg-[#eef1f7] border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-4 h-auto">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: CONTENT_PADDING, paddingTop: "12px", paddingBottom: "12px" }}
          >
            <span className="font-inter font-semibold text-gray-600" style={{ fontSize: "13px" }}>
              Filter:
            </span>
            <FilterDropdown
              label="Filter by status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            />
            <FilterDropdown
              label="Filter by category"
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
            />
          </div>

          <div
            className="flex items-center gap-2"
            style={{ paddingRight: "20px" }}
          >
            <span className="font-inter text-gray-500" style={{ fontSize: "12px" }}>
              Showing submissions within the last 30 days
            </span>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div
        className="bg-[#1f5cae] h-16 flex items-center"
        style={{ paddingLeft: CONTENT_PADDING }}
      >
        <h3 className="font-inter text-[18px] font-bold text-white">
          Recent Submissions
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
              {["ID", "APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                  style={heading === "ID" ? { paddingLeft: CONTENT_PADDING } : undefined}
                >
                  {heading}
                </th>
              ))}
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
            {paginated.map((submission) => (
              <tr
                key={submission.submission_id}
                className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
              >
                {/* ID */}
                <td
                  className="px-5 py-2.5 font-inter font-semibold text-gray-700 whitespace-nowrap"
                  style={{ paddingLeft: CONTENT_PADDING, fontSize: "13px" }}
                >
                  {submission.submission_id}
                </td>

                {/* Applicant */}
                <td className="px-5 py-2.5">
                  <p
                    className="font-inter font-bold text-gray-900 leading-tight"
                    style={{ fontSize: "14px" }}
                  >
                    {submission.applicant}
                  </p>
                </td>

                {/* Category */}
                <td className="px-5 py-2.5">
                  <span
                    className="inline-flex items-center justify-center rounded-full px-4 py-1.5 font-inter font-semibold bg-[#dfe7fb] text-[#12345b]"
                    style={{ fontSize: "12px" }}
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
                  <StatusBadge status={submission.status} />
                </td>

                {/* Actions */}
                <td className="px-5 py-2.5">
                  <button
                    type="button"
                    id={`action-${submission.submission_id}`}
                    onClick={() => {
                      // Navigate to review panel (placeholder)
                      console.log("View & Review:", submission.submission_id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded font-inter font-bold text-white transition hover:opacity-90 active:scale-95"
                    style={{
                      fontSize: "12px",
                      padding: "5px 14px",
                      background: "linear-gradient(135deg, #1f5cae 0%, #142d55 100%)",
                      border: "none",
                    }}
                  >
                    <Eye style={{ width: "13px", height: "13px" }} aria-hidden="true" />
                    View &amp; Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
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
            {filtered.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
          submissions
        </p>

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
                borderColor: page === safeCurrentPage ? "#002b5c" : "#d1d5db",
                backgroundColor: page === safeCurrentPage ? "#002b5c" : "#ffffff",
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
              cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
