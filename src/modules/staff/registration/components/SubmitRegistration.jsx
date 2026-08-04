import { useRef, useState } from "react";
import { CloudUpload, FileText, X, Loader2 } from "lucide-react";

export default function SubmitRegistration({
  file,
  setFile,
  onSubmit,
  isLoading,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div>
      <p
        className="font-inter font-bold text-[#142d55] uppercase"
        style={{
          fontSize: "12px",
          letterSpacing: "0.04em",
          marginBottom: "8px",
        }}
      >
        Secure File Upload
      </p>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            border: `2px dashed ${isDragging ? "#1f5cae" : "#d1d5db"}`,
            backgroundColor: isDragging ? "#f7f9ff" : "transparent",
            borderRadius: "12px",
            padding: "32px 24px",
            textAlign: "center",
            marginBottom: "28px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1f5cae")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = isDragging
              ? "#1f5cae"
              : "#d1d5db")
          }
        >
          <CloudUpload
            style={{
              width: "36px",
              height: "36px",
              color: isDragging ? "#1f5cae" : "#9ca3af",
              margin: "0 auto 10px",
              transition: "color 0.2s",
            }}
          />
          <p
            className="font-inter font-semibold text-gray-700"
            style={{ fontSize: "13px" }}
          >
            Click to upload or drag and drop
          </p>
          <p
            className="font-inter text-gray-400"
            style={{ fontSize: "11px", marginTop: "4px" }}
          >
            PDF, DOCX, or XLSX up to 50MB
          </p>
        </div>
      ) : (
        <div
          style={{
            border: "1.5px solid #1f5cae",
            backgroundColor: "#f7f9ff",
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px",
                backgroundColor: "#eef2fa",
                borderRadius: "8px",
              }}
            >
              <FileText
                style={{ width: "24px", height: "24px", color: "#1f5cae" }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                className="font-inter font-semibold text-gray-900 truncate"
                style={{ fontSize: "13px" }}
              >
                {file.name}
              </p>
              <p
                className="font-inter text-gray-500"
                style={{ fontSize: "11px", marginTop: "2px" }}
              >
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            style={{
              padding: "6px",
              color: "#9ca3af",
              borderRadius: "6px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".pdf,.docx,.xlsx"
      />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="font-inter font-bold uppercase tracking-wider transition hover:bg-[#e6c900] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          style={{
            fontSize: "13px",
            padding: "10px 28px",
            backgroundColor: "#ffe100",
            color: "#111827",
            border: "2px solid #1f5cae",
            borderRadius: "6px",
            letterSpacing: "0.06em",
          }}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isLoading ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    </div>
  );
}
