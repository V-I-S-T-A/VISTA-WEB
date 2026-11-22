import { Skeleton } from "../../../../components/loading/Skeleton";
import DashboardIllustration from "../../../../components/DashboardIllustration";
import { useSubmissions } from "../../../../hooks/useSubmissions";
import ErrorNotice from "../../../../components/ErrorNotice";

// Cards reflect only the current student org's submissions — the backend
// scopes the /submissions/ list to the authenticated student's org, so no
// client-side filtering by org is needed here.
export default function SubmissionSummaryCards() {
  const { data: allData, isLoading: isLoadingAll, isError: allError, refetch: retryAll } = useSubmissions({
    page: 1,
    pageSize: 1,
  });
  const { data: pendingData, isLoading: isLoadingPending, isError: pendingError, refetch: retryPending } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "pending",
  });
  const { data: approvedData, isLoading: isLoadingApproved, isError: approvedError, refetch: retryApproved } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "approved",
  });
  const { data: returnedData, isLoading: isLoadingReturned, isError: returnedError, refetch: retryReturned } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "rejected",
  });

  const isLoading = isLoadingAll || isLoadingPending || isLoadingApproved || isLoadingReturned;

  const total = allData?.count ?? 0;
  const pending = pendingData?.count ?? 0;
  const completed = approvedData?.count ?? 0;
  const returned = returnedData?.count ?? 0;

  const cards = [
    {
      label: "Total Submissions",
      value: allError && !allData ? "—" : total,
      illustration: "total",
      bg: "bg-[var(--ui-blue)]",
      badgeBg: "bg-white/15",
      span: "",
    },
    {
      label: "Pending",
      value: pendingError && !pendingData ? "—" : pending,
      illustration: "process",
      bg: "bg-[var(--ui-yellow)]",
      badgeBg: "bg-black/10",
      span: "",
    },
    {
      label: "Approved",
      value: approvedError && !approvedData ? "—" : completed,
      illustration: "approved",
      bg: "bg-[#52B764]",
      badgeBg: "bg-black/10",
      span: "",
    },
    {
      label: "Returned",
      value: returnedError && !returnedData ? "—" : returned,
      illustration: "returned",
      bg: "bg-[var(--ui-danger)]",
      span: "",
    },
  ];

  return (
    <div className="w-full">
      <div
        className="student-cards-grid grid grid-cols-2 lg:grid-cols-4"
        style={{ gap: "16px" }}
      >
        {cards.map(({ label, value, illustration, bg, span }, index) => (
          <div
            key={label}
            data-tone={index === 1 ? "process" : index === 2 ? "approved" : index === 3 ? "returned" : "default"}
            className={`vista-summary-card relative ${bg} text-white flex flex-col justify-between ${span} shadow-sm`}
            style={{ padding: "var(--space-5)", minHeight: "140px" }}
          >
            <p
              className="font-inter font-semibold text-white/90"
              style={{ fontSize: "14px" }}
            >
              {label}
            </p>
            <div className="flex items-end justify-between">
              <p data-summary-value
                className="font-inter font-bold leading-none"
                style={{ fontSize: "44px" }}
              >
                {isLoading ? <Skeleton width={72} height={40} /> : value.toString()}
              </p>
              <DashboardIllustration kind={illustration} />
            </div>
          </div>
        ))}
      </div>
      {(allError || pendingError || approvedError || returnedError) && <ErrorNotice
        message="Some submission totals could not be refreshed. Unavailable totals are shown as a dash."
        onRetry={() => { retryAll(); retryPending(); retryApproved(); retryReturned(); }} />}
    </div>
  );
}
