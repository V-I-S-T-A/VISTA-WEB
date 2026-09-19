import { useNavigate } from "react-router-dom";
import { BackButton } from "../../../../components";

export default function DetailsHeader({ submission }) {
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
        <BackButton onClick={() => navigate("/student/review-tracker")} />
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
