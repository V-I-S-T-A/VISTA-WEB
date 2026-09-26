import { useState, useRef, useEffect } from "react";
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
  Camera,
  RefreshCw,
  Eye,
  GripVertical,
} from "lucide-react";

import { useDriveConnection } from "../../../../../hooks/useDrive";
import { imagesToPdf } from "../../../../../utils/imagesToPdf";

const MAX_FILES = 10;
const APPROVED_FOLDER_NAME = "Approved";

const isPdf = (file) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
const isImage = (file) => file.type.startsWith("image/");
const isSupportedUpload = (file) => isPdf(file) || isImage(file);
const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;
const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;

function ImagePreview({ file }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return previewUrl ? (
    <img
      src={previewUrl}
      alt={`Preview of ${file.name}`}
      style={{
        width: "100%",
        height: 130,
        objectFit: "contain",
        background: "#f1f5f9",
        borderRadius: 6,
      }}
    />
  ) : null;
}

function SelectedFileRow({
  file,
  fileName = file.name,
  onNameChange,
  onRemove,
  onPreview,
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#f0fdf4",
        border: "1.5px solid #86efac",
        borderRadius: "8px",
        padding: "8px 12px",
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
        <FileText
          style={{
            width: "16px",
            height: "16px",
            color: "#15803d",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#14532d",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fileName}
          </p>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              color: "#16a34a",
              margin: 0,
            }}
          >
            {formatSize(file.size)}
          </p>
        </div>
      </div>
      {onNameChange && (
        <input
          aria-label={`Google Drive filename for ${file.name}`}
          type="text"
          value={fileName}
          maxLength={255}
          onChange={(event) => onNameChange(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          placeholder="File name in Google Drive"
          style={{
            width: "min(45%, 260px)",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            padding: "6px 8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
          }}
        />
      )}
      {onPreview && (
        <button
          type="button"
          onClick={onPreview}
          title={`Preview ${fileName}`}
          aria-label={`Preview PDF ${fileName} in a new tab`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            border: "1px solid #bfdbfe",
            borderRadius: 6,
            background: "#fff",
            color: "#1e3a8a",
            padding: "6px 8px",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          <Eye size={14} /> Preview PDF
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        title="Remove file"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          color: "#dc2626",
          display: "flex",
        }}
      >
        <Trash2 style={{ width: "16px", height: "16px" }} />
      </button>
    </li>
  );
}

function TreeRow({
  depth,
  icon: Icon,
  iconColor,
  label,
  tag,
  tagColor,
  tagBg,
  strong = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        paddingLeft: `${depth * 16}px`,
        borderLeft: depth ? "2px solid #cbd5e1" : "none",
        marginLeft: depth ? "7px" : 0,
        color: "#334155",
        fontWeight: strong ? 700 : 600,
      }}
    >
      <Icon
        style={{
          width: "15px",
          height: "15px",
          color: iconColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {tag && (
        <span
          style={{
            fontSize: "10px",
            color: tagColor,
            background: tagBg,
            padding: "1px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

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
  const { data: driveConn } = useDriveConnection();
  const [finalFiles, setFinalFiles] = useState([]);
  const [reportFiles, setReportFiles] = useState([]);
  const [driveFileNames, setDriveFileNames] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isReportDragging, setIsReportDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [reportFileError, setReportFileError] = useState("");
  const fileInputRef = useRef(null);
  const reportFileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReplaceKey, setCameraReplaceKey] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedReplaceKey, setCapturedReplaceKey] = useState(null);
  const [isConvertingImages, setIsConvertingImages] = useState(false);
  const replaceImageInputRef = useRef(null);
  const [replaceImageKey, setReplaceImageKey] = useState(null);
  const [draggingImageKey, setDraggingImageKey] = useState(null);
  const [dragOverImageKey, setDragOverImageKey] = useState(null);
  const imageReviewRef = useRef(null);
  const imageFiles = finalFiles.filter(isImage);
  const hasUnconvertedImages = imageFiles.length > 0;

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setIsCameraOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      setIsCameraOpen(false);
    }
    return () =>
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, [isOpen]);

  const openCamera = async (replaceKey = null) => {
    setCameraError("");
    setCameraReplaceKey(replaceKey);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is unavailable in this browser or page context.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      setIsCameraOpen(true);
      requestAnimationFrame(() => {
        if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
      });
    } catch (error) {
      setCameraError(
        error.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access in your browser settings and try again."
          : "Could not open the camera. Check that a camera is connected and try again.",
      );
    }
  };

  const captureCameraImage = () => {
    const video = cameraVideoRef.current;
    if (!video?.videoWidth || !video?.videoHeight) {
      setCameraError("The camera is not ready yet. Please wait and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Could not capture the image. Please try again.");
          return;
        }
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setCapturedImage(file);
        setCapturedReplaceKey(cameraReplaceKey);
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const addFiles = (incoming) => {
    const candidates = Array.from(incoming ?? []);
    const supportedFiles = candidates.filter(isSupportedUpload);
    const byKey = new Map(finalFiles.map((file) => [fileKey(file), file]));
    supportedFiles.forEach((file) => byKey.set(fileKey(file), file));
    const merged = [...byKey.values()];
    if (supportedFiles.length < candidates.length)
      setFileError("Choose PDF or image files.");
    else if (merged.length > MAX_FILES)
      setFileError(`You can attach up to ${MAX_FILES} files.`);
    else setFileError("");

    setFinalFiles((files) => {
      const currentByKey = new Map(files.map((file) => [fileKey(file), file]));
      supportedFiles.forEach((file) => currentByKey.set(fileKey(file), file));
      return [...currentByKey.values()].slice(0, MAX_FILES);
    });
  };

  const acceptCapturedImage = () => {
    if (!capturedImage) return;
    if (capturedReplaceKey) {
      setFinalFiles((files) =>
        files.map((existing) =>
          fileKey(existing) === capturedReplaceKey ? capturedImage : existing,
        ),
      );
    } else {
      addFiles([capturedImage]);
    }
    setCapturedImage(null);
    setCapturedReplaceKey(null);
    setCameraReplaceKey(null);
    window.requestAnimationFrame(() =>
      imageReviewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    );
  };

  const retakeCapturedImage = () => {
    const replaceKey = capturedReplaceKey;
    setCapturedImage(null);
    setCapturedReplaceKey(null);
    openCamera(replaceKey);
  };

  const removeFile = (key) =>
    setFinalFiles((files) => files.filter((f) => fileKey(f) !== key));

  const reorderImage = (targetKey) => {
    if (!draggingImageKey || draggingImageKey === targetKey) return;
    setFinalFiles((files) => {
      const images = files.filter(isImage);
      const from = images.findIndex(
        (file) => fileKey(file) === draggingImageKey,
      );
      const to = images.findIndex((file) => fileKey(file) === targetKey);
      if (from < 0 || to < 0) return files;
      const [moved] = images.splice(from, 1);
      images.splice(to, 0, moved);
      let imageIndex = 0;
      return files.map((file) => (isImage(file) ? images[imageIndex++] : file));
    });
    setDraggingImageKey(null);
    setDragOverImageKey(null);
  };

  const replaceImage = (event) => {
    const [replacement] = Array.from(event.target.files ?? []);
    if (replacement && isImage(replacement) && replaceImageKey) {
      setFinalFiles((files) =>
        files.map((file) =>
          fileKey(file) === replaceImageKey ? replacement : file,
        ),
      );
    } else if (replacement) {
      setFileError("Choose an image file to replace this photo.");
    }
    setReplaceImageKey(null);
    event.target.value = "";
  };

  const convertImagesToPdf = async () => {
    if (!imageFiles.length || isConvertingImages) return;
    setIsConvertingImages(true);
    setFileError("");
    try {
      const firstImageIndex = finalFiles.findIndex(isImage);
      const firstName =
        imageFiles[0].name.replace(/\.[^.]+$/, "") || "Scanned_Documents";
      const pdfFile = await imagesToPdf(imageFiles, `${firstName}.pdf`);
      setFinalFiles((files) => {
        const withoutImages = files.filter((file) => !isImage(file));
        const insertAt = Math.min(firstImageIndex, withoutImages.length);
        return [
          ...withoutImages.slice(0, insertAt),
          pdfFile,
          ...withoutImages.slice(insertAt),
        ];
      });
    } catch (error) {
      setFileError(error.message || "Could not convert the images to PDF.");
    } finally {
      setIsConvertingImages(false);
    }
  };

  const previewPdf = (file) => {
    const previewUrl = URL.createObjectURL(file);
    window.open(previewUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
  };

  const addReportFiles = (incoming) => {
    const candidates = Array.from(incoming ?? []);
    const pdfs = candidates.filter(isPdf);
    const byKey = new Map(reportFiles.map((f) => [fileKey(f), f]));
    pdfs.forEach((f) => byKey.set(fileKey(f), f));
    const merged = [...byKey.values()];

    if (pdfs.length < candidates.length)
      setReportFileError("Only PDF files (.pdf) are accepted.");
    else if (merged.length > MAX_FILES)
      setReportFileError(`You can attach up to ${MAX_FILES} files.`);
    else setReportFileError("");

    setReportFiles(merged.slice(0, MAX_FILES));
  };

  const removeReportFile = (key) =>
    setReportFiles((files) => files.filter((f) => fileKey(f) !== key));

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
  const documentTypeIdentity = [
    submissionDetails?.doc_type_name,
    submissionDetails?.doc_type_id?.name,
    submissionDetails?.doc_type_id?.code,
    submission?.doc_type_name,
    submission?.documentType,
    submission?.doc_type_id?.name,
    submission?.doc_type_id?.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isReport =
    Boolean(submissionDetails?.is_accomplishment_report) ||
    documentTypeIdentity.includes("accomplishment report") ||
    documentTypeIdentity.includes("fm-ustp-osa-04b");
  const defaultFileName = `${submissionDetails?.title || submission?.title || "Submission_Document"}.pdf`;
  const getDriveFileName = (file) => driveFileNames[fileKey(file)] ?? file.name;
  const reportFileNames = reportFiles.length
    ? reportFiles.map(getDriveFileName)
    : (submissionDetails?.documents?.map((d) => d.file_name) ?? []);
  const approvedFileNames = finalFiles.map(getDriveFileName);

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    if (hasUnconvertedImages) {
      setFileError("Convert the selected images to PDF before submitting.");
      return;
    }
    onConfirm({
      finalFiles: finalFiles.map((file) => ({
        file,
        fileName: getDriveFileName(file),
      })),
      reportFiles: reportFiles.map((file) => ({
        file,
        fileName: getDriveFileName(file),
      })),
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
      {capturedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Review captured photo"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.86)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#1e3a8a",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 16,
                }}
              >
                Review your photo
              </h3>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12 }}>
                Retake the photo or add it to your selected images.
              </p>
            </div>
            <ImagePreview file={capturedImage} />
            <span style={{ color: "#475569", fontSize: 12 }}>
              {capturedImage.name}
            </span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={retakeCapturedImage}
                style={{
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  padding: "8px 12px",
                  background: "#fff",
                  color: "#1e3a8a",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Retake photo
              </button>
              <button
                type="button"
                onClick={() => acceptCapturedImage()}
                style={{
                  border: 0,
                  borderRadius: 6,
                  padding: "8px 12px",
                  background: "#1f5cae",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Use this photo
              </button>
            </div>
          </div>
        </div>
      )}
      {isCameraOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.82)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#fff",
              borderRadius: 12,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: "Inter, sans-serif",
                fontSize: 16,
              }}
            >
              Take a photo
            </h3>
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                maxHeight: "60vh",
                background: "#111827",
                borderRadius: 8,
              }}
            />
            {cameraError && (
              <p
                role="alert"
                style={{ color: "#dc2626", margin: 0, fontSize: 12 }}
              >
                {cameraError}
              </p>
            )}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                type="button"
                onClick={stopCamera}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureCameraImage}
                style={{
                  padding: "8px 12px",
                  border: 0,
                  borderRadius: 6,
                  background: "#1f5cae",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Capture photo
              </button>
            </div>
          </div>
        </div>
      )}
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
              <HardDrive
                style={{ width: "18px", height: "18px", color: "#ffffff" }}
              />
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

          {isReport && (
            <div
              style={{
                border: "1.5px solid #bfdbfe",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "#f8fbff",
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
                    fontWeight: 700,
                    color: "#1e3a8a",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Accomplishment Report Document(s)
                </label>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: reportFiles.length ? "#15803d" : "#1e3a8a",
                    background: reportFiles.length ? "#dcfce7" : "#dbeafe",
                    padding: "2px 8px",
                    borderRadius: "99px",
                  }}
                >
                  {reportFiles.length
                    ? `${reportFiles.length} File${reportFiles.length > 1 ? "s" : ""} Selected`
                    : "Saved to Report Folder"}
                </span>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsReportDragging(true);
                }}
                onDragLeave={() => setIsReportDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsReportDragging(false);
                  addReportFiles(e.dataTransfer.files);
                }}
                onClick={() => reportFileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isReportDragging ? "#1f5cae" : "#93c5fd"}`,
                  backgroundColor: isReportDragging ? "#eff6ff" : "#ffffff",
                  borderRadius: "8px",
                  padding: "18px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <input
                  ref={reportFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    addReportFiles(e.target.files);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
                <UploadCloud
                  style={{ width: "18px", height: "18px", color: "#1f5cae" }}
                />
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    margin: 0,
                  }}
                >
                  Click to browse or drop Accomplishment Report PDFs here
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: "#64748b",
                    margin: 0,
                  }}
                >
                  These files are archived in the Accomplishment Report folder,
                  not the Approved subfolder.
                </p>
              </div>
              {reportFiles.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {reportFiles.map((file) => (
                    <SelectedFileRow
                      key={fileKey(file)}
                      file={file}
                      fileName={getDriveFileName(file)}
                      onNameChange={(fileName) =>
                        setDriveFileNames((names) => ({
                          ...names,
                          [fileKey(file)]: fileName,
                        }))
                      }
                      onRemove={() => removeReportFile(fileKey(file))}
                      tag="Report Document"
                    />
                  ))}
                </ul>
              )}
              {reportFileError && (
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: "#dc2626",
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {reportFileError}
                </p>
              )}
            </div>
          )}

          {/* Drop PDF Section (Final Paper Replacement) */}
          {/* Final PDFs (replace the submission's current documents) */}
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
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                {isReport
                  ? "Drop Approved Document(s)"
                  : "Drop PDFs (Final Versions for Drive)"}
              </label>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: finalFiles.length ? "#15803d" : "#6b7280",
                  background: finalFiles.length ? "#f0fdf4" : "#f3f4f6",
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}
              >
                {finalFiles.length
                  ? `${finalFiles.length} File${finalFiles.length > 1 ? "s" : ""} Selected`
                  : isReport
                    ? "Saved to Approved Folder"
                    : "Replaces Old Documents"}
              </span>
            </div>

            {finalFiles.length < MAX_FILES && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
                style={{
                  border: `2px dashed ${isDragging ? "#1f5cae" : "#cbd5e1"}`,
                  backgroundColor: isDragging ? "#f0f5fc" : "#f8fafd",
                  borderRadius: "8px",
                  padding: "18px 14px",
                  textAlign: "center",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf,image/*"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
                <input
                  ref={replaceImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={replaceImage}
                  style={{ display: "none" }}
                />
                <UploadCloud
                  style={{ width: "18px", height: "18px", color: "#1f5cae" }}
                />
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    margin: 0,
                  }}
                >
                  Drop PDFs or images here
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "1px solid #bfdbfe",
                      borderRadius: "6px",
                      padding: "7px 12px",
                      background: "#fff",
                      color: "#1e3a8a",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Select file
                  </button>
                  <button
                    type="button"
                    onClick={() => openCamera()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1px solid #bfdbfe",
                      borderRadius: "6px",
                      padding: "7px 12px",
                      background: "#fff",
                      color: "#1e3a8a",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Camera size={15} /> Open camera
                  </button>
                </div>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: "#64748b",
                    margin: 0,
                  }}
                >
                  {isReport
                    ? `Up to ${MAX_FILES} files. Saved in the Approved folder beside the Accomplishment Report, which is kept as is.`
                    : `Up to ${MAX_FILES} files. Choose PDF or image files. Old files are removed from the system and the new files are uploaded to Drive.`}
                </p>
              </div>
            )}

            {imageFiles.length > 0 && (
              <div
                ref={imageReviewRef}
                style={{
                  border: "1px solid #bfdbfe",
                  borderRadius: 8,
                  padding: 12,
                  background: "#f8fbff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#1e3a8a",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Review selected images
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      color: "#64748b",
                      fontSize: 11,
                    }}
                  >
                    Check each photo, retake or replace it, or add more
                    pictures. Convert the images into a PDF when ready.
                  </p>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(145px, 1fr))",
                    gap: 10,
                  }}
                >
                  {imageFiles.map((file) => (
                    <div
                      key={fileKey(file)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverImageKey(fileKey(file));
                      }}
                      onDragLeave={() =>
                        setDragOverImageKey((key) =>
                          key === fileKey(file) ? null : key,
                        )
                      }
                      onDrop={(event) => {
                        event.preventDefault();
                        reorderImage(fileKey(file));
                      }}
                      style={{
                        minWidth: 0,
                        border: `1px solid ${dragOverImageKey === fileKey(file) ? "#1f5cae" : "#dbeafe"}`,
                        borderRadius: 8,
                        padding: 8,
                        background:
                          dragOverImageKey === fileKey(file)
                            ? "#eff6ff"
                            : "#fff",
                        display: "flex",
                        flexDirection: "column",
                        gap: 7,
                      }}
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingImageKey(fileKey(file));
                        }}
                        onDragEnd={() => {
                          setDraggingImageKey(null);
                          setDragOverImageKey(null);
                        }}
                        aria-label={`Drag to reorder ${file.name}`}
                        title="Drag to change PDF page order"
                        style={{
                          alignSelf: "flex-start",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          border: "1px solid #d1d5db",
                          borderRadius: 5,
                          padding: "3px 6px",
                          background: "#fff",
                          color: "#475569",
                          cursor: "grab",
                          fontSize: 10,
                        }}
                      >
                        <GripVertical size={13} /> Drag to reorder
                      </button>
                      <ImagePreview file={file} />
                      <span
                        title={file.name}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 11,
                          color: "#334155",
                        }}
                      >
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => openCamera(fileKey(file))}
                        style={{
                          border: "1px solid #bfdbfe",
                          borderRadius: 5,
                          padding: "6px 7px",
                          background: "#fff",
                          color: "#1e3a8a",
                          cursor: "pointer",
                          fontSize: 11,
                        }}
                      >
                        Retake with camera
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceImageKey(fileKey(file));
                          replaceImageInputRef.current?.click();
                        }}
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: 5,
                          padding: "6px 7px",
                          background: "#fff",
                          color: "#334155",
                          cursor: "pointer",
                          fontSize: 11,
                        }}
                      >
                        Replace image file
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(fileKey(file))}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "#b91c1c",
                          cursor: "pointer",
                          fontSize: 11,
                        }}
                      >
                        Remove photo
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openCamera()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: "1px solid #bfdbfe",
                      borderRadius: 6,
                      padding: "8px 10px",
                      background: "#fff",
                      color: "#1e3a8a",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    <Camera size={14} /> Take another picture
                  </button>
                  <button
                    type="button"
                    onClick={convertImagesToPdf}
                    disabled={isConvertingImages}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: 0,
                      borderRadius: 6,
                      padding: "8px 10px",
                      background: "#1f5cae",
                      color: "#fff",
                      cursor: isConvertingImages ? "wait" : "pointer",
                      fontWeight: 700,
                      fontSize: 12,
                      opacity: isConvertingImages ? 0.7 : 1,
                    }}
                  >
                    {isConvertingImages ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    {isConvertingImages
                      ? "Converting…"
                      : "Convert images to PDF"}
                  </button>
                </div>
              </div>
            )}

            {finalFiles.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  maxHeight: "180px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {finalFiles.map((file) => (
                  <SelectedFileRow
                    key={fileKey(file)}
                    file={file}
                    fileName={getDriveFileName(file)}
                    onNameChange={(fileName) =>
                      setDriveFileNames((names) => ({
                        ...names,
                        [fileKey(file)]: fileName,
                      }))
                    }
                    onRemove={() => removeFile(fileKey(file))}
                    onPreview={isPdf(file) ? () => previewPdf(file) : undefined}
                  />
                ))}
              </ul>
            )}

            {(fileError || cameraError) && (
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  color: "#dc2626",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {fileError || cameraError}
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
                  <CheckCircle2
                    style={{ width: "12px", height: "12px", color: "#16a34a" }}
                  />
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
                  <AlertCircle
                    style={{ width: "12px", height: "12px", color: "#d97706" }}
                  />
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
                  <HardDrive
                    style={{ width: "16px", height: "16px", color: "#1f5cae" }}
                  />
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#1e3a8a",
                    fontWeight: "600",
                  }}
                >
                  <Folder
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "#3b82f6",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rootFolderName}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      background: "#e2e8f0",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Root
                  </span>
                </div>

                {/* Level 1: Academic Year */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingLeft: "16px",
                    borderLeft: "2px solid #cbd5e1",
                    marginLeft: "7px",
                    color: "#334155",
                    fontWeight: "600",
                  }}
                >
                  <Folder
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {academicYear}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#d97706",
                      background: "#fef3c7",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Year
                  </span>
                </div>

                {/* Level 2: Organization */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    paddingLeft: "32px",
                    borderLeft: "2px solid #cbd5e1",
                    marginLeft: "7px",
                    color: "#334155",
                    fontWeight: "600",
                  }}
                >
                  <Folder
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {orgName}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#1d4ed8",
                      background: "#e0e7ff",
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Organization
                  </span>
                </div>

                {/* Level 3: Document Type */}
                <TreeRow
                  depth={3}
                  icon={Folder}
                  iconColor="#f59e0b"
                  label={docTypeName}
                  tag="File Type"
                  tagColor="#7c3aed"
                  tagBg="#f3e8ff"
                />

                {isReport ? (
                  <>
                    {(reportFileNames.length
                      ? reportFileNames
                      : [defaultFileName]
                    ).map((name) => (
                      <TreeRow
                        key={`report-${name}`}
                        depth={4}
                        icon={FileText}
                        iconColor="#15803d"
                        label={name}
                        tag="Accomplishment Report"
                        tagColor="#1d4ed8"
                        tagBg="#e0e7ff"
                        strong
                      />
                    ))}
                    <TreeRow
                      depth={4}
                      icon={Folder}
                      iconColor="#22c55e"
                      label={APPROVED_FOLDER_NAME}
                      tag="Approved"
                      tagColor="#15803d"
                      tagBg="#dcfce7"
                    />
                    {approvedFileNames.length ? (
                      approvedFileNames.map((name) => (
                        <TreeRow
                          key={`approved-${name}`}
                          depth={5}
                          icon={FileText}
                          iconColor="#15803d"
                          label={name}
                          tag="New Approved Doc"
                          tagColor="#15803d"
                          tagBg="#dcfce7"
                          strong
                        />
                      ))
                    ) : (
                      <TreeRow
                        depth={5}
                        icon={FileText}
                        iconColor="#94a3b8"
                        label="No approved document attached"
                      />
                    )}
                  </>
                ) : (
                  (finalFiles.length
                    ? approvedFileNames
                    : reportFileNames.length
                      ? reportFileNames
                      : [defaultFileName]
                  ).map((name) => (
                    <TreeRow
                      key={name}
                      depth={4}
                      icon={FileText}
                      iconColor="#15803d"
                      label={name}
                      tag={finalFiles.length ? "New Final PDF" : "System PDF"}
                      tagColor="#15803d"
                      tagBg="#dcfce7"
                      strong
                    />
                  ))
                )}
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
              💡 This nested hierarchy is automatically resolved on Google
              Drive.{" "}
              {isReport ? (
                <>
                  The report is archived in the <strong>{docTypeName}</strong>{" "}
                  folder and the approved document in its{" "}
                  <strong>{APPROVED_FOLDER_NAME}</strong> subfolder.
                </>
              ) : (
                <>
                  The new paper will be archived directly inside the{" "}
                  <strong>{docTypeName}</strong> subfolder.
                </>
              )}
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
            disabled={
              isSubmitting || hasUnconvertedImages || isConvertingImages
            }
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: "#031c36",
              background: "#ffc700",
              border: "none",
              borderRadius: "8px",
              padding: "9px 20px",
              cursor:
                isSubmitting || hasUnconvertedImages || isConvertingImages
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isSubmitting || hasUnconvertedImages || isConvertingImages
                  ? 0.5
                  : 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSubmitting ? (
              <Loader2
                className="animate-spin"
                style={{ width: "15px", height: "15px" }}
              />
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
