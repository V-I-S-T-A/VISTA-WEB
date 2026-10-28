import { useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { convertImageToWebP } from "../../../../../utils/fileOptimizer";
import { StatusModal } from "../../../../../components";
import "./ProcessAttachmentsModal.css";

const CLOUD_NAME = "djtdar2ex";
const UPLOAD_PRESET = "vista_uploads";

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("The attachment could not be uploaded. Check your connection and try again."));
    xhr.onload = () => {
      let result;
      try { result = JSON.parse(xhr.responseText); } catch { result = null; }
      if (xhr.status >= 200 && xhr.status < 300 && result?.secure_url) resolve(result);
      else reject(new Error(result?.error?.message || "The attachment could not be uploaded."));
    };
    xhr.send(data);
  });
}

export default function ProcessAttachmentsModal({ isOpen, onClose, onConfirm, submission, submissionDetails }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [action, setAction] = useState("add");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const documents = submissionDetails?.documents ?? [];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      let attachment = null;
      if (file) {
        const uploadFile = await convertImageToWebP(file);
        const uploaded = await uploadToCloudinary(uploadFile, setProgress);
        attachment = {
          file_name: uploadFile.name,
          file_url: uploaded.secure_url,
          cloudinary_public_id: uploaded.public_id,
          cloudinary_resource_type: uploaded.resource_type,
          mime_type: uploaded.resource_type === "image" ? (uploadFile.type || "image/webp") : (uploadFile.type || "application/octet-stream"),
          file_size_kb: Math.max(1, Math.round(uploadFile.size / 1024)),
        };
      }
      const succeeded = await onConfirm({ attachmentAction: attachment ? action : "", attachment });
      if (succeeded !== false) onClose();
    } catch (uploadError) {
      setError(uploadError?.response?.data?.detail || uploadError?.message || "Could not update this submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = submissionDetails?.title || submission?.title || "Untitled submission";
  const submissionId = submissionDetails?.submission_id || submission?.id;

  return (
    <StatusModal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage submission attachments"
      subtitle="On Process"
      maxWidth="600px"
      cancelText="Cancel"
      onCancel={onClose}
      confirmText={isSubmitting ? "Saving…" : "Confirm On Process"}
      onConfirm={handleSubmit}
      confirmDisabled={isSubmitting}
      closeDisabled={isSubmitting}
    >
      <section className="process-attachments-summary w-full rounded-lg border border-[#dbe4f0] bg-[#f1f5fd]" aria-label="Submission summary">
        <p className="m-0 font-inter text-[11px] font-bold uppercase tracking-wide text-[#1f5cae]">Submission</p>
        <p className="mb-0 mt-1 break-words font-inter text-sm font-bold text-[#142d55]">{title}</p>
        <p className="mb-0 mt-1 break-all font-mono text-[11px] text-gray-500">{submissionId}</p>
        <p className="mb-0 mt-3 font-inter text-xs leading-5 text-gray-600">
          {documents.length
            ? `${documents.length} active attachment${documents.length === 1 ? "" : "s"} associated.`
            : "No active attachments are associated with this entry."}
        </p>
        {documents.length > 0 && (
          <ul className="mb-0 mt-2 grid gap-2 p-0" style={{ listStyle: "none" }}>
            {documents.map((doc) => (
              <li key={doc.document_id} className="flex min-w-0 items-center gap-2 font-inter text-xs text-gray-700">
                <FileText size={14} className="shrink-0 text-[#1f5cae]" />
                <span className="truncate">{doc.file_name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
        <legend className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-gray-600">If you upload a new file</legend>
        <label className={`process-attachments-choice flex cursor-pointer items-start gap-3 rounded-lg border transition ${action === "add" ? "border-[#9bb8dc] bg-[#f1f6fd]" : "border-[#e2e6ee] bg-white hover:border-[#b8cbe0]"}`}>
          <input type="radio" name="attachment-action" value="add" checked={action === "add"} onChange={() => setAction("add")} disabled={isSubmitting} className="mt-1 h-4 w-4 shrink-0 accent-[#1f5cae]" />
          <span className="min-w-0">
            <strong className="block font-inter text-sm font-bold text-[#142d55]">Add it to the current files</strong>
            <span className="mt-1 block font-inter text-xs leading-5 text-gray-600">
              {documents.length
                ? "The current files stay attached, and this file is added."
                : "No files are currently attached, so this will be the only active file."}
            </span>
          </span>
        </label>
        <label className={`process-attachments-choice flex cursor-pointer items-start gap-3 rounded-lg border transition ${action === "replace" ? "border-[#9bb8dc] bg-[#f1f6fd]" : "border-[#e2e6ee] bg-white hover:border-[#b8cbe0]"}`}>
          <input type="radio" name="attachment-action" value="replace" checked={action === "replace"} onChange={() => setAction("replace")} disabled={isSubmitting} className="mt-1 h-4 w-4 shrink-0 accent-[#1f5cae]" />
          <span className="min-w-0">
            <strong className="block font-inter text-sm font-bold text-[#142d55]">Replace the current files with this one</strong>
            <span className="mt-1 block font-inter text-xs leading-5 text-gray-600">Old files remain in the history but are no longer attached.</span>
          </span>
        </label>
      </fieldset>

      <div className="min-w-0">
        <label htmlFor="process-attachment-file" className="mb-2 block font-inter text-xs font-bold uppercase tracking-wide text-gray-600">
          New attachment <span className="font-normal normal-case text-gray-500">(optional)</span>
        </label>
        <input
          id="process-attachment-file"
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,image/*"
          disabled={isSubmitting}
          onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); }}
          className="process-attachments-file-input block w-full min-w-0 rounded-lg border border-[#d1d5db] bg-white font-inter text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#edf4ff] file:px-3 file:py-2 file:font-semibold file:text-[#1f5cae] disabled:opacity-60"
        />
        <p className="mb-0 mt-2 font-inter text-xs leading-5 text-gray-500">
          PDF, DOCX, XLSX, or image files, matching the staff registration picker. Leave empty to change status only.
        </p>
      </div>

      {isSubmitting && file && (
        <div className="w-full rounded-lg border border-[#dbe4f0] bg-[#f7f9fc] p-3">
          <div className="mb-2 flex items-center justify-between gap-3 font-inter text-xs text-gray-600">
            <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin text-[#1f5cae]" />Uploading attachment</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-[#1f5cae] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && <p role="alert" className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 font-inter text-sm leading-5 text-red-700">{error}</p>}
    </StatusModal>
  );
}
