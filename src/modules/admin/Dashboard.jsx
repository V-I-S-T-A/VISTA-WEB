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

      <div className="flex flex-1 flex-col">
        <Header layout="admin" />

        <main className="flex justify-center p-8 lg:p-12">
          <div className="w-full max-w-[1200px]">
            <div className="w-full">
              <UserManagementHeader />
              <UserSummaryCards />
              <RecentSubmissionsTable />
              <img src={systemScopeBanner} alt="System Scope" className="w-full h-auto" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}