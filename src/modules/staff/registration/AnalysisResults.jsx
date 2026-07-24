import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import OCRResults from "./components/OCRResults";
import registrationSider from "../../assets/registration_sider.png";
import systemScopeBanner from "../../../assets/shared/systemscope.png";

export default function AnalysisResults() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="registration" profilePath="/staff/profile" />

        <main className="flex-1 overflow-y-auto">
          <div style={{ padding: "20px 24px" }}>
            {/* Page Title */}
            <div style={{ marginBottom: "20px" }}>
              <h2
                className="font-inter font-bold text-[#142d55]"
                style={{ fontSize: "26px", lineHeight: 1.15 }}
              >
                Analysis Results
              </h2>
              <p
                className="font-inter text-gray-500 mt-0.5"
                style={{ fontSize: "13px" }}
              >
                Reviewing extracted entities and document classification
                metrics.
              </p>
            </div>

            {/* Content area — results + side image */}
            <div
              style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
            >
              {/* Left: OCR Results */}
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                <OCRResults />
              </div>

              {/* Right: Side Image */}
              <div
                style={{
                  width: "180px",
                  flexShrink: 0,
                }}
                className="hidden lg:block"
              >
                <img
                  src={registrationSider}
                  alt="Registration illustration"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}
