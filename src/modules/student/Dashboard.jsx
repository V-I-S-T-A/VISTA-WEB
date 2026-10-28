import { SystemScopeBanner } from "../../components/banners/WorkspaceBanners";
import PageSkeleton from "../../components/loading/PageSkeleton";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import DashboardBanner from "./dashboard/components/DashboardBanner";
import SubmissionSummaryCards from "./dashboard/components/SubmissionSummaryCards";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import PrioritySubmissionsCard from "../../components/PrioritySubmissionsCard";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

export default function Dashboard() {
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

  if (isLoading) return <PageSkeleton />;

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
          <div className="page-content-stack w-full">
            <DashboardBanner />

            <div className="dashboard-section" style={{ marginTop: "20px" }}>
              <SubmissionSummaryCards />
            </div>

            <div className="dashboard-section" style={{ marginTop: "20px" }}>
              <PrioritySubmissionsCard role="student" />
            </div>

            <div className="dashboard-section" style={{ marginTop: "20px" }}>
              <RecentSubmissionsTable />
            </div>

            <SystemScopeBanner />
          </div>
        </main>
      </div>
    </div>
  );
}
