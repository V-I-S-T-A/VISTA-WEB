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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffc700] px-3 py-1 font-inter text-[11px] font-bold text-gray-900">
          <Pin size={12} aria-hidden="true" />
          {isPending ? "…" : `${submissions.length} ${submissions.length === 1 ? "entry" : "entries"}`}
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
                className={`whitespace-nowrap px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500 ${heading === "ACTIONS" ? "w-[170px] pl-6" : ""} ${heading === "STATUS" ? "min-w-[120px]" : ""}`}
                style={heading === "ID" ? { paddingLeft: "24px" } : undefined}
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
              <td colSpan={6} className="px-5 py-5">
                <ErrorNotice message="Could not load priority submissions." onRetry={() => refetch()} retrying={isFetching} />
              </td>
            </tr>
          ) : submissions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center font-inter text-sm text-gray-500">
                No submissions have been prioritized.
              </td>
            </tr>
          ) : (
            submissions.map((submission) => (
              <tr key={submission.submission_id} className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]">
                <td data-label="ID" className="whitespace-nowrap px-5 py-2.5 font-inter text-[13px] font-bold text-gray-900" style={{ paddingLeft: "24px" }}>
                  #{submission.submission_id.slice(0, 8)}
                </td>
                <td data-label="Document" className="px-5 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={submission.org_image_url || defaultUser}
                      alt=""
                      className="flex-shrink-0 rounded-full border border-gray-200 object-cover"
                      style={{ width: "36px", height: "36px" }}
                      onError={(event) => { event.currentTarget.src = defaultUser; }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-inter text-[13.5px] font-bold leading-tight text-gray-900">
                        {submission.title || "Untitled Document"}
                      </p>
                      <p className="mt-0.5 truncate font-inter text-xs font-medium leading-tight text-gray-400">
                        {submission.org_name || submission.submitted_by_name || "Unknown Applicant"}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff6d6] px-2 py-1 font-inter text-[10px] font-bold text-[#765700]">
                      <Pin size={10} aria-hidden="true" /> Priority
                    </span>
                  </div>
                </td>
                <td data-label="Category" className="px-5 py-2.5">
                  <span className="inline-flex items-center justify-center whitespace-nowrap rounded bg-gray-100 px-3 py-1 font-inter text-xs font-semibold text-gray-600">
                    {submission.category_name || "N/A"}
                  </span>
                </td>
                <td data-label="Date" className="whitespace-nowrap px-5 py-2.5 font-inter text-[13px] font-medium text-gray-500">
                  {formatDate(submission.submitted_at)}
                </td>
                <td data-label="Status" className="whitespace-nowrap px-5 py-2.5">
                  <SubmissionStatusLabel status={submission.status} />
                </td>
                <td data-label="Actions" className="whitespace-nowrap px-5 py-2.5 pl-6">
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
