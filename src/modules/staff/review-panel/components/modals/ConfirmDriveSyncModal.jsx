import { useState, useRef } from "react";
import {
  X,
  HardDrive,
  Folder,
  CheckCircle2,
  Loader2,
  AlertCircle,
  UploadCloud,
  FileText,
  Trash2,
} from "lucide-react";

import { useDriveConnection } from "../../../../../hooks/useDrive";

export default function ConfirmDriveSyncModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  submission,
  submissionDetails,
  statusAction,
  remarks,
}) {
  const { data: driveConn, isLoading: isLoadingConn } = useDriveConnection();
  const [finalFile, setFinalFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const isDriveConnected = driveConn?.connected ?? false;
  const rootFolderName =
    driveConn?.folder_name ||
    driveConn?.target_folder_name ||
    "Google Drive (Root)";

  const academicYear =
    submissionDetails?.academic_year ||
    submissionDetails?.academic_year_name ||
    submission?.academic_year ||
    "2026-2027";
  const orgName =
    submissionDetails?.org_name ||
    submission?.org_name ||
    submission?.site ||
    "Organization";
  const docTypeName =
    submissionDetails?.doc_type_name ||
    submission?.doc_type_name ||
    submission?.documentType ||
    "Document Type";
  const displayFileName = finalFile
    ? finalFile.name
    : `${submissionDetails?.title || submission?.title || "Submission_Document"}.pdf`;

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    onConfirm({
      finalFile,
      folder_name: rootFolderName,
      folder_id: driveConn?.folder_id || driveConn?.target_folder_id,
    });
  };


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "88vh",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "#1f5cae",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <HardDrive style={{ width: "18px", height: "18px", color: "#ffffff" }} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                Confirm Submission to Drive
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.85)",
                  margin: "2px 0 0",
                  lineHeight: "1.2",
                }}
              >
                Double Authentication &amp; Drive Folder Target
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "7px",
              width: "30px",
              height: "30px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              opacity: isSubmitting ? 0.5 : 1,
            }}
            aria-label="Close modal"
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Decision Target Summary */}
          <div
            style={{
              background: "#f8f9fc",
              border: "1.5px solid #e5e7eb",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Decision Target
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#1f5cae",
                  background: "#eaf1ff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                #{submission?.id?.slice(0, 8)}
              </span>
            </div>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
                lineHeight: "1.3",
              }}
            >
              {submission?.title || "Untitled Document"}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Action:
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#15803d",
                  background: "#dcfce7",
                  padding: "2px 10px",
                  borderRadius: "99px",
                }}
              >
                {statusAction}
              </span>
            </div>

            {remarks && (
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  color: "#4b5563",
                  fontStyle: "italic",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  margin: "4px 0 0",
                }}
              >
                &ldquo;{remarks}&rdquo;
              </p>
            )}
          </div>

          {/* Drop PDF Section (Final Paper Replacement) */}
          <div
            style={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                Drop PDF (Final Version for Drive)
              </label>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: finalFile ? "#15803d" : "#6b7280",
                  background: finalFile ? "#f0fdf4" : "#f3f4f6",
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}
              >
                {finalFile ? "New File Selected" : "Replaces Old Document"}
              </span>
            </div>

            {!finalFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) {
                    if (
                      dropped.type === "application/pdf" ||
                      dropped.name.toLowerCase().endsWith(".pdf")
                    ) {
                      setFinalFile(dropped);
                      setFileError("");
                    } else {
                      setFileError("Only PDF files (.pdf) are accepted.");
                    }
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging
                    ? "2px dashed #1f5cae"
                    : "2px dashed #cbd5e1",
                  backgroundColor: isDragging ? "#f0f5fc" : "#f8fafd",
                  borderRadius: "8px",
                  padding: "18px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                      if (
                        selected.type === "application/pdf" ||
                        selected.name.toLowerCase().endsWith(".pdf")
                      ) {
                        setFinalFile(selected);
                        setFileError("");
                      } else {
                        setFileError("Only PDF files (.pdf) are accepted.");
                      }
                    }
                  }}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    background: "#eaf1ff",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1f5cae",
                  }}
                >
                  <UploadCloud style={{ width: "18px", height: "18px" }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                      margin: 0,
                    }}
                  >
                    Click to browse or drop final PDF here
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      color: "#64748b",
                      margin: "3px 0 0",
                    }}
                  >
                    Old file will be removed from system &amp; new PDF will be uploaded to Drive
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      background: "#dcfce7",
                      borderRadius: "6px",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText
                      style={{ width: "16px", height: "16px", color: "#15803d" }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        color: "#14532d",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {finalFile.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "#16a34a",
                        margin: "1px 0 0",
                      }}
                    >
                      {(finalFile.size / 1024).toFixed(1)} KB · Will replace initial document
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFinalFile(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Remove replacement PDF"
                >
                  <Trash2 style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            )}

            {fileError && (
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#dc2626",
                  margin: 0,
                  fontWeight: "600",
                }}
              >
                {fileError}
              </p>
            )}
          </div>

          {/* Automated Drive Storage Hierarchy Section */}
          <div
            style={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                Google Drive Storage Hierarchy
              </label>
              {isDriveConnected ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#15803d",
                    background: "#f0fdf4",
                    padding: "2px 8px",
                    borderRadius: "99px",
                  }}
                >
                  <CheckCircle2 style={{ width: "12px", height: "12px", color: "#16a34a" }} />
                  Connected
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#b45309",
                    background: "#fffbeb",
                    padding: "2px 8px",
                    borderRadius: "99px",
                  }}
                >
                  <AlertCircle style={{ width: "12px", height: "12px", color: "#d97706" }} />
                  Not Connected
                </span>
              )}
            </div>

            {/* Root Folder Banner */}
            <div
              style={{
                background: "#f0f7ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HardDrive style={{ width: "16px", height: "16px", color: "#1f5cae" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "10.5px",
                      fontWeight: "700",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      display: "block",
                    }}
                  >
                    Root Storage Folder
                  </span>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rootFolderName}
                  </p>
                </div>
              </div>

              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#1d4ed8",
                  background: "#ffffff",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  border: "1px solid #bfdbfe",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Configured in GDrive Sync
              </span>
            </div>

            {/* Automated Subfolders Visualizer (Akane's Hierarchy) */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Automated Subfolder Path
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10.5px",
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Auto-created if not existing
                </span>
              </div>

              {/* Hierarchy Tree */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "9px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12.5px",
                }}
              >
                {/* Level 0: Root */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1e3a8a", fontWeight: "600" }}>
                  <Folder style={{ width: "15px", height: "15px", color: "#3b82f6", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rootFolderName}</span>
                  <span style={{ fontSize: "10px", color: "#64748b", background: "#e2e8f0", padding: "1px 6px", borderRadius: "4px" }}>Root</span>
                </div>

                {/* Level 1: Academic Year */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "16px", borderLeft: "2px solid #cbd5e1", marginLeft: "7px", color: "#334155", fontWeight: "600" }}>
                  <Folder style={{ width: "15px", height: "15px", color: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{academicYear}</span>
                  <span style={{ fontSize: "10px", color: "#d97706", background: "#fef3c7", padding: "1px 6px", borderRadius: "4px" }}>Year</span>
                </div>

                {/* Level 2: Organization */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "32px", borderLeft: "2px solid #cbd5e1", marginLeft: "7px", color: "#334155", fontWeight: "600" }}>
                  <Folder style={{ width: "15px", height: "15px", color: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{orgName}</span>
                  <span style={{ fontSize: "10px", color: "#1d4ed8", background: "#e0e7ff", padding: "1px 6px", borderRadius: "4px" }}>Organization</span>
                </div>

                {/* Level 3: Document Type */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "48px", borderLeft: "2px solid #cbd5e1", marginLeft: "7px", color: "#334155", fontWeight: "600" }}>
                  <Folder style={{ width: "15px", height: "15px", color: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{docTypeName}</span>
                  <span style={{ fontSize: "10px", color: "#7c3aed", background: "#f3e8ff", padding: "1px 6px", borderRadius: "4px" }}>File Type</span>
                </div>

                {/* Level 4: Final File */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "64px", borderLeft: "2px solid #cbd5e1", marginLeft: "7px", color: "#0f172a", fontWeight: "700" }}>
                  <FileText style={{ width: "15px", height: "15px", color: "#15803d", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#15803d" }}>{displayFileName}</span>
                  <span style={{ fontSize: "10px", color: "#15803d", background: "#dcfce7", padding: "1px 6px", borderRadius: "4px" }}>
                    {finalFile ? "New Final PDF" : "System PDF"}
                  </span>
                </div>
              </div>
            </div>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                color: "#64748b",
                margin: 0,
                lineHeight: "1.4",
              }}
            >
              💡 This nested hierarchy is automatically resolved on Google Drive. The new paper will be archived directly inside the <strong>{docTypeName}</strong> subfolder.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            background: "#f9fafb",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              background: "#ffffff",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "8px 18px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#031c36",
              background: "#ffc700",
              border: "none",
              borderRadius: "8px",
              padding: "9px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" style={{ width: "15px", height: "15px" }} />
            ) : (
              <CheckCircle2 style={{ width: "15px", height: "15px" }} />
            )}
            {isSubmitting ? "CONFIRMING…" : "CONFIRM & SUBMIT TO DRIVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
