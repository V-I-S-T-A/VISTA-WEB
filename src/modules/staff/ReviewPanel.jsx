import { SystemScopeBanner } from "../../components/banners/WorkspaceBanners";
import PageSkeleton from "../../components/loading/PageSkeleton";
import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ErrorNotice from "../../components/ErrorNotice";
import { getLoginRedirectPath, getSafeStaffSubmissionTarget } from "../../utils/redirectTarget";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SystemSubmissionsPanel from "./review-panel/components/SystemSubmissionsPanel";
import SubmissionReviewDetails from "./review-panel/components/SubmissionReviewDetails";
import { useCurrentUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

export default function ReviewPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { submissionId } = useParams();
  const { data: currentUser, isLoading } = useCurrentUser();
  const legacySubmission = location.state?.submission;
  const selectedSubmission = submissionId
    ? (legacySubmission?.id === submissionId ? legacySubmission : { id: submissionId })
    : legacySubmission || null;
  const selectedId = submissionId || legacySubmission?.id;
  const validTarget = !selectedId || Boolean(getSafeStaffSubmissionTarget(`/staff/review-panel/${selectedId}`));
  const openSubmission = submission => {
    if (submission?.id) navigate(`/staff/review-panel/${encodeURIComponent(submission.id)}`, { state: { submission } });
  };
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate(getLoginRedirectPath(`${location.pathname}${location.search}`), { replace: true });
    }
    if (!isLoading && currentUser && currentUser.role !== "staff") {
      if (currentUser.role === "admin") navigate("/admin/dashboard");
      else navigate("/login");
    }
  }, [isLoading, currentUser, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!submissionId && legacySubmission?.id && currentUser?.role === "staff") {
      navigate(`/staff/review-panel/${encodeURIComponent(legacySubmission.id)}`, { replace: true, state: location.state });
    }
  }, [submissionId, legacySubmission?.id, currentUser?.role, navigate, location.state]);


  if (isLoading || !currentUser || currentUser.role !== "staff") return <PageSkeleton />;

  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header
          layout="staff"
          profilePath="/staff/profile"
          breadcrumb="Review Panel"
          onMenuToggle={open}
        />

        <main
          className="dashboard-main flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="page-content-stack w-full">
            <div style={{ marginBottom: '20px' }}>
              <h2
                className="font-inter font-bold text-[#142d55]"
                style={{ fontSize: "var(--type-title)", lineHeight: 1.2 }}
              >
                Review Panel
              </h2>
              <p
                className="font-inter text-gray-500 mt-0.5"
                style={{ fontSize: "var(--type-body)" }}
              >
                Updating of submitted document status.
              </p>
            </div>

            {!validTarget ? <div><ErrorNotice message="This submission link is invalid." /><button data-ui="secondary" onClick={() => navigate('/staff/review-panel')}>Return to Review Panel</button></div> : selectedSubmission ? (
              <SubmissionReviewDetails
                key={selectedSubmission.id}
                submission={selectedSubmission}
                onBack={() => navigate('/staff/review-panel')}
              />
            ) : (
              <SystemSubmissionsPanel onViewReview={openSubmission} />
            )}
            <SystemScopeBanner />
          </div>
        </main>
      </div>
    </div>
  );
}
