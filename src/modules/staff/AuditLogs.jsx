import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import AuditLogTable from "./auditlogs/components/AuditLogTable";
import AuditLogDetails from "./auditlogs/components/AuditLogDetails";
import AuditLogHeader from "./auditlogs/components/AuditLogHeader";
import { useCurrentUser } from "../../hooks/useAuth";
import systemScopeBanner from "../../assets/shared/systemscope.png";

export default function AuditLogs() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/login");
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="staff" />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <AuditLogHeader />
            {selectedLog ? (
              <AuditLogDetails
                log={selectedLog}
                onBack={() => setSelectedLog(null)}
              />
            ) : (
              <AuditLogTable onViewLog={(log) => setSelectedLog(log)} />
            )}

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
