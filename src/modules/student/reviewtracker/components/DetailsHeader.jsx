import { useNavigate } from "react-router-dom";

export default function DetailsHeader() {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        className="font-inter font-bold text-[#0a1e3f]"
        style={{ fontSize: "28px", lineHeight: 1.15 }}
      >
        Review Tracker Details
      </h2>
      <p
        className="font-inter text-[#0a1e3f] mt-1"
        style={{ fontSize: "16px" }}
      >
        Reviewing of processing status.
      </p>

      <div className="flex items-center gap-4 mt-5">
        <button
          type="button"
          onClick={() => navigate("/student/review-tracker")}
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
            <span style={{ fontSize: "16px", lineHeight: 1 }}>›</span>
            Back
          </div>
        </button>
        <span
          className="font-inter text-[#0a1e3f]"
          style={{ fontSize: "16px", fontWeight: 500 }}
        >
          Review tracker details.
        </span>
      </div>
    </div>
  );
}
