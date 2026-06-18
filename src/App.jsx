import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './modules/LandingPage'
import LoginPage from './modules/LoginPage'
import Dashboard from './modules/admin/Dashboard'
import AuditLogs from './modules/admin/AuditLogs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
