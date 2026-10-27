import { SystemScopeBanner, VerticalBanner } from "../../../components/banners/WorkspaceBanners";
import { useSidebar } from "../../../hooks/useSidebar";
import { useLocation } from "react-router-dom";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import OCRResults from "./components/OCRResults";

export default function AnalysisResults() {
  const { isOpen, open, close } = useSidebar();
  const location = useLocation();
  const submissionId = location.state?.submissionId;
  const ocrConfidence = location.state?.ocrConfidence || 100;

  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />}
      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="registration" profilePath="/staff/profile" onMenuToggle={open} />

        <main className="dashboard-main flex-1 overflow-y-auto">
          <div className="dashboard-page-body page-content-stack" style={{ padding: "20px 24px" }}>
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
            <div className="workspace-illustrated-layout">
              {/* Left: OCR Results */}
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                {/* Pass the submissionId down to the OCRResults component */}
                <OCRResults
                  submissionId={submissionId}
                  ocrConfidence={ocrConfidence}
                />{" "}
              </div>

              {/* Right: Side Image */}
              <VerticalBanner />
            </div>
            <SystemScopeBanner />
          </div>
        </main>
      </div>
    </div>
  );
}
