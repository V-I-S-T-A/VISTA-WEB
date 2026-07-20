import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import DashboardBanner from "./dashboard/components/DashboardBanner";
import SubmissionSummaryCards from "./dashboard/components/SubmissionSummaryCards";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import systemScopeBanner from "../../assets/shared/systemscope.png";
import { useCurrentUser } from "../../hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

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
      <Sidebar role="student" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="student" profilePath="/student/profile" />

        <main
          className="flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <DashboardBanner />

            <div style={{ marginTop: "20px" }}>
              <SubmissionSummaryCards />
            </div>

            <div style={{ marginTop: "20px" }}>
              <RecentSubmissionsTable />
            </div>

            <div style={{ paddingTop: "32px" }}>
              <img
                src={systemScopeBanner}
                alt="System Scope"
                className="w-3/4 h-auto"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
