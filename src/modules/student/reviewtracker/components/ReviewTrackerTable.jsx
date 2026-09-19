import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import {
  TableContainer,
  TableSearchBar,
  FilterButton,
  FilterPopover,
  FilterPopoverRow,
  FilterSelect,
  FilterDateInput,
  ExportButton,
  ActionButton,
  SubmissionStatusLabel,
} from "../../../../components";

const PAGE_SIZE = 10;
const CONTENT_PADDING = "28px";

const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Resubmission Required",
];

const STATUS_MAP = {
  "All Status": "",
  Pending: "pending",
  "Under Review": "under_review",
  Approved: "approved",
  Rejected: "rejected",
  "Resubmission Required": "resubmission_required",
};

export default function ReviewTrackerTable() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: searchTerm,
    status: STATUS_MAP[statusFilter] || "",
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const submissions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const showPagination = totalCount > PAGE_SIZE;

  const activeFilterCount =
    (statusFilter !== "All Status" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

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

  function handleView(submission) {
    navigate(`/student/review-tracker/${submission.submission_id}`);
  }

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  // Frontend CSV Exporter
  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert("No submissions to export.");
      return;
    }

    const headers = [
      "ID",
      "TITLE",
      "ORGANIZATION/APPLICANT",
      "CATEGORY",
      "SUBMITTED DATE",
      "STATUS",
    ];
    const csvContent = [
      headers.join(","),
      ...submissions.map((sub) => {
        const id = sub.submission_id;
        const title = (sub.title || "Untitled Document").replace(/"/g, '""');
        const applicant = (
          sub.org_name ||
          sub.submitted_by_name ||
          sub.submitted_by_email ||
          "Unknown"
        ).replace(/"/g, '""');
        const category = sub.category_name || "N/A";
        const date = sub.submitted_at
          ? new Date(sub.submitted_at).toLocaleDateString("en-US")
          : "N/A";
        const status = sub.status || "Unknown";

        return `"${id}","${title}","${applicant}","${category}","${date}","${status}"`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my_submissions_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <TableContainer
      title="Recent Submissions"
      headerRight={
        <>
          <TableSearchBar
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search submissions..."
          />

          <div className="relative">
            <FilterButton
              onClick={() => setShowFilters((p) => !p)}
              activeCount={activeFilterCount}
            />

            {showFilters && (
              <FilterPopover
                onClear={() => {
                  setStatusFilter("All Status");
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                }}
                onClose={() => setShowFilters(false)}
              >
                <FilterPopoverRow label="Status">
                  <FilterSelect
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterPopoverRow>

                <FilterPopoverRow label="From Date">
                  <FilterDateInput
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FilterPopoverRow>

                <FilterPopoverRow label="To Date">
                  <FilterDateInput
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FilterPopoverRow>
              </FilterPopover>
            )}
          </div>

          <ExportButton onClick={handleExportCSV} />
        </>
      }
      totalCount={totalCount}
      shownCount={submissions.length}
      recordLabel="submissions"
      showPagination={showPagination}
      currentPage={safeCurrentPage}
      totalPages={totalPages}
      pageNumbers={pageNumbers}
      onGoToPage={goToPage}
    >
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
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
                className={`px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${
                  heading === "ACTIONS" ? "pl-6 w-[170px]" : ""
                } ${heading === "STATUS" ? "min-w-[120px]" : ""}`}
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
          ) : submissions.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-10 text-center font-inter text-sm text-gray-500"
              >
                No submissions found.
              </td>
            </tr>
          ) : (
            submissions.map((submission) => (
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

                {/* DOCUMENT / APPLICANT */}
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
                  {new Date(submission.submitted_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-2.5 whitespace-nowrap min-w-[120px]">
                  <SubmissionStatusLabel status={submission.status} />
                </td>

                {/* Actions */}
                <td className="px-5 py-2.5 pl-6 whitespace-nowrap w-[170px]">
                  <ActionButton
                    onClick={() => handleView(submission)}
                    label="VIEW"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
  );
}
