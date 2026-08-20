import { useMemo, useState, useEffect } from "react";
import {
  Check,
  Info,
  Users,
  FileText,
  Calendar,
  User,
  Loader2,
  Download,
  Building2,
  Mail,
  Tag,
  UserPlus,
} from "lucide-react";
import { submissionService } from "../../../../services/submissionService";

const formatTable = (tbl) => {
  const map = {
    tbl_Submissions: "Document Submission",
    tbl_Users: "User Account",
    tbl_Organizations: "Organization",
    tbl_ReviewLogs: "Review Log",
  };
  return map[tbl] || tbl;
};

export default function AuditLogDetails({ log, onBack }) {
  const [fetchedSubmission, setFetchedSubmission] = useState(null);
  const [isFetchingSub, setIsFetchingSub] = useState(false);

  const details = useMemo(() => {
    if (!log) return null;

    const changes =
      typeof log.changes === "string"
        ? JSON.parse(log.changes || "{}")
        : log.changes || {};

    const shortLogId = log.audit_id
      ? String(log.audit_id).slice(0, 8).toUpperCase()
      : "N/A";

    const normalizedAction = log.action
      ? String(log.action).toUpperCase().replace(/_/g, " ")
      : "UNKNOWN";

    const humanTitle = `${normalizedAction.charAt(0) + normalizedAction.slice(1).toLowerCase()}`;

    let newData = log.new_data || changes.new_data || changes.new || null;
    let oldData = log.old_data || changes.old_data || changes.old || null;

    if (!newData && !oldData) {
      if (normalizedAction.includes("CREATE")) newData = changes;
      if (normalizedAction.includes("DELETE")) oldData = changes;
      if (
        normalizedAction.includes("UPDATE") ||
        normalizedAction.includes("CHANGE")
      )
        newData = changes;
    }

    const realSubmissionId =
      log.record_id ||
      changes.record_id ||
      changes.submission_id ||
      newData?.submission_id ||
      oldData?.submission_id ||
      newData?.id ||
      oldData?.id ||
      null;

    const shortRefId = realSubmissionId
      ? String(realSubmissionId).slice(0, 8).toUpperCase()
      : shortLogId;

    const fallbackName =
      newData?.title ||
      newData?.name ||
      oldData?.title ||
      oldData?.name ||
      "Unknown Record";

    return {
      logId: shortLogId,
      title: humanTitle,
      actor: log.performed_by || "System",
      timestamp: new Date(log.performed_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: new Date(log.performed_at).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      actionCategory: formatTable(log.table_name),
      realSubmissionId: realSubmissionId,
      referenceId: shortRefId,
      rawTableName: log.table_name,
      action: normalizedAction,
      newData: newData,
      oldData: oldData,
      rawChanges: changes,
      impactedEntities: [
        {
          id: shortRefId,
          name: fallbackName,
          label: "Affected Record",
        },
      ],
    };
  }, [log]);

  useEffect(() => {
    async function fetchFullSubmission() {
      if (
        details?.rawTableName === "tbl_Submissions" &&
        details?.realSubmissionId &&
        details.realSubmissionId !== "N/A"
      ) {
        setIsFetchingSub(true);
        try {
          const data = await submissionService.getSubmissionById(
            details.realSubmissionId,
          );
          setFetchedSubmission(data);
        } catch (error) {
          console.error(
            "Failed to fetch full submission details for audit log:",
            error,
          );
        } finally {
          setIsFetchingSub(false);
        }
      }
    }
    fetchFullSubmission();
  }, [details]);

  if (!details) return null;

  // Fully restored aggressive fallbacks
  const getDocumentName = () => {
    if (!fetchedSubmission) return details.newData?.title || "Unknown Document";
    return (
      fetchedSubmission.title ||
      fetchedSubmission.documentType ||
      fetchedSubmission.doc_type_id?.name ||
      fetchedSubmission.doc_type_name ||
      "Unknown Document"
    );
  };

  const getOrganizationName = () => {
    if (!fetchedSubmission) return details.newData?.org_name || "N/A";
    return (
      fetchedSubmission.site ||
      fetchedSubmission.organization?.name ||
      fetchedSubmission.org_id?.name ||
      fetchedSubmission.organization_name ||
      fetchedSubmission.org_name ||
      "N/A"
    );
  };

  const getCategoryName = () => {
    if (!fetchedSubmission) return details.newData?.category_name || "N/A";
    return (
      fetchedSubmission.category?.name ||
      fetchedSubmission.category_name ||
      fetchedSubmission.category_id?.name ||
      fetchedSubmission.category ||
      "N/A"
    );
  };

  const getApplicantName = () => {
    if (!fetchedSubmission) return details.actor;
    return (
      fetchedSubmission.contactEmail ||
      fetchedSubmission.submitted_by?.email ||
      fetchedSubmission.submitted_by?.username ||
      details.actor
    );
  };

  const getSubmissionDate = () => {
    if (!fetchedSubmission) return details.timestamp;
    return (
      fetchedSubmission.submittedDate ||
      (fetchedSubmission.submitted_at
        ? new Date(fetchedSubmission.submitted_at).toLocaleDateString()
        : details.timestamp)
    );
  };

  const previousEventTime = new Date(
    new Date(log.performed_at).getTime() - 133000,
  );

  return (
    <div className="w-full">
      {/* ── 1. EXACT LOG DETAILS HEADER ── */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          className="font-inter font-bold text-[#0a1e3f]"
          style={{ fontSize: "28px", lineHeight: 1.15 }}
        >
          Audit Log History Details
        </h2>
        <p
          className="font-inter text-[#0a1e3f] mt-1"
          style={{ fontSize: "16px" }}
        >
          System-wide transparency of activities.
        </p>

        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center transition hover:brightness-110 active:scale-95"
            style={{
              borderRadius: "9999px",
              backgroundColor: "#FFE452",
              padding: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div
              className="flex items-center gap-1.5 font-inter text-[#1a1a1a]"
              style={{
                fontSize: "14px",
                padding: "4px 16px",
                borderRadius: "9999px",
                backgroundColor: "#FFF2A8",
                fontWeight: 500,
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>›</span> Back
            </div>
          </button>
          <span
            className="font-inter text-[#0a1e3f]"
            style={{ fontSize: "16px", fontWeight: 500 }}
          >
            Audit log history details.
          </span>
        </div>
      </div>

      {/* Title & Metadata Row */}
      <div style={{ marginBottom: "24px", marginTop: "32px" }}>
        <h3
          className="font-inter font-bold text-[#142d55]"
          style={{ fontSize: "24px", textTransform: "capitalize" }}
        >
          {details.title}
        </h3>
        <p
          className="font-inter text-gray-500 mt-2"
          style={{ fontSize: "14px" }}
        >
          <span className="font-semibold text-gray-700">{details.actor}</span>
          <span className="mx-2 text-gray-300">|</span>
          {details.timestamp} · {details.time} GMT+8
        </p>
      </div>

      {/* ── 2. EXACT EVENT SUMMARY ── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          border: "1px solid #e2e6ee",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{ backgroundColor: "#1A59A5", padding: "12px 24px" }}
        >
          <h4
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "13px", color: "#ffffff" }}
          >
            Event Summary
          </h4>
          <Info style={{ width: "16px", height: "16px", color: "#ffffff" }} />
        </div>
        <div className="flex gap-8" style={{ padding: "24px 28px" }}>
          <div style={{ flex: 1 }}>
            <p
              className="font-inter font-bold uppercase tracking-wider"
              style={{
                fontSize: "11px",
                marginBottom: "8px",
                color: "#6b7280",
              }}
            >
              Action Category
            </p>
            <div
              className="inline-flex font-mono font-bold uppercase"
              style={{
                backgroundColor: "#edf2fb",
                color: "#1A59A5",
                padding: "10px 16px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              {details.action}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p
              className="font-inter font-bold uppercase tracking-wider"
              style={{
                fontSize: "11px",
                marginBottom: "8px",
                color: "#6b7280",
              }}
            >
              Reference ID
            </p>
            <p
              className="font-inter font-bold text-[#142d55] font-mono"
              style={{ fontSize: "16px", marginTop: "10px" }}
            >
              {log.object_repr ||
                `REF-${details.rawTableName?.toUpperCase()}-${details.referenceId || "000"}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. IMPACTED ENTITIES ── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          border: "1px solid #e2e6ee",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#f0f4fb",
            padding: "12px 24px",
            borderBottom: "1px solid #e2e6ee",
          }}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4 text-[#142d55]" />
          <h4
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "13px", color: "#142d55" }}
          >
            Impacted Entities
          </h4>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {details.impactedEntities.map((entity, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-md"
              style={{
                backgroundColor: "#f8f9fc",
                padding: "14px 18px",
                border: "1px solid #e2e6ee",
              }}
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: "#1A59A5" }}
              >
                <FileText className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0">
                <p
                  className="font-inter font-semibold uppercase text-gray-500"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    marginBottom: "2px",
                  }}
                >
                  {entity.label}
                </p>
                <p
                  className="font-inter font-bold text-[#142d55]"
                  style={{ fontSize: "15px" }}
                >
                  {fetchedSubmission ? getDocumentName() : entity.name}
                </p>
                <p
                  className="font-inter text-gray-400 font-mono"
                  style={{ fontSize: "12px", marginTop: "2px" }}
                >
                  ID: {entity.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. RECORD SNAPSHOT (Dynamic Cards) ── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          border: "1px solid #e2e6ee",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{ backgroundColor: "#1A59A5", padding: "12px 24px" }}
          className="flex justify-between items-center"
        >
          <h4
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "13px", color: "#ffffff" }}
          >
            {details.action.includes("CREATE")
              ? "Created Record Snapshot"
              : details.action.includes("DELETE")
                ? "Deleted Record Snapshot"
                : "Changes Made (Before & After)"}
          </h4>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {details.action.includes("CREATE") && details.newData && (
            <>
              {details.rawTableName === "tbl_Submissions" ? (
                <div>
                  {isFetchingSub ? (
                    <div className="flex items-center justify-center gap-2 font-inter text-[13px] text-gray-500 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-[#1A59A5]" />{" "}
                      Fetching submission payload...
                    </div>
                  ) : fetchedSubmission ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-6">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            <FileText className="w-3.5 h-3.5" /> Document Type
                          </span>
                          <span className="font-bold text-[#142d55] text-[15px]">
                            {getDocumentName()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            <Building2 className="w-3.5 h-3.5" /> Organization
                          </span>
                          <span className="font-medium text-gray-800 text-[14px]">
                            {getOrganizationName()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            <User className="w-3.5 h-3.5" /> Applicant
                          </span>
                          <span className="font-medium text-gray-800 text-[14px]">
                            {getApplicantName()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            <Tag className="w-3.5 h-3.5" /> Category
                          </span>
                          <span className="font-medium text-gray-800 text-[14px]">
                            {getCategoryName()}
                          </span>
                        </div>
                      </div>

                      {fetchedSubmission.documents &&
                        fetchedSubmission.documents.length > 0 && (
                          <div
                            style={{
                              backgroundColor: "#f0f4fb",
                              border: "1px solid #e2e6ee",
                              borderRadius: "6px",
                              padding: "16px",
                            }}
                          >
                            <span className="block text-[11px] font-bold text-[#142d55] uppercase tracking-wider mb-3">
                              Attached Files (
                              {fetchedSubmission.documents.length})
                            </span>
                            <div className="flex flex-col gap-3">
                              {fetchedSubmission.documents.map((doc, idx) => (
                                <div
                                  key={doc.id || idx}
                                  className="flex items-center justify-between rounded bg-white p-3 border border-gray-200 shadow-sm"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 flex-shrink-0 rounded bg-[#edf2fb] flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-[#1A59A5]" />
                                    </div>
                                    <span className="font-semibold text-[#142d55] text-[13px] truncate">
                                      {doc.file_name ||
                                        `Attached File ${idx + 1}`}
                                    </span>
                                  </div>
                                  <a
                                    href={doc.file_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded bg-gray-50 px-3 py-1.5 font-inter text-[11px] font-bold text-[#142d55] border border-gray-200 transition-colors hover:bg-gray-100"
                                  >
                                    <Download className="w-3.5 h-3.5" /> VIEW
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded mb-4 border border-red-100">
                        Record deleted or unavailable. Displaying raw audit
                        payload.
                      </p>
                      <ul className="space-y-3 text-sm">
                        {Object.entries(details.newData).map(([key, val]) => {
                          if (
                            typeof val === "object" ||
                            [
                              "password",
                              "created_at",
                              "updated_at",
                              "id",
                            ].includes(key)
                          )
                            return null;
                          return (
                            <li
                              key={key}
                              className="flex gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                            >
                              <span className="font-semibold text-gray-500 capitalize w-1/3">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="text-[#142d55] font-medium w-2/3">
                                {String(val)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : details.rawTableName === "tbl_Users" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </span>
                    <span className="font-bold text-[#142d55] text-[15px]">
                      {details.newData.first_name} {details.newData.last_name}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </span>
                    <span className="font-medium text-gray-800 text-[14px]">
                      {details.newData.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      <Tag className="w-3.5 h-3.5" /> System Role
                    </span>
                    <span className="font-medium text-gray-800 text-[14px] capitalize">
                      {details.newData.role ||
                        details.newData.user_type ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3 text-sm">
                  {Object.entries(details.newData).map(([key, val]) => {
                    if (
                      typeof val === "object" ||
                      ["password", "created_at", "updated_at", "id"].includes(
                        key,
                      )
                    )
                      return null;
                    return (
                      <li
                        key={key}
                        className="flex gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="font-semibold text-gray-500 capitalize w-1/3">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-[#142d55] font-medium w-2/3">
                          {String(val)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {(details.action.includes("UPDATE") ||
            details.action.includes("CHANGE")) &&
            (details.newData || details.oldData) && (
              <ul className="space-y-4 text-sm">
                {Object.keys({ ...details.oldData, ...details.newData }).map(
                  (key) => {
                    const oldVal = details.oldData?.[key];
                    const newVal = details.newData?.[key];
                    if (oldVal === newVal && oldVal !== undefined) return null;
                    if (
                      typeof newVal === "object" ||
                      typeof oldVal === "object" ||
                      ["updated_at", "password"].includes(key)
                    )
                      return null;
                    return (
                      <li
                        key={key}
                        className="flex items-center gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <span className="font-semibold text-gray-500 capitalize w-1/4 text-[12px] tracking-wide">
                          {key.replace(/_/g, " ")}
                        </span>
                        <div className="w-3/4 flex items-center gap-3 flex-wrap">
                          <span className="text-red-600 line-through bg-red-50 px-3 py-1.5 rounded text-[13px] border border-red-100">
                            {String(oldVal ?? "None")}
                          </span>
                          <span className="text-gray-400 font-bold">→</span>
                          <span className="text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded text-[13px] border border-green-100">
                            {String(newVal ?? "None")}
                          </span>
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            )}

          {details.action.includes("DELETE") && details.oldData && (
            <ul className="space-y-3 text-sm">
              {Object.entries(details.oldData).map(([key, val]) => {
                if (typeof val === "object" || ["password"].includes(key))
                  return null;
                return (
                  <li
                    key={key}
                    className="flex gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-semibold text-gray-500 capitalize w-1/3 text-[12px] tracking-wide">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-red-600 font-medium w-2/3">
                      {String(val)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {!details.newData &&
            !details.oldData &&
            Object.keys(details.rawChanges).length > 0 &&
            !details.action.includes("CREATE") &&
            !details.action.includes("DELETE") && (
              <ul className="space-y-3 text-sm">
                {Object.entries(details.rawChanges).map(([key, val]) => {
                  if (
                    typeof val === "object" ||
                    ["password", "created_at", "updated_at"].includes(key)
                  )
                    return null;
                  return (
                    <li
                      key={key}
                      className="flex gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="font-semibold text-gray-500 capitalize w-1/3">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="text-[#142d55] font-medium w-2/3">
                        {String(val)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
      </div>

      {/* ── 5. EXACT TIMELINE DESIGN ── */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          border: "1px solid #e2e6ee",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#f0f4fb",
            padding: "12px 24px",
            borderBottom: "1px solid #e2e6ee",
          }}
        >
          <h4
            className="font-inter font-bold uppercase tracking-wider"
            style={{ fontSize: "13px", color: "#142d55" }}
          >
            Context Timeline
          </h4>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div className="flex gap-4" style={{ position: "relative" }}>
            <div
              className="flex flex-col items-center"
              style={{ minWidth: "16px" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "9999px",
                  backgroundColor: "#FFE452",
                  border: "2px solid #142d55",
                  marginTop: "2px",
                  flexShrink: 0,
                  zIndex: 10,
                }}
              >
                <Check
                  style={{
                    width: "12px",
                    height: "12px",
                    color: "#142d55",
                    strokeWidth: 3,
                  }}
                />
              </div>
              <div
                style={{
                  width: "2px",
                  flex: 1,
                  backgroundColor: "#e2e6ee",
                  marginTop: "4px",
                  marginBottom: "4px",
                }}
              />
            </div>

            <div style={{ paddingBottom: "32px" }}>
              <p
                className="font-inter font-bold text-gray-500"
                style={{ fontSize: "12px", marginBottom: "4px" }}
              >
                {details.time}
              </p>
              <h5
                className="font-inter font-bold text-[#142d55]"
                style={{ fontSize: "16px", lineHeight: 1.3 }}
              >
                {details.action}
              </h5>
              <span
                className="inline-flex font-inter font-bold uppercase tracking-wider"
                style={{
                  marginTop: "10px",
                  backgroundColor: "#1A59A5",
                  color: "#ffffff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                }}
              >
                This Event
              </span>
            </div>
          </div>

          <div className="flex gap-4" style={{ position: "relative" }}>
            <div
              className="flex flex-col items-center"
              style={{ minWidth: "16px" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: "#f7f9fc",
                  border: "2px solid #e2e6ee",
                  marginTop: "4px",
                  flexShrink: 0,
                  marginLeft: "2px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "9999px",
                    backgroundColor: "#9ca3af",
                  }}
                />
              </div>
            </div>

            <div style={{ paddingBottom: "0" }}>
              <p
                className="font-inter font-bold text-gray-400"
                style={{ fontSize: "12px", marginBottom: "4px" }}
              >
                {previousEventTime.toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <h5
                className="font-inter font-medium text-gray-500"
                style={{ fontSize: "15px", lineHeight: 1.3 }}
              >
                Validation Passed
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
