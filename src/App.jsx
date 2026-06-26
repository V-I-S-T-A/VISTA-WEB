import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './modules/LandingPage'
import LoginPage from './modules/LoginPage'
import AdminDashboard from './modules/admin/Dashboard'
import AdminAuditLogs from './modules/admin/AuditLogs'
import StaffDashboard from './modules/staff/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
