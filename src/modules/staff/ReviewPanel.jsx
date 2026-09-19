import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SystemSubmissionsPanel from "./review-panel/components/SystemSubmissionsPanel";
import SubmissionReviewDetails from "./review-panel/components/SubmissionReviewDetails";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

export default function ReviewPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser, isLoading } = useCurrentUser();
  const [selectedSubmission, setSelectedSubmission] = useState(
    location.state?.submission || null
  );
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/login");
    }
    if (!isLoading && currentUser && currentUser.role !== "staff") {
      if (currentUser.role === "admin") navigate("/admin/dashboard");
      else navigate("/login");
    }
  }, [isLoading, currentUser, navigate]);


  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header
          layout="staff"
          profilePath="/staff/profile"
          breadcrumb="Review Panel"
          onMenuToggle={open}
        />

        <main
          className="dashboard-main flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <div style={{ marginBottom: '20px' }}>
              <h2
                className="font-inter font-bold text-[#142d55]"
                style={{ fontSize: '26px', lineHeight: 1.15 }}
              >
                Review Panel
              </h2>
              <p
                className="font-inter text-gray-500 mt-0.5"
                style={{ fontSize: '13px' }}
              >
                Updating of submitted document status.
              </p>
            </div>

            {selectedSubmission ? (
              <SubmissionReviewDetails
                submission={selectedSubmission}
                onBack={() => {
                  setSelectedSubmission(null);
                  if (location.state?.submission) {
                    window.history.replaceState({}, document.title);
                  }
                }}
              />
            ) : (
              <SystemSubmissionsPanel onViewReview={setSelectedSubmission} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
