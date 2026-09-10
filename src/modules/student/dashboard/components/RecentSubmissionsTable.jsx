import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import defaultUser from "../../../../assets/shared/default_user.jpg";
import { TableContainer, SubmissionStatusLabel } from "../../../../components";

const PAGE_SIZE = 5;
const CONTENT_PADDING = "28px";

export default function RecentSubmissionsTable() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useSubmissions({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const submissions = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const showPagination = totalCount > PAGE_SIZE;

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

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function handleView(submission) {
    navigate(`/student/review-tracker/${submission.submission_id}`);
  }

  return (
    <TableContainer
      title="Recent Submissions"
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
            {["ID", "APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map(
              (heading) => (
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
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-10 text-center font-inter text-sm text-gray-500"
              >
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
                <td
                  className="px-5 py-2.5 font-inter font-bold text-gray-900 whitespace-nowrap"
                  style={{ paddingLeft: CONTENT_PADDING, fontSize: "13px" }}
                >
                  #{submission.submission_id.slice(0, 8)}
                </td>
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
                        style={{ fontSize: "14px" }}
                      >
                        {submission.org_name ||
                          submission.submitted_by_name ||
                          "Unknown Organization"}
                      </p>
                      {submission.submitted_by_email && (
                        <p
                          className="font-inter font-medium text-gray-400 leading-tight mt-0.5"
                          style={{ fontSize: "12px" }}
                        >
                          {submission.submitted_by_email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-2.5">
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
                    {submission.category_name || "N/A"}
                  </span>
                </td>
                <td
                  className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap"
                  style={{ fontSize: "13px" }}
                >
                  {new Date(submission.submitted_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </td>
                <td className="px-5 py-2.5 whitespace-nowrap min-w-[120px]">
                  <SubmissionStatusLabel status={submission.status} />
                </td>
                <td className="px-5 py-2.5 pl-6 whitespace-nowrap w-[170px]">
                  <button
                    type="button"
                    onClick={() => handleView(submission)}
                    className="inline-flex items-center gap-1.5 font-inter font-bold text-gray-900 transition hover:brightness-105 active:scale-95"
                    style={{
                      fontSize: "12px",
                      padding: "7px 16px",
                      borderRadius: "9999px",
                      backgroundColor: "#FFE452",
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
    </TableContainer>
  );
}
