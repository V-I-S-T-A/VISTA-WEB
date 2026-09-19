import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import ReviewTrackerHeader from "./reviewtracker/components/ReviewTrackerHeader";
import ReviewTrackerBanner from "./reviewtracker/components/ReviewTrackerBanner";
import ReviewTrackerTable from "./reviewtracker/components/ReviewTrackerTable";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

export default function ReviewTracker() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "student") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="student" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="student" profilePath="/student/profile" onMenuToggle={open} />

        <main
          className="dashboard-main flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <ReviewTrackerHeader />
            <ReviewTrackerBanner />

            <div style={{ marginTop: "20px" }}>
              <ReviewTrackerTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
