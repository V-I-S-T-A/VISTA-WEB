import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import UserManagementHeader from "./dashboard/components/UserManagementHeader";
import UserSummaryCards from "./dashboard/components/UserSummaryCards";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import systemScopeBanner from "../../assets/shared/systemscope.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "admin") {
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

      <Sidebar role="admin" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="admin" profilePath="/admin/profile" onMenuToggle={open} />

        <main
          className="dashboard-main flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <UserManagementHeader />
            <UserSummaryCards />
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
