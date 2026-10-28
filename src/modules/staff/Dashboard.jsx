import { SystemScopeBanner } from "../../components/banners/WorkspaceBanners";
import PageSkeleton from "../../components/loading/PageSkeleton";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SubmissionSummaryCards from "./dashboard/components/UserSummaryCards";
import AnalyticsVisualGraphs from "./dashboard/components/AnalyticsVisualGraphs";
import RecentSubmissionsTable from "./dashboard/components/RecentSubmissionsTable";
import InstitutionalPulse from "./dashboard/components/InstitutionalPulse";
import AuditLogWidget from "./dashboard/components/AuditLogWidget";
import PrioritySubmissionsCard from "../../components/PrioritySubmissionsCard";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { isOpen, open, close } = useSidebar();
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const tableRef = useRef(null);

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "staff") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header
          layout="staff"
          profilePath="/staff/profile"
          onMenuToggle={open}
        />

        <main
          className="dashboard-main flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "24px 28px" }}
        >
          <div className="page-content-stack w-full">
            <SubmissionSummaryCards
              selectedStatus={selectedStatus}
              onSelectStatus={handleStatusSelect}
            />

            <div className="dashboard-section" style={{ marginTop: "20px" }}>
              <AnalyticsVisualGraphs
                selectedStatus={selectedStatus}
                onStatusSelect={handleStatusSelect}
              />
            </div>

            <div ref={tableRef} className="dashboard-section" style={{ marginTop: "20px" }}>
              <RecentSubmissionsTable
                activeStatusFilter={selectedStatus}
                onStatusChange={setSelectedStatus}
              />
            </div>

            <div className="dashboard-section" style={{ marginTop: "20px" }}>
              <PrioritySubmissionsCard role="staff" />
            </div>

            <div
              className="dashboard-section dashboard-bottom-grid grid grid-cols-2"
              style={{ gap: "16px", marginTop: "20px" }}
            >
              <InstitutionalPulse />
              <AuditLogWidget />
            </div>

            <SystemScopeBanner />
          </div>
        </main>
      </div>
    </div>
  );
}
