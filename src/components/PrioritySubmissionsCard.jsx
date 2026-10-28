import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Pin } from "lucide-react";
import { submissionService } from "../services/submissionService";
import { SubmissionStatusLabel } from "./index";
import ErrorNotice from "./ErrorNotice";

function dateLabel(value) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
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
            submittedDate: dateLabel(submission.submitted_at),
          },
        },
      });
      return;
    }
    navigate(`/student/review-tracker/${submission.submission_id}`);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#e2e6ee] bg-white shadow-sm" aria-labelledby="priority-submissions-heading">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-t-xl bg-[#1f5cae] px-5 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <Pin size={17} className="text-[#ffc700]" aria-hidden="true" />
          <h2 id="priority-submissions-heading" className="m-0 font-inter text-base font-bold">Priority Submissions</h2>
        </div>
        <span className="rounded-full bg-[#ffc700] px-3 py-1 font-inter text-[11px] font-bold text-gray-900">
          {isPending ? "…" : `${submissions.length} ${submissions.length === 1 ? "entry" : "entries"}`}
        </span>
      </header>

      {isError ? (
        <div className="px-5 py-2"><ErrorNotice message="Could not load priority submissions." onRetry={() => refetch()} retrying={isFetching} /></div>
      ) : isPending ? (
        <div className="px-5 py-6 font-inter text-sm text-gray-500" role="status">Loading priority submissions…</div>
      ) : submissions.length === 0 ? (
        <div className="px-5 py-6 font-inter text-sm text-gray-500">No submissions have been prioritized.</div>
      ) : (
        <ul className="m-0 list-none divide-y divide-gray-100 p-0">
          {submissions.map((submission) => (
            <li key={submission.submission_id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="m-0 max-w-full truncate font-inter text-sm font-bold text-[#142d55]">{submission.title || "Untitled submission"}</h3>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff6d6] px-2 py-0.5 font-inter text-[10px] font-bold text-[#765700]">
                    <Pin size={10} aria-hidden="true" /> Priority
                  </span>
                </div>
                <p className="mb-0 mt-1 truncate font-inter text-xs text-gray-500">
                  {[submission.org_name, submission.submitted_by_name, submission.category_name, dateLabel(submission.submitted_at)]
                    .filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <SubmissionStatusLabel status={submission.status} />
                <button
                  type="button"
                  onClick={() => openSubmission(submission)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#b8cbe0] bg-white px-3 py-1.5 font-inter text-xs font-bold text-[#1f5cae] transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  View <ArrowUpRight size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
