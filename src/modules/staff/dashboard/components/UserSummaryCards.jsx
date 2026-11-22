import { Skeleton } from "../../../../components/loading/Skeleton";
import ErrorNotice from "../../../../components/ErrorNotice";
import DashboardIllustration from "../../../../components/DashboardIllustration";
import { useSubmissionStatistics } from "../../../../hooks/useSubmissions";

export default function SubmissionSummaryCards({
  selectedStatus = "All Status",
  onSelectStatus,
} = {}) {
  const { data: stats, isLoading, isError, refetch, isFetching } = useSubmissionStatistics();

  const total = stats?.total ?? 0;
  const statusCounts = stats?.status_counts ?? {};
  const processCount = (statusCounts.pending || 0) + (statusCounts.under_review || 0);
  const approvedCount = statusCounts.approved || 0;
  const returnedCount = (statusCounts.rejected || 0) + (statusCounts.resubmission_required || 0);

  const cards = [
    {
      id: "all",
      label: "Total Submissions",
      filterValue: "All Status",
      value: total,
      bg: "bg-[var(--ui-blue)]",
      badgeBg: "bg-white/15",
    },
    {
      id: "process",
      label: "In Process",
      filterValue: "Process",
      value: processCount,
      bg: "bg-[var(--ui-yellow)]",
      badgeBg: "bg-black/10",
    },
    {
      id: "approved",
      label: "Approved",
      filterValue: "Approved",
      value: approvedCount,
      bg: "bg-[#52B764]",
      badgeBg: "bg-black/10",
    },
    {
      id: "returned",
      label: "Returned",
      filterValue: "Returned",
      value: returnedCount,
      bg: "bg-[var(--ui-danger)]",
      badgeBg: "bg-white/15",
    },
  ];

  const handleCardClick = (filterValue) => {
    if (!onSelectStatus) return;
    if (selectedStatus === filterValue && filterValue !== "All Status") {
      onSelectStatus("All Status");
    } else {
      onSelectStatus(filterValue);
    }
  };

  return (
    <div className="w-full" style={{ marginBottom: "16px" }}>
      <div
        className="summary-cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "16px" }}
      >
        {cards.map(({ id, label, filterValue, value, bg }) => {
          const isFilterActive =
            selectedStatus === filterValue && filterValue !== "All Status";

          return (
            <button data-ui="toggle"
              type="button"
              key={label}
              data-tone={id}
              aria-pressed={isFilterActive}
              onClick={() => handleCardClick(filterValue)}
              className={`vista-summary-card relative ${bg} text-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                isFilterActive ? "ring-4 ring-offset-2 ring-blue-500" : ""
              }`}
              style={{ padding: "var(--space-5)", minHeight: "140px" }}
              title={`Click to filter submissions by ${label}`}
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
                  {isLoading || (isError && !stats)
                    ? <Skeleton width={72} height={40} />
                    : value.toString()}
                </p>
                <DashboardIllustration kind={id === 'all' ? 'total' : id} />
              </div>
            </button>
          );
        })}
      </div>
      {isError && !stats && (
        <ErrorNotice message="Could not load submission totals." onRetry={() => refetch()} retrying={isFetching} />
      )}
    </div>
  );
}
