import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import AuditLogHeader from './auditlogs/components/AuditLogHeader'
import { useCurrentUser } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function AuditLogs() {
    const navigate = useNavigate();
    const { data: currentUser, isLoading } = useCurrentUser();

    useEffect(() => {
      if (!isLoading) {
        if (!currentUser || currentUser.role !== "admin") {
          navigate("/login");
        }
      }
    }, [isLoading, currentUser, navigate]);
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar role="admin" />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header layout="auditlog" />

                <main className="flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
                    <div className="w-full">
                        <AuditLogHeader />
                    </div>
                </main>
            </div>
        </div>
    )
}