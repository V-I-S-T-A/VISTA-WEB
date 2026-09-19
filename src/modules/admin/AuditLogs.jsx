import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import AuditLogHeader from './auditlogs/components/AuditLogHeader'
import AuditLogDetails from './auditlogs/components/AuditLogDetails'
import { useCurrentUser } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSidebar } from '../../hooks/useSidebar'

export default function AuditLogs() {
    const navigate = useNavigate();
    const { data: currentUser, isLoading } = useCurrentUser();
    const [selectedLog, setSelectedLog] = useState(null);
    const { isOpen, open, close } = useSidebar();

    useEffect(() => {
      if (!isLoading) {
        if (!currentUser || currentUser.role !== "admin") {
          navigate("/login");
        }
      }
    }, [isLoading, currentUser, navigate]);
    return (
        <div className="flex min-h-screen bg-white">
            {isOpen && (
              <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
            )}

            <Sidebar role="admin" isOpen={isOpen} onClose={close} />

            <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
                <Header layout="auditlog" profilePath="/admin/profile" onMenuToggle={open} />

                <main className="dashboard-main flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
                    <div className="w-full">
                        {selectedLog ? (
                          <AuditLogDetails log={selectedLog} onBack={() => setSelectedLog(null)} />
                        ) : (
                          <AuditLogHeader onViewLog={(log) => setSelectedLog(log)} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}