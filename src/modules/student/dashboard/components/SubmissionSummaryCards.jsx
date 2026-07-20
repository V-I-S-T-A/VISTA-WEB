import { FolderOpen, Clock, ShieldCheck } from "lucide-react";
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
    status: "pending", // FIXED: Changed to lowercase to match Django
  });
  const { data: approvedData, isLoading: isLoadingApproved } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "approved", // FIXED: Changed to lowercase to match Django
  });

  const isLoading = isLoadingAll || isLoadingPending || isLoadingApproved;

  const total = allData?.count ?? 0;
  const pending = pendingData?.count ?? 0;
  const verified = approvedData?.count ?? 0;

  const CARDS = [
    {
      label: "Total",
      value: total,
      icon: FolderOpen,
      bg: "bg-[#1a51a5]",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      bg: "bg-[#FDC849]",
      textColor: "text-[#6e5c00]",
    },
    {
      label: "Verified",
      value: verified,
      icon: ShieldCheck,
      bg: "bg-[#2d9f6f]",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-3" style={{ gap: "16px" }}>
        {CARDS.map(({ label, value, icon: Icon, bg, textColor }) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-2xl ${bg} ${textColor ?? "text-white"} flex flex-col justify-between shadow-sm`}
            style={{ padding: "20px 22px", height: "130px" }}
          >
            <p
              className="relative z-10 font-inter font-semibold opacity-90"
              style={{ fontSize: "14px" }}
            >
              {label}
            </p>
            <p
              className="relative z-10 font-inter font-bold leading-none"
              style={{ fontSize: "48px" }}
            >
              {isLoading ? "—" : value.toString().padStart(2, "0")}
            </p>
            <Icon
              className="absolute opacity-20"
              style={{
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "72px",
                height: "72px",
              }}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
