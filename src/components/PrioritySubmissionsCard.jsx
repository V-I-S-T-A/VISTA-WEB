import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";
import { submissionService } from "../services/submissionService";
import { ActionButton, SubmissionStatusLabel, TableContainer } from "./index";
import { TableRowsSkeleton } from "./loading/Skeleton";
import defaultUser from "../assets/shared/default_user.webp";
import ErrorNotice from "./ErrorNotice";

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PrioritySubmissionsCard({ role }) {
  const navigate = useNavigate();
  const { data: submissions = [], isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["priority-submissions", role],
    queryFn: submissionService.getPrioritySubmissions,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const openSubmission = (submission) => {
    if (role === "staff") {
      navigate("/staff/review-panel", {
        state: {
          submission: {
            id: submission.submission_id,
            title: submission.title || "Untitled Document",
            site: submission.org_name || "Unknown Organization",
            contactEmail: submission.submitted_by_email
              ? `${submission.submitted_by_name || ""} (${submission.submitted_by_email})`.trim()
              : submission.submitted_by_name || "N/A",
            documentType: submission.doc_type_name || "N/A",
            submittedDate: formatDate(submission.submitted_at),
          },
        },
      });
      return;
    }
    navigate(`/student/review-tracker/${submission.submission_id}`);
  };

  return (
    <TableContainer
      className="responsive-records"
      title="Priority Submissions"
      headerRight={(
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffc700] font-inter text-[11px] font-bold text-gray-900" style={{ padding: "5px 12px" }}>
          <Pin size={12} aria-hidden="true" />
          {isPending ? "Loading" : `${submissions.length} ${submissions.length === 1 ? "entry" : "entries"}`}
        </span>
      )}
      totalCount={submissions.length}
      shownCount={submissions.length}
      recordLabel="priority submissions"
    >
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc]">
            {["ID", "DOCUMENT / APPLICANT", "CATEGORY", "DATE", "STATUS", "ACTIONS"].map((heading) => (
              <th
                key={heading}
                className={`whitespace-nowrap text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 ${heading === "ACTIONS" ? "w-[170px]" : ""} ${heading === "STATUS" ? "min-w-[120px]" : ""}`}
                style={{ padding: "12px 16px", ...(heading === "ID" ? { paddingLeft: "24px" } : {}) }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <TableRowsSkeleton columns={6} />
          ) : isError ? (
            <tr>
              <td colSpan={6} style={{ padding: "20px 24px" }}>
                <ErrorNotice message="Could not load priority submissions." onRetry={() => refetch()} retrying={isFetching} />
              </td>
            </tr>
          ) : submissions.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center font-inter text-sm text-gray-500" style={{ padding: "32px 16px" }}>
                No submissions have been prioritized.
              </td>
            </tr>
          ) : (
            submissions.map((submission) => (
              <tr key={submission.submission_id} className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]">
                <td data-label="ID" className="whitespace-nowrap font-inter text-[13px] font-bold text-gray-900" style={{ padding: "10px 16px", paddingLeft: "24px" }}>
                  #{submission.submission_id.slice(0, 8)}
                </td>
                <td data-label="Document" style={{ padding: "10px 16px" }}>
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={submission.org_image_url || defaultUser}
                      alt=""
                      className="flex-shrink-0 rounded-full border border-gray-200 object-cover"
                      style={{ width: "36px", height: "36px" }}
                      onError={(event) => { event.currentTarget.src = defaultUser; }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-inter text-[13.5px] font-bold leading-tight text-gray-900" style={{ margin: 0 }}>
                        {submission.title || "Untitled Document"}
                      </p>
                      <p className="truncate font-inter text-xs font-medium leading-tight text-gray-400" style={{ margin: "3px 0 0" }}>
                        {submission.org_name || submission.submitted_by_name || "Unknown Applicant"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff6d6] font-inter text-[10px] font-bold text-[#765700]" style={{ padding: "4px 8px" }}>
                      <Pin size={10} aria-hidden="true" /> Priority
                    </span>
                  </div>
                </td>
                <td data-label="Category" style={{ padding: "10px 16px" }}>
                  <span className="inline-flex items-center justify-center whitespace-nowrap rounded bg-gray-100 font-inter text-xs font-semibold text-gray-600" style={{ padding: "4px 12px" }}>
                    {submission.category_name || "N/A"}
                  </span>
                </td>
                <td data-label="Date" className="whitespace-nowrap font-inter text-[13px] font-medium text-gray-500" style={{ padding: "10px 16px" }}>
                  {formatDate(submission.submitted_at)}
                </td>
                <td data-label="Status" className="whitespace-nowrap" style={{ padding: "10px 16px" }}>
                  <SubmissionStatusLabel status={submission.status} />
                </td>
                <td data-label="Actions" className="whitespace-nowrap" style={{ padding: "10px 16px 10px 24px" }}>
                  <ActionButton onClick={() => openSubmission(submission)} label={role === "staff" ? "VIEW & REVIEW" : "VIEW"} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
  );
}
