import { lazy, Suspense } from "react";
import PageSkeleton from "./components/loading/PageSkeleton";
import PublicLayout from "./components/PublicLayout";
import RouteFrame from "./components/RouteFrame";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const LandingPage = lazy(() => import("./modules/LandingPage"));
const GetApp = lazy(() => import("./modules/GetApp"));
const LoginPage = lazy(() => import("./modules/LoginPage"));
const PrivacyPolicy = lazy(() => import("./modules/LegalPages").then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./modules/LegalPages").then(module => ({ default: module.TermsOfService })));
const AdminDashboard = lazy(() => import("./modules/admin/Dashboard"));
const AdminRegisteredOrg = lazy(() => import("./modules/admin/dashboard/RegisteredOrg"));
const AdminAuditLogs = lazy(() => import("./modules/admin/AuditLogs"));
const AdminProfile = lazy(() => import("./modules/admin/Profile"));
const AdminRegistrationConfig = lazy(() => import("./modules/admin/RegistrationConfig"));
const StaffDashboard = lazy(() => import("./modules/staff/Dashboard"));
const StaffRegistration = lazy(() => import("./modules/staff/Registration"));
const StaffAnalysisResults = lazy(() => import("./modules/staff/registration/AnalysisResults"));
const StaffAuditLogs = lazy(() => import("./modules/staff/AuditLogs"));
const StaffProfile = lazy(() => import("./modules/staff/Profile"));
const StaffReviewPanel = lazy(() => import("./modules/staff/ReviewPanel"));
const StaffGdrive = lazy(() => import("./modules/staff/Gdrive"));
const StudentDashboard = lazy(() => import("./modules/student/Dashboard"));
const StudentReviewTracker = lazy(() => import("./modules/student/ReviewTracker"));
const StudentReviewTrackerDetails = lazy(() => import("./modules/student/reviewtracker/ReviewTrackerDetails"));
const StudentProfile = lazy(() => import("./modules/student/Profile"));
const StudentAuditLogs = lazy(() => import("./modules/student/AuditLogs"));
const StaffGdriveCallback = lazy(() => import("./modules/staff/gdrive/GdriveCallback"));
import {useDriveUploadWatcher} from "./hooks/useBackgroundDriveUpload";
import StaffNotificationToasts from "./components/StaffNotificationToasts";

function App() {
  useDriveUploadWatcher(); // Start the background drive upload watcher
  return (
    <BrowserRouter>
      <RouteFrame>
      <StaffNotificationToasts />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-app" element={<GetApp />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>
        <Route path="/admin/dashboard" element={<Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense>} />
        <Route
          path="/admin/dashboard/registeredorg"
          element={<Suspense fallback={<PageSkeleton />}><AdminRegisteredOrg /></Suspense>}
        />
        <Route path="/admin/audit-logs" element={<Suspense fallback={<PageSkeleton />}><AdminAuditLogs /></Suspense>} />
        <Route path="/admin/profile" element={<Suspense fallback={<PageSkeleton />}><AdminProfile /></Suspense>} />
        <Route
          path="/admin/registration-config"
          element={<Suspense fallback={<PageSkeleton />}><AdminRegistrationConfig /></Suspense>}
        />{" "}
        <Route path="/staff/dashboard" element={<Suspense fallback={<PageSkeleton />}><StaffDashboard /></Suspense>} />
        <Route path="/staff/registration" element={<Suspense fallback={<PageSkeleton />}><StaffRegistration /></Suspense>} />
        <Route
          path="/staff/registration/analysis-results"
          element={<Suspense fallback={<PageSkeleton />}><StaffAnalysisResults /></Suspense>}
        />
        <Route path="/staff/audit-logs" element={<Suspense fallback={<PageSkeleton />}><StaffAuditLogs /></Suspense>} />
        <Route path="/staff/profile" element={<Suspense fallback={<PageSkeleton />}><StaffProfile /></Suspense>} />
        <Route path="/staff/review-panel" element={<Suspense fallback={<PageSkeleton />}><StaffReviewPanel /></Suspense>} />
        <Route path="/staff/gdrive-sync" element={<Suspense fallback={<PageSkeleton />}><StaffGdrive /></Suspense>} />
        <Route
          path="/staff/gdrive-sync/callback"
          element={<Suspense fallback={<PageSkeleton />}><StaffGdriveCallback /></Suspense>}
        />
        <Route path="/student/dashboard" element={<Suspense fallback={<PageSkeleton />}><StudentDashboard /></Suspense>} />
        <Route
          path="/student/review-tracker"
          element={<Suspense fallback={<PageSkeleton />}><StudentReviewTracker /></Suspense>}
        />
        <Route
          path="/student/review-tracker/:submissionId"
          element={<Suspense fallback={<PageSkeleton />}><StudentReviewTrackerDetails /></Suspense>}
        />
        <Route path="/student/audit-logs" element={<Suspense fallback={<PageSkeleton />}><StudentAuditLogs /></Suspense>} />
        <Route path="/student/profile" element={<Suspense fallback={<PageSkeleton />}><StudentProfile /></Suspense>} />
      </Routes>
      </RouteFrame>
    </BrowserRouter>
  );
}

export default App;
