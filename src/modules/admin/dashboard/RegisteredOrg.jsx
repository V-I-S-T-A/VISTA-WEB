import { useSidebar } from "../../../hooks/useSidebar";
import PageSkeleton from "../../../components/loading/PageSkeleton";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import RegisteredOrgHeader from "./components/RegisteredOrgHeader";
import RegisteredOrgTable from "./components/RegisteredOrgTable";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useAuth";

export default function RegisteredOrg() {
  const { isOpen, open, close } = useSidebar();
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "admin") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />}
      <Sidebar role="admin" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="admin" profilePath="/admin/profile" onMenuToggle={open} />

        <main
          className="dashboard-main flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="page-content-stack w-full">
            <RegisteredOrgHeader />
            <RegisteredOrgTable />
          </div>
        </main>
      </div>
    </div>
  );
}
