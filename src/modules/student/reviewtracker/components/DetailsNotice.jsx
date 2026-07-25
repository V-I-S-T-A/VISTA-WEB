import { Info } from "lucide-react";

export default function DetailsNotice() {
  return (
    <div
      style={{
        backgroundColor: "#edf2fb",
        borderRadius: "12px",
        border: "1px solid #dbe4f0",
        borderLeft: "4px solid #1A59A5",
        padding: "20px 24px",
        marginBottom: "20px",
      }}
    >
      <div className="flex gap-3">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "9999px",
            border: "2px solid #94a3b8",
            marginTop: "2px",
          }}
        >
          <Info
            style={{ width: "14px", height: "14px", color: "#64748b" }}
          />
        </div>
        <div>
          <h4
            className="font-inter font-bold text-[#142d55]"
            style={{ fontSize: "14px", marginBottom: "6px" }}
          >
            Physical Submission Tracker Notice
          </h4>
          <p
            className="font-inter text-gray-500"
            style={{ fontSize: "13px", lineHeight: 1.65 }}
          >
            This record tracks paper files submitted at the OSA office. Digital
            copies are not stored on this system to protect original physical
            signatures and institutional security. Tracking here ensures you know
            the exact location and status of your physical documents.
          </p>
        </div>
      </div>
    </div>
  );
}
