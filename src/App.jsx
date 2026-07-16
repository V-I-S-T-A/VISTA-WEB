import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./modules/LandingPage";
import LoginPage from "./modules/LoginPage";
import AdminDashboard from "./modules/admin/Dashboard";
import AdminAuditLogs from "./modules/admin/AuditLogs";
import AdminProfile from "./modules/admin/Profile";
import StaffDashboard from "./modules/staff/Dashboard";
import StaffRegistration from "./modules/staff/Registration";
import StaffAnalysisResults from "./modules/staff/registration/AnalysisResults";
import StaffAuditLogs from "./modules/staff/AuditLogs";
import StaffProfile from "./modules/staff/Profile";
import StaffReviewPanel from "./modules/staff/ReviewPanel";
import StudentDashboard from "./modules/student/Dashboard";
import StudentReviewTracker from "./modules/student/ReviewTracker";
import StudentProfile from "./modules/student/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/registration" element={<StaffRegistration />} />
        <Route
          path="/staff/registration/analysis-results"
          element={<StaffAnalysisResults />}
        />
        <Route path="/staff/audit-logs" element={<StaffAuditLogs />} />
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/review-panel" element={<StaffReviewPanel />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route
          path="/student/review-tracker"
          element={<StudentReviewTracker />}
        />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
