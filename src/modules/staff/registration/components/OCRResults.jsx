import { Loader2 } from "lucide-react";

export default function OCRResults({
  summaryData,
  onApprove,
  onRedo,
  isSubmitting,
}) {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <span
          className="font-inter font-semibold text-[#142d55]"
          style={{ fontSize: "16px" }}
        >
          Review Extracted Details
        </span>
        <p
          className="font-inter text-gray-500 mt-1"
          style={{ fontSize: "13px" }}
        >
          Please verify the information before finalizing the approval.
        </p>
      </div>

      <div
        style={{
          background: "#1f5cae",
          borderRadius: "10px",
          padding: "14px 24px",
          marginBottom: "20px",
        }}
      >
        <p
          className="font-inter font-bold uppercase"
          style={{
            fontSize: "14px",
            letterSpacing: "0.04em",
            color: "#ffffff",
          }}
        >
          Pending Structured Data
        </p>
      </div>

      <div
        style={{
          border: "1.5px solid #e5e7eb",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "28px",
          backgroundColor: "#f8f9fc",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <p
              className="font-inter font-bold text-[#142d55] uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Submitter Name
            </p>
            <div
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 13px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                backgroundColor: "#fff",
              }}
            >
              {summaryData?.submitted_by_name || "Unknown"}
            </div>
          </div>

          <div>
            <p
              className="font-inter font-bold text-[#142d55] uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Date of Submission
            </p>
            <div
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 13px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                backgroundColor: "#fff",
              }}
            >
              {new Date().toLocaleDateString()} (Today)
            </div>
          </div>

          <div>
            <p
              className="font-inter font-bold text-[#142d55] uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Document Type
            </p>
            <div
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 13px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                backgroundColor: "#fff",
              }}
            >
              {summaryData?.doc_type_name || "Unknown"}
            </div>
          </div>

          <div>
            <p
              className="font-inter font-bold text-[#142d55] uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Attached File
            </p>
            <div
              style={{
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 13px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
                color: "#111827",
                backgroundColor: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {summaryData?.file_name || "No File Attached"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={onRedo}
          disabled={isSubmitting}
          className="font-inter font-bold uppercase tracking-wider transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
          style={{
            fontSize: "12px",
            padding: "10px 24px",
            backgroundColor: "#fff",
            color: "#142d55",
            border: "2px solid #142d55",
            borderRadius: "6px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            letterSpacing: "0.06em",
          }}
        >
          Redo
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 font-inter font-bold uppercase tracking-wider transition hover:bg-[#e8b832] active:scale-95 disabled:opacity-50"
          style={{
            fontSize: "12px",
            padding: "10px 24px",
            backgroundColor: "#FDC849",
            color: "#6E5C00",
            border: "2px solid #FDC849",
            borderRadius: "6px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            letterSpacing: "0.06em",
          }}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
