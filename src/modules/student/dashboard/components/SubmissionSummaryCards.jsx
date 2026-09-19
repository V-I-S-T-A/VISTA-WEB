import { FolderOpen, Clock, ClipboardCheck } from "lucide-react";
import { useSubmissions } from "../../../../hooks/useSubmissions";

// Cards reflect only the current student org's submissions — the backend
// scopes the /submissions/ list to the authenticated student's org, so no
// client-side filtering by org is needed here.
export default function SubmissionSummaryCards() {
  const { data: allData, isLoading: isLoadingAll } = useSubmissions({
    page: 1,
    pageSize: 1,
  });
  const { data: pendingData, isLoading: isLoadingPending } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "pending",
  });
  const { data: approvedData, isLoading: isLoadingApproved } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "approved",
  });

  const isLoading = isLoadingAll || isLoadingPending || isLoadingApproved;

  const total = allData?.count ?? 0;
  const pending = pendingData?.count ?? 0;
  const completed = approvedData?.count ?? 0;

  const cards = [
    {
      label: "Total Submissions",
      value: total,
      icon: FolderOpen,
      bg: "bg-[#1a51a5]",
      badgeBg: "bg-white/15",
      span: "card-full-width",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      bg: "bg-[#FDC849]",
      badgeBg: "bg-black/10",
      span: "",
    },
    {
      label: "Completed",
      value: completed,
      icon: ClipboardCheck,
      bg: "bg-[#2d9f6f]",
      badgeBg: "bg-black/10",
      span: "",
    },
  ];

  return (
    <div className="w-full">
      <div
        className="student-cards-grid grid grid-cols-1 md:grid-cols-3"
        style={{ gap: "16px" }}
      >
        {cards.map(({ label, value, icon: Icon, bg, badgeBg, span }) => (
          <div
            key={label}
            className={`relative rounded-2xl ${bg} text-white flex flex-col justify-between ${span} shadow-sm hover:shadow-md transition-shadow`}
            style={{ padding: "20px 22px", height: "130px" }}
          >
            <p
              className="font-inter font-semibold text-white/90"
              style={{ fontSize: "14px" }}
            >
              {label}
            </p>
            <div className="flex items-end justify-between">
              <p
                className="font-inter font-bold leading-none"
                style={{ fontSize: "44px" }}
              >
                {isLoading ? "—" : value.toString()}
              </p>
              <span
                className={`flex items-center justify-center rounded-xl ${badgeBg}`}
                style={{ width: "44px", height: "44px" }}
              >
                <Icon
                  style={{ width: "22px", height: "22px" }}
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
