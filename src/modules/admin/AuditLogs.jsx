import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import AuditLogHeader from './auditlogs/components/AuditLogHeader'

export default function AuditLogs() {
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