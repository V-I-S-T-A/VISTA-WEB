import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import UserManagementHeader from './components/dashboard/UserManagementHeader'
import UserSummaryCards from './components/dashboard/UserSummaryCards'
import RecentSubmissionsTable from './components/dashboard/RecentSubmissionsTable'
import systemScopeBanner from '../../assets/shared/systemscope.png'

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="admin" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="admin" />

        <main className="flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
          <div className="w-full">
            <UserManagementHeader />
            <UserSummaryCards />
            <RecentSubmissionsTable />
            <div
              style={{
                paddingTop: '48px',
              }}
            >
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
  )
}