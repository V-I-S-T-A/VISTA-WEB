import { useMemo } from "react";
import {
  Check,
  ArrowLeft,
  Info,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  User,
} from "lucide-react";

export default function AuditLogDetails({ log, onBack }) {
  const details = useMemo(() => {
    if (!log) return null;

    // Parse the JSON changes field from your Django AuditLog model
    const changes =
      typeof log.changes === "string"
        ? JSON.parse(log.changes || "{}")
        : log.changes || {};

    return {
      logId: log.audit_id,
      severity: "INFO",
      title: `Action: ${String(log.action).toUpperCase()}`,
      actor: log.performed_by || "System",
      timestamp: new Date(log.performed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: new Date(log.performed_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      actionCategory: log.table_name || "N/A",
      referenceId: changes.record_id || "N/A",
      impactedEntities: [
        {
          id: changes.record_id || "N/A",
          name: log.table_name,
          label: "Affected Table",
          type: "document",
        },
      ],
      timeline: [
        {
          time: new Date(log.performed_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          label: `Event: ${log.action.toUpperCase()}`,
          current: true,
        },
      ],
    };
  }, [log]);

  if (!details) return null;

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-4">
      <p
        className="font-inter font-semibold text-[#1f5cae] mb-3"
        style={{ fontSize: "13px" }}
      >
        Log History
      </p>

      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] font-inter font-bold text-gray-900 transition-colors rounded-full"
          style={{ fontSize: "12px", padding: "7px 16px" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </button>
        <span className="font-inter text-gray-500" style={{ fontSize: "13px" }}>
          Audit log history details.
        </span>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div style={{ padding: "24px 28px" }}>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="inline-flex items-center font-inter font-bold uppercase tracking-wide rounded-md"
              style={{
                backgroundColor: "#e5e7eb",
                color: "#374151",
                fontSize: "11px",
                padding: "4px 10px",
              }}
            >
              SEVERITY: {details.severity}
            </span>
            <span
              className="font-inter text-gray-400"
              style={{ fontSize: "12px" }}
            >
              Log ID: {details.logId}
            </span>
          </div>

          <h3
            className="font-inter font-extrabold text-[#0f1f3d]"
            style={{ fontSize: "30px", lineHeight: 1.2 }}
          >
            {details.title}
          </h3>

          <div
            className="flex flex-wrap items-center gap-4 mt-3"
            style={{ fontSize: "14px" }}
          >
            <span className="inline-flex items-center gap-1.5 font-inter font-semibold text-gray-700">
              <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
              {details.actor}
            </span>
            <span className="inline-flex items-center gap-1.5 font-inter text-gray-500">
              <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
              {details.timestamp} &middot; {details.time}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <div
              className="flex items-center justify-between bg-[#1f5cae]"
              style={{ padding: "10px 18px" }}
            >
              <h4
                className="font-inter font-bold text-white"
                style={{ fontSize: "13px", letterSpacing: "0.04em" }}
              >
                EVENT SUMMARY
              </h4>
              <Info className="h-4 w-4 text-white/80" aria-hidden="true" />
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
              style={{ padding: "18px" }}
            >
              <div>
                <p
                  className="font-inter font-semibold uppercase text-gray-400"
                  style={{ fontSize: "11px", letterSpacing: "0.04em" }}
                >
                  ACTION CATEGORY
                </p>
                <span
                  className="inline-flex items-center mt-1.5 rounded-md font-inter font-bold"
                  style={{
                    backgroundColor: "#eef2ff",
                    color: "#1f3a8a",
                    fontSize: "13px",
                    padding: "6px 12px",
                  }}
                >
                  {details.actionCategory}
                </span>
              </div>
              <div>
                <p
                  className="font-inter font-semibold uppercase text-gray-400"
                  style={{ fontSize: "11px", letterSpacing: "0.04em" }}
                >
                  REFERENCE ID
                </p>
                <p
                  className="font-inter font-bold text-gray-800 mt-1.5"
                  style={{ fontSize: "14px" }}
                >
                  {details.referenceId}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-2 bg-gray-50 border-b border-gray-200"
                style={{ padding: "10px 16px" }}
              >
                <Users className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <h4
                  className="font-inter font-bold text-gray-700 uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.04em" }}
                >
                  Impacted Entities
                </h4>
              </div>
              <div
                className="flex flex-col gap-2.5"
                style={{ padding: "14px" }}
              >
                {details.impactedEntities.map((entity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-md bg-[#f7f9ff]"
                    style={{ padding: "10px 12px" }}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#1f5cae]">
                      <FileText
                        className="h-4.5 w-4.5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="font-inter font-semibold uppercase text-gray-400"
                        style={{ fontSize: "10px", letterSpacing: "0.04em" }}
                      >
                        {entity.label}
                      </p>
                      <p
                        className="font-inter font-bold text-gray-900"
                        style={{ fontSize: "14px" }}
                      >
                        {entity.name}
                      </p>
                      <p
                        className="font-inter text-gray-400"
                        style={{ fontSize: "11px" }}
                      >
                        ID: {entity.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-2 bg-gray-50 border-b border-gray-200"
                style={{ padding: "10px 16px" }}
              >
                <Calendar
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                <h4
                  className="font-inter font-bold text-gray-700 uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.04em" }}
                >
                  Context Timeline
                </h4>
              </div>
              <div style={{ padding: "16px" }}>
                {details.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: item.current ? "#fbbf24" : "#e5e7eb",
                        }}
                      >
                        <Check
                          className="h-3.5 w-3.5"
                          style={{
                            color: item.current ? "#78350f" : "#9ca3af",
                          }}
                        />
                      </span>
                    </div>
                    <div style={{ paddingBottom: "18px" }}>
                      <p
                        className="font-inter text-gray-400"
                        style={{ fontSize: "11px" }}
                      >
                        {item.time}
                      </p>
                      <p
                        className="font-inter font-bold text-gray-900"
                        style={{ fontSize: "14px" }}
                      >
                        {item.label}
                      </p>
                      {item.current && (
                        <span
                          className="inline-flex items-center mt-1 rounded font-inter font-bold uppercase"
                          style={{
                            backgroundColor: "#1f5cae",
                            color: "#fff",
                            fontSize: "10px",
                            padding: "2px 8px",
                          }}
                        >
                          THIS EVENT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
