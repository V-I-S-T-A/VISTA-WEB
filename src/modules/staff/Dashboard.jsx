import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SubmissionSummaryCards from "./dashboard/components/UserSummaryCards";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import InstitutionalPulse from "./dashboard/components/InstitutionalPulse";
import AuditLogWidget from "./dashboard/components/AuditLogWidget";
import { useCurrentUser } from "../../hooks/useAuth";
import systemScopeBanner from "../../assets/shared/systemscope.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

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
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="staff" profilePath="/staff/profile" />

        <main
          className="flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "24px 28px" }}
        >
          <div className="w-full">
            <SubmissionSummaryCards />

            <div style={{ marginTop: "20px" }}>
              <RecentSubmissionsTable />
            </div>

            <div
              className="grid grid-cols-2"
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
          </div>
        </main>
      </div>
    </div>
  );
}
