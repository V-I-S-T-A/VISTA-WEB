import { FolderOpen, Clock, ClipboardCheck, RotateCcw } from "lucide-react";
import { useSubmissionStatistics } from "../../../../hooks/useSubmissions";

export default function SubmissionSummaryCards({
  selectedStatus = "All Status",
  onSelectStatus,
} = {}) {
  const { data: stats, isLoading } = useSubmissionStatistics();

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
      icon: FolderOpen,
      bg: "bg-[#1a51a5]",
      badgeBg: "bg-white/15",
    },
    {
      id: "process",
      label: "In Process",
      filterValue: "Process",
      value: processCount,
      icon: Clock,
      bg: "bg-[#FDC849]",
      badgeBg: "bg-black/10",
    },
    {
      id: "approved",
      label: "Approved",
      filterValue: "Approved",
      value: approvedCount,
      icon: ClipboardCheck,
      bg: "bg-[#2d9f6f]",
      badgeBg: "bg-black/10",
    },
    {
      id: "returned",
      label: "Returned",
      filterValue: "Returned",
      value: returnedCount,
      icon: RotateCcw,
      bg: "bg-[#dc2626]",
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
        {cards.map(({ label, filterValue, value, icon: Icon, bg, badgeBg }) => {
          const isFilterActive =
            selectedStatus === filterValue && filterValue !== "All Status";

          return (
            <div
              key={label}
              onClick={() => handleCardClick(filterValue)}
              className={`relative rounded-2xl ${bg} text-white flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer ${
                isFilterActive ? "ring-4 ring-offset-2 ring-blue-500" : ""
              }`}
              style={{ padding: "20px 22px", height: "130px" }}
              title={`Click to filter submissions by ${label}`}
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
          );
        })}
      </div>
    </div>
  );
}
