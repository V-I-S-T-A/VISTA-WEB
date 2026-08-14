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

    const humanTitle = `${formatTable(log.table_name)} ${normalizedAction.charAt(0) + normalizedAction.slice(1).toLowerCase()}`;

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
      severity: "INFO",
      title: humanTitle,
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
      actionCategory: formatTable(log.table_name),
      realSubmissionId: realSubmissionId,
      referenceId: shortRefId,
      impactedEntities: [
        {
          id: shortRefId,
          name: fallbackName,
          label: "Affected Record",
          type: "document",
        },
      ],
      timeline: [
        {
          time: new Date(log.performed_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          label: `Event: ${normalizedAction}`,
          current: true,
        },
      ],
      action: normalizedAction,
      newData: newData,
      oldData: oldData,
      rawChanges: changes,
      rawTableName: log.table_name,
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

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-4">
      <div
        className="flex items-center gap-3"
        style={{ paddingBottom: "20px" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full transition hover:brightness-105 active:scale-95"
          style={{
            backgroundColor: "#FFE452",
            padding: "3px",
          }}
        >
          <span
            className="inline-flex items-center rounded-full font-inter font-medium text-[#1a1a1a]"
            style={{
              backgroundColor: "#FFF2A8",
              padding: "4px 14px",
              fontSize: "13px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                lineHeight: "20px",
                marginRight: "4px",
              }}
            >
              ›
            </span>
            Back
          </span>
        </button>
        <span
          className="font-inter font-medium text-gray-500"
          style={{ fontSize: "13.5px" }}
        >
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
                  className="inline-flex items-center mt-1.5 rounded-md font-inter font-bold uppercase"
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
            <div className="rounded-lg border border-gray-200 overflow-hidden flex flex-col">
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
                        {fetchedSubmission ? getDocumentName() : entity.name}
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

              {/* DYNAMIC CHANGES BLOCK */}
              <div
                className="flex-1 mt-auto border-t border-gray-200 bg-[#f7f9ff]"
                style={{ padding: "14px 16px" }}
              >
                <p
                  className="font-inter font-bold text-gray-500 uppercase tracking-wider mb-3"
                  style={{ fontSize: "11px", letterSpacing: "0.04em" }}
                >
                  {details.action.includes("CREATE")
                    ? "Created Record Snapshot"
                    : details.action.includes("DELETE")
                      ? "Deleted Record Snapshot"
                      : "Changes Made (Before & After)"}
                </p>

                {/* --- SPECIALIZED CREATION CARDS --- */}
                {details.action.includes("CREATE") && details.newData && (
                  <>
                    {details.rawTableName === "tbl_Submissions" ? (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {isFetchingSub ? (
                          <div className="flex items-center justify-center gap-2 font-inter text-[13px] text-gray-500 py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-[#1f5cae]" />
                            Loading submission payload...
                          </div>
                        ) : fetchedSubmission ? (
                          <>
                            <div className="bg-[#f8f9fc] border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                  <Check className="w-4 h-4" />
                                </div>
                                <h5 className="font-inter font-bold text-gray-800 text-[13px] uppercase tracking-wide">
                                  Submission Created
                                </h5>
                              </div>
                              <span className="font-semibold text-[#1d4ed8] bg-[#eaf1ff] px-2.5 py-1 rounded text-[11px] border border-blue-100 tracking-wider">
                                #
                                {String(
                                  fetchedSubmission.id || details.referenceId,
                                ).slice(0, 8)}
                              </span>
                            </div>

                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                  <FileText className="w-3.5 h-3.5" /> Document
                                  Type
                                </span>
                                <span className="font-bold text-gray-900 text-[14px] leading-tight">
                                  {getDocumentName()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                  <Building2 className="w-3.5 h-3.5" />{" "}
                                  Organization
                                </span>
                                <span className="font-medium text-gray-800 text-[13px]">
                                  {getOrganizationName()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                  <User className="w-3.5 h-3.5" /> Applicant
                                </span>
                                <span className="font-medium text-gray-800 text-[13px]">
                                  {getApplicantName()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                  <Tag className="w-3.5 h-3.5" /> Category
                                </span>
                                <span className="font-medium text-gray-800 text-[13px]">
                                  {getCategoryName()}
                                </span>
                              </div>
                            </div>

                            {fetchedSubmission.documents &&
                              fetchedSubmission.documents.length > 0 && (
                                <div className="bg-gray-50 border-t border-gray-200 px-5 py-4">
                                  <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    Attached Files (
                                    {fetchedSubmission.documents.length})
                                  </span>
                                  <div className="flex flex-col gap-2.5">
                                    {fetchedSubmission.documents.map(
                                      (doc, idx) => (
                                        <div
                                          key={doc.id || idx}
                                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow"
                                        >
                                          <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 flex-shrink-0 rounded bg-[#eaf1ff] flex items-center justify-center">
                                              <FileText className="w-4 h-4 text-[#1d4ed8]" />
                                            </div>
                                            <span className="font-semibold text-gray-800 text-[13px] truncate">
                                              {doc.file_name ||
                                                `Attached File ${idx + 1}`}
                                            </span>
                                          </div>
                                          <a
                                            href={doc.file_url || "#"}
                                            onClick={(e) => {
                                              if (!doc.file_url) {
                                                e.preventDefault();
                                                alert(
                                                  "Error: This files URL is missing from the database.",
                                                );
                                              }
                                            }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md bg-white px-3 py-1.5 font-inter text-[11px] font-bold text-[#1f5cae] border border-gray-200 transition-colors hover:bg-gray-50"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            VIEW
                                          </a>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="p-5">
                            <p className="text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded-md mb-4 border border-red-100">
                              Record deleted or unavailable. Displaying raw
                              audit payload.
                            </p>
                            <ul className="space-y-2 text-sm">
                              {Object.entries(details.newData).map(
                                ([key, val]) => {
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
                                    <li key={key} className="flex gap-3">
                                      <span className="font-semibold text-gray-500 capitalize w-1/3">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span className="text-gray-900 font-medium w-2/3">
                                        {String(val)}
                                      </span>
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : details.rawTableName === "tbl_Users" ? (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#f8f9fc] border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                              <UserPlus className="w-4 h-4" />
                            </div>
                            <h5 className="font-inter font-bold text-gray-800 text-[13px] uppercase tracking-wide">
                              Account Created
                            </h5>
                          </div>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              <User className="w-3.5 h-3.5" /> Full Name
                            </span>
                            <span className="font-bold text-gray-900 text-[14px]">
                              {details.newData.first_name}{" "}
                              {details.newData.last_name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              <Mail className="w-3.5 h-3.5" /> Email Address
                            </span>
                            <span className="font-medium text-gray-800 text-[13px]">
                              {details.newData.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              <Tag className="w-3.5 h-3.5" /> System Role
                            </span>
                            <span className="font-medium text-gray-800 text-[13px] capitalize">
                              {details.newData.role ||
                                details.newData.user_type ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              <Calendar className="w-3.5 h-3.5" /> Date Created
                            </span>
                            <span className="font-medium text-gray-800 text-[13px]">
                              {details.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-sm bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
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
                            <li key={key} className="flex gap-2">
                              <span className="font-semibold text-gray-600 capitalize w-1/3">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <span className="text-gray-900 font-medium w-2/3">
                                {String(val)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}

                {/* --- UPDATES LOGIC (Before & After) --- */}
                {(details.action.includes("UPDATE") ||
                  details.action.includes("CHANGE")) &&
                  (details.newData || details.oldData) && (
                    <ul className="space-y-3 text-sm bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      {Object.keys({
                        ...details.oldData,
                        ...details.newData,
                      }).map((key) => {
                        const oldVal = details.oldData?.[key];
                        const newVal = details.newData?.[key];

                        if (oldVal === newVal && oldVal !== undefined)
                          return null;
                        if (
                          typeof newVal === "object" ||
                          typeof oldVal === "object" ||
                          ["updated_at", "password"].includes(key)
                        )
                          return null;

                        return (
                          <li
                            key={key}
                            className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                          >
                            <span className="font-semibold text-gray-500 capitalize w-1/4 text-[12px] tracking-wide">
                              {key.replace(/_/g, " ")}
                            </span>
                            <div className="w-3/4 flex items-center gap-2.5 flex-wrap">
                              <span className="text-red-600 line-through bg-red-50 px-2.5 py-1 rounded text-[13px] border border-red-100">
                                {String(oldVal ?? "None")}
                              </span>
                              <span className="text-gray-300 font-bold">→</span>
                              <span className="text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded text-[13px] border border-green-100">
                                {String(newVal ?? "None")}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                {/* --- DELETION LOGIC (What was removed) --- */}
                {details.action.includes("DELETE") && details.oldData && (
                  <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-red-50 border-b border-red-100 px-5 py-3">
                      <h5 className="font-inter font-bold text-red-800 text-[13px] uppercase tracking-wide">
                        Deleted Properties
                      </h5>
                    </div>
                    <ul className="p-5 space-y-2 text-sm">
                      {Object.entries(details.oldData).map(([key, val]) => {
                        if (
                          typeof val === "object" ||
                          ["password"].includes(key)
                        )
                          return null;
                        return (
                          <li
                            key={key}
                            className="flex gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="font-semibold text-gray-500 capitalize w-1/3 text-[12px] tracking-wide">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-900 font-medium w-2/3">
                              {String(val)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* --- EMERGENCY FALLBACK --- */}
                {!details.newData &&
                  !details.oldData &&
                  Object.keys(details.rawChanges).length > 0 &&
                  !details.action.includes("CREATE") &&
                  !details.action.includes("DELETE") && (
                    <ul className="space-y-2 text-sm bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      {Object.entries(details.rawChanges).map(([key, val]) => {
                        if (
                          typeof val === "object" ||
                          ["password", "created_at", "updated_at"].includes(key)
                        )
                          return null;
                        return (
                          <li key={key} className="flex gap-3">
                            <span className="font-semibold text-gray-500 capitalize w-1/3">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-gray-900 font-medium w-2/3">
                              {String(val)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
