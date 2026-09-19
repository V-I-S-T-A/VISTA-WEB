import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SubmissionSummaryCards from "./dashboard/components/UserSummaryCards";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import SubmissionReviewDetails from "./review-panel/components/SubmissionReviewDetails";
import InstitutionalPulse from "./dashboard/components/InstitutionalPulse";
import AuditLogWidget from "./dashboard/components/AuditLogWidget";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";
import systemScopeBanner from "../../assets/shared/systemscope.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "staff") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="staff" profilePath="/staff/profile" onMenuToggle={open} />

        <main
          className="dashboard-main flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "24px 28px" }}
        >
          <div className="w-full">
            {selectedSubmission ? (
              <SubmissionReviewDetails
                submission={selectedSubmission}
                onBack={() => setSelectedSubmission(null)}
              />
            ) : (
              <>
                <SubmissionSummaryCards />

                <div style={{ marginTop: "20px" }}>
                  <RecentSubmissionsTable onViewReview={setSelectedSubmission} />
                </div>

            <div
              className="dashboard-bottom-grid grid grid-cols-2"
              style={{ gap: "16px", marginTop: "20px" }}
            >
              <InstitutionalPulse />
              <AuditLogWidget />
            </div>

                <div style={{ paddingTop: "32px" }}>
                  <img
                    src={systemScopeBanner}
                    alt="System Scope"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

