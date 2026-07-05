import { useSubmissions } from "../../../../hooks/useSubmissions";

function ProgressRow({ label, value, color }) {
  const hasValue = typeof value === "number";
  return (
    <div style={{ marginBottom: "18px" }}>
      <div className="flex items-baseline justify-between">
        <span className="font-inter text-[12px] font-bold uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span className="font-inter text-[13px] font-bold text-gray-700">
          {hasValue ? `${value}%` : "N/A"}
        </span>
      </div>
      <div
        className="mt-1.5 w-full rounded-full bg-gray-100 overflow-hidden"
        style={{ height: "6px" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: hasValue ? `${value}%` : "0%",
            backgroundColor: hasValue ? color : "#d1d5db",
          }}
        />
      </div>
    </div>
  );
}

export default function InstitutionalPulse() {
  // Reuses the same query keys/params as the summary cards, so React Query
  // serves these from cache instead of firing duplicate network requests.
  const { data: allData } = useSubmissions({ page: 1, pageSize: 1 });
  const { data: approvedData } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "Approved",
  });
  const { data: rejectedData } = useSubmissions({
    page: 1,
    pageSize: 1,
    status: "Rejected",
  });

  const total = allData?.count ?? 0;
  const resolved = (approvedData?.count ?? 0) + (rejectedData?.count ?? 0);
  const reviewVelocity =
    total > 0 ? Math.round((resolved / total) * 100) : undefined;

  return (
    <div 
        className="rounded-xl border border-gray-200 bg-white"
        style={{ padding: "1rem", height: "130px" }}
    >
      <h3
        className="font-inter text-[16px] font-bold text-[#142d55]"
        style={{ marginBottom: "18px" }}
      >
        Institutional Pulse
      </h3>

      <ProgressRow
        label="Review Velocity"
        value={reviewVelocity}
        color="#1a51a5"
      />
      {/*
        No backend endpoint currently exposes a database/storage capacity
        metric, so this is intentionally shown as unavailable rather than
        inventing a number. Wire this up once such a metric exists.
      */}
      <ProgressRow
        label="Database Capacity"
        value={undefined}
        color="#f7941d"
      />
    </div>
  );
}
