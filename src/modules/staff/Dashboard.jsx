import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SubmissionManagementHeader from "./dashboard/components/SubmissionManagementHeader";
import SubmissionSummaryCards from "./dashboard/components/UserSummaryCards";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import { useCurrentUser } from "../../hooks/useAuth";
import systemScopeBanner from "../../assets/shared/systemscope.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/login");
    }
    // If user is loaded but is NOT staff, redirect appropriately
    if (!isLoading && currentUser && currentUser.role !== "staff") {
      if (currentUser.role === "admin") navigate("/admin/dashboard");
      else navigate("/login");
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="staff" profilePath="/staff/profile" />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <SubmissionManagementHeader />
            <SubmissionSummaryCards />
            <RecentSubmissionsTable />
            <div style={{ paddingTop: "48px" }}>
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
