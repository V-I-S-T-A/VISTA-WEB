import AttachmentImagePreview from "./AttachmentImagePreview";

function names(value) {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
}

export default function AttachmentChangeNote({ change, currentDocuments = [] }) {
  if (!change?.action) return null;

  const previousFiles = names(change.previous_files);
  const newFiles = names(change.new_files);
  const title = {
    added: "File added",
    replaced: "File replaced",
    detached: "Files removed from active attachments",
  }[change.action] || "Attachment updated";

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "10px 12px",
        borderRadius: "var(--radius-chip)",
        border: "1px solid #c9daf1",
        background: "#f5f8fe",
      }}
    >
      <p className="m-0 font-inter font-semibold text-[#1f5cae]" style={{ fontSize: "12px" }}>
        {title}
      </p>
      {previousFiles && (
        <p className="m-0 font-inter text-gray-600" style={{ marginTop: "5px", fontSize: "12px", lineHeight: 1.45, overflowWrap: "anywhere" }}>
          Previous file{change.previous_files.length === 1 ? "" : "s"}: {previousFiles}
        </p>
      )}
      {newFiles && (
        <p className="m-0 font-inter text-[#142d55]" style={{ marginTop: "5px", fontSize: "12px", lineHeight: 1.45, overflowWrap: "anywhere" }}>
          {change.action === "added" ? "Added" : change.action === "detached" ? "Detached" : "New file"}: {change.new_files.filter(Boolean).map((name, index) => {
            // Match Mobile: only a file still in the permitted current list can open.
            const document = change.action !== "detached" && currentDocuments.find(file => file.file_name === name && file.file_url && file.is_current !== false);
            return <span key={`${name}:${index}`}>
              {index > 0 && ", "}
              {document ? <AttachmentImagePreview fileUrl={document.file_url} fileName={name} mimeType={document.mime_type} triggerLabel={name} triggerClassName="attachment-history-preview" /> : name}
            </span>;
          })}
        </p>
      )}
      {change.action === "replaced" && !previousFiles && (
        <p className="m-0 font-inter text-gray-600" style={{ marginTop: "5px", fontSize: "12px" }}>
          No active file was attached before this update.
        </p>
      )}
    </div>
  );
}
