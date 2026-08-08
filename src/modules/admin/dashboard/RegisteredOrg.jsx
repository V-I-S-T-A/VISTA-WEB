import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import RegisteredOrgHeader from "./components/RegisteredOrgHeader";
import RegisteredOrgTable from "./components/RegisteredOrgTable";
import systemScopeBanner from "../../../assets/shared/systemscope.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useAuth";

export default function RegisteredOrg() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

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
      <Sidebar role="admin" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="admin" profilePath="/admin/profile" />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <RegisteredOrgHeader />
            <RegisteredOrgTable />
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
