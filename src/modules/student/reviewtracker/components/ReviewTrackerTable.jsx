import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download, Eye, Loader2 } from "lucide-react";

const PAGE_SIZE = 50;
const CONTENT_PADDING = "28px";

const COLORS = {
  navy: "#003370",
  navyHover: "#16385f",
  amber: "#FDC849",
  amberHover: "#e0951a",
  headerBg: "#1A59A5",
  border: "#e2e6ee",
};

const STATUS_CONFIG = {
  pending: { label: "New", color: "#1d4ed8" },
  under_review: { label: "Reviewing", color: "#b45309" },
  approved: { label: "Verified", color: "#15803d" },
  rejected: { label: "Flagged", color: "#b91c1c" },
  resubmission_required: { label: "Resubmission Required", color: "#6d28d9" },
};

// ── Mock seed data ────────────────────────────────────────────────
const MOCK_SUBMISSIONS = [
  {
    submission_id: "vsta20260082",
    title: "SITE: Hackathon Even.",
    submitted_by_email: "site.ustp@example.com",
    category_name: "Inbound",
    submitted_at: "2023-10-24T10:00:00Z",
    status: "under_review",
  },
  {
    submission_id: "vsta20260083",
    title: "SITE: Hackathon Even.",
    submitted_by_email: "site.ustp@example.com",
    category_name: "Inbound",
    submitted_at: "2023-10-24T10:00:00Z",
    status: "pending",
  },
  {
    submission_id: "vsta20260084",
    title: "SITE: Hackathon Even.",
    submitted_by_email: "site.ustp@example.com",
    category_name: "Outbound",
    submitted_at: "2023-10-24T10:00:00Z",
    status: "approved",
  },
  {
    submission_id: "vsta20260085",
    title: "SITE: Hackathon Even.",
    submitted_by_email: "site.ustp@example.com",
    category_name: "Outbound",
    submitted_at: "2023-10-24T10:00:00Z",
    status: "under_review",
  },
  {
    submission_id: "vsta20260086",
    title: "SITE: Hackathon Even.",
    submitted_by_email: "site.ustp@example.com",
    category_name: "Outbound",
    submitted_at: "2023-10-24T10:00:00Z",
    status: "rejected",
  },
];

function StatusLabel({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    color: "#6b7280",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-inter font-bold whitespace-nowrap"
      style={{ fontSize: "13px", color: config.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}

export default function ReviewTrackerTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return MOCK_SUBMISSIONS;
    const q = searchTerm.toLowerCase();
    return MOCK_SUBMISSIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.submission_id.toLowerCase().includes(q) ||
        s.category_name.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  const totalCount = filtered.length;

  function handleView(submission) {
    navigate(`/student/review-tracker/${submission.submission_id}`);
  }

  return (
    <section
      className="overflow-hidden"
      style={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 3px rgba(15, 42, 74, 0.06)",
      }}
    >
      {/* ---- Header ---- */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap"
        style={{
          backgroundColor: COLORS.headerBg,
          padding: "20px 24px",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <h3
          className="font-inter font-bold"
          style={{ fontSize: "19px", color: "white" }}
        >
          Recent Submissions
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute"
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                height: "16px",
                width: "16px",
                color: "#9ca3af",
              }}
              aria-hidden="true"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search submissions..."
              className="font-inter outline-none"
              style={{
                width: "230px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                padding: "9px 12px 9px 34px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Filter */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 font-inter font-semibold text-white transition-colors"
            style={{
              borderRadius: "8px",
              backgroundColor: COLORS.navy,
              padding: "9px 16px",
              fontSize: "14px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.navyHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.navy)
            }
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filter
          </button>

          {/* Export */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 font-inter font-bold transition-colors"
            style={{
              borderRadius: "8px",
              backgroundColor: COLORS.amber,
              color: "#6e5c00",
              padding: "9px 16px",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.amberHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.amber)
            }
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr
              className="h-14"
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                backgroundColor: "#f8f9fc",
              }}
            >
              {["ID", "APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="text-left font-inter font-bold uppercase tracking-wider text-gray-500"
                    style={{
                      padding: "12px 20px",
                      fontSize: "13px",
                      paddingLeft:
                        heading === "ID" ? CONTENT_PADDING : undefined,
                    }}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center font-inter text-sm text-gray-500"
                  style={{ padding: "40px 20px" }}
                >
                  No submissions found.
                </td>
              </tr>
            ) : (
              filtered.map((submission) => (
                <tr
                  key={submission.submission_id}
                  className="h-16 transition-colors last:border-b-0"
                  style={{ borderBottom: `1px solid ${COLORS.border}` }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f7f9ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td
                    className="font-inter font-semibold text-gray-700 whitespace-nowrap"
                    style={{
                      padding: "12px 20px",
                      paddingLeft: CONTENT_PADDING,
                      fontSize: "13px",
                    }}
                  >
                    #V-{submission.submission_id.slice(-4)}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <p
                      className="font-inter font-bold text-gray-900 leading-tight"
                      style={{ fontSize: "14px" }}
                    >
                      {submission.title}
                    </p>
                    {submission.submitted_by_email && (
                      <p
                        className="font-inter text-gray-400 leading-tight"
                        style={{ fontSize: "12px", marginTop: "2px" }}
                      >
                        {submission.submitted_by_email}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <span
                      className="inline-flex items-center justify-center font-inter font-semibold"
                      style={{
                        fontSize: "12px",
                        padding: "5px 14px",
                        borderRadius: "9999px",
                        backgroundColor: "#eef1f8",
                        color: "#4b5b78",
                      }}
                    >
                      {submission.category_name}
                    </span>
                  </td>
                  <td
                    className="font-inter font-medium text-gray-500 whitespace-nowrap"
                    style={{ padding: "12px 20px", fontSize: "13px" }}
                  >
                    {new Date(submission.submitted_at).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <StatusLabel status={submission.status} />
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <button
                      type="button"
                      onClick={() => handleView(submission)}
                      className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
                      style={{
                        fontSize: "12px",
                        padding: "7px 16px",
                        borderRadius: "9999px",
                        backgroundColor: "#ffc700",
                      }}
                    >
                      <Eye style={{ width: "13px", height: "13px" }} />
                      VIEW
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Pagination ---- */}
      <div
        className="flex items-center justify-between flex-wrap gap-3"
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          backgroundColor: "#ffffff",
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: "12px",
          paddingBottom: "12px",
        }}
      >
        <p
          className="font-inter font-medium text-gray-500"
          style={{ fontSize: "14px" }}
        >
          Showing{" "}
          <span className="font-semibold text-gray-700">1–{totalCount}</span> of{" "}
          <span className="font-semibold text-gray-700">345</span> submissions
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled
            className="font-inter font-semibold transition"
            style={{
              width: "34px",
              height: "34px",
              fontSize: "14px",
              borderRadius: "9999px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#9ca3af",
              cursor: "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &lt;
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              className="font-inter font-semibold transition"
              style={{
                width: "34px",
                height: "34px",
                fontSize: "13px",
                borderRadius: "9999px",
                border: `1px solid ${page === 1 ? COLORS.navy : "#d1d5db"}`,
                backgroundColor: page === 1 ? COLORS.navy : "#ffffff",
                color: page === 1 ? "#ffffff" : "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="font-inter font-semibold transition"
            style={{
              width: "34px",
              height: "34px",
              fontSize: "14px",
              borderRadius: "9999px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}
