import { CheckCircle2, ExternalLink, FileText, Folder, HardDrive, UserRound } from "lucide-react";
import "./DriveArchiveCard.css";

function PathStep({ name, index }) {
  const labels = ["Year", "Organization", "File Type"];
  const label = name.toLowerCase() === "approved"
    ? "Approved"
    : labels[index] || "Subfolder";

  return (
    <div className="drive-archive-card__path-step flex min-w-0 items-center gap-2 py-1.5 text-slate-700" style={{ paddingLeft: `${index * 16}px` }}>
      <Folder className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
      <span className="min-w-0 break-words font-inter text-[13px] font-semibold">{name}</span>
      <span className="drive-archive-card__path-label shrink-0 rounded bg-indigo-50 px-2 py-0.5 font-inter text-[10px] font-semibold text-indigo-700">
        {label}
      </span>
    </div>
  );
}

export default function DriveArchiveCard({ archives = [], handledBy = null }) {
  const handlerName = typeof handledBy === "string"
    ? handledBy.trim()
    : handledBy?.changed_by_name?.trim();
  if (!archives.length && !handlerName) return null;

  const firstArchive = archives[0];

  return (
    <section
      aria-labelledby="drive-archive-heading"
      className="drive-archive-card submission-detail-card w-full rounded-xl border border-gray-200 bg-white shadow-sm"
      style={{ padding: "24px", marginBottom: "24px" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3
          id="drive-archive-heading"
          className="font-inter text-[15px] font-bold uppercase tracking-wide text-slate-800"
        >
          Google Drive Storage Hierarchy
        </h3>
        <span
          className={`drive-archive-card__status inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter text-xs font-bold ${archives.length ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
          aria-label={archives.length ? "Archive complete" : "Approval recorded"}
        >
          {archives.length ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <UserRound className="h-3.5 w-3.5" aria-hidden="true" />}
          {archives.length ? "Archived to Drive" : "Approval recorded"}
        </span>
      </div>

      {!archives.length ? (
        <>
          <div className="drive-archive-card__root flex min-w-0 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1f5cae]">
              {handledBy?.changed_by_image_url ? (
                <img src={handledBy.changed_by_image_url} alt="" className="h-full w-full rounded-lg object-cover" />
              ) : (
                <UserRound className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-inter text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                Approved submission handled by
              </p>
              <p className="mt-0.5 break-words font-inter text-sm font-bold text-slate-800">
                {handlerName}
              </p>
            </div>
          </div>
          <p className="drive-archive-card__footer mb-0 mt-4 font-inter text-xs leading-relaxed text-slate-500">
            VISTA has no saved Google Drive location or file link for this entry.
          </p>
        </>
      ) : (
        <>
      <div className="drive-archive-card__root flex min-w-0 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1f5cae]">
          <HardDrive className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-inter text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
            Root Storage Folder
          </p>
          <p className="mt-0.5 break-words font-inter text-sm font-bold text-slate-800">
            {firstArchive.root_folder_name || "Google Drive folder"}
          </p>
        </div>
      </div>

      <div className="drive-archive-card__paths mt-5 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
        {archives.map((archive) => {
          const path = Array.isArray(archive.folder_path) ? archive.folder_path : [];
          const archiveHandlerName = handlerName || archive.archived_by_name?.trim() || "Staff member";
          const archiverName = archive.archived_by_name?.trim();
          return (
            <div key={archive.archive_id} className="drive-archive-card__archive min-w-0 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 font-inter text-[10.5px] font-bold uppercase tracking-wide text-slate-600">
                  {path.length ? "Automated Subfolder Path" : "Drive Folder"}
                </p>
                {archive.folder_path?.length > 0 && (
                  <span className="font-inter text-[11px] italic text-slate-500">Auto-created if not existing</span>
                )}
              </div>

              {path.length ? (
                <div className="drive-archive-card__tree mt-3 border-l-2 border-slate-300 pl-4">
                  <div className="drive-archive-card__steps space-y-1">
                    {path.map((name, index) => (
                      <PathStep key={`${archive.archive_id}-${index}`} name={name} index={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mb-0 mt-2 font-inter text-xs text-slate-500">
                  Folder path details are unavailable for this archive.
                </p>
              )}

                <div className="drive-archive-card__file-row mt-5 flex min-w-0 flex-col gap-3 rounded-lg border border-green-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="drive-archive-card__file-info flex min-w-0 items-start gap-2.5">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="m-0 break-words font-inter text-[13px] font-semibold leading-5 text-slate-800">
                      {archive.file_name || "Archived file"}
                    </p>
                    <span className="drive-archive-card__file-label mt-1 inline-flex rounded bg-green-100 px-2 py-0.5 font-inter text-[10px] font-semibold text-green-700">
                      {archive.upload_kind === "report" ? "Accomplishment Report" : "Approved File"}
                    </span>
                    <p className="m-0 mt-2 font-inter text-xs text-slate-500" style={{ marginTop: "6px" }}>
                      Handled by <span className="font-semibold text-slate-700">{archiveHandlerName}</span>
                    </p>
                    {archiverName && archiverName !== archiveHandlerName && (
                      <p className="m-0 font-inter text-xs text-slate-500" style={{ marginTop: "3px" }}>
                        Archived by <span className="font-semibold text-slate-700">{archiverName}</span>
                      </p>
                    )}
                  </div>
                </div>
                {archive.drive_view_link ? (
                  <a
                    href={archive.drive_view_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="drive-archive-card__drive-link inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md border border-blue-200 bg-blue-50 px-3.5 py-2 font-inter text-xs font-bold text-[#1f5cae] transition hover:bg-blue-100 sm:self-auto"
                  >
                    Open in Drive
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="font-inter text-xs text-slate-500">Drive link unavailable</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="drive-archive-card__footer mb-0 mt-4 font-inter text-xs leading-relaxed text-slate-500">
        This destination is saved after the file has been archived to Google Drive.
      </p>
        </>
      )}
    </section>
  );
}
