import { SystemScopeBanner } from "../../../components/banners/WorkspaceBanners";
import PageSkeleton from "../../../components/loading/PageSkeleton";
import { getApiErrorMessage } from "../../../utils/apiErrorMessage";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { submissionService } from "../../../services/submissionService";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import DetailsHeader from "./components/DetailsHeader";
import DetailsNotice from "./components/DetailsNotice";
import DetailsSubmissionInfo from "./components/DetailsSubmissionInfo";
import DetailsStatusHistory from "./components/DetailsStatusHistory";
import { useSidebar } from "../../../hooks/useSidebar";
import { useCurrentUser } from "../../../hooks/useAuth";
import { getLoginRedirectPath } from "../../../utils/redirectTarget";

export default function ReviewTrackerDetails() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, open, close } = useSidebar();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // BULLETPROOF ID EXTRACTION:
  // Grabs the ID from params, OR forcefully extracts it from the end of the URL
  // just in case your App.jsx route parameter is named something else.
  const id =
    params.id || params.submissionId || location.pathname.split("/").pop();

  useEffect(() => {
    if (isLoadingUser) return;
    if (!currentUser) navigate(getLoginRedirectPath(`${location.pathname}${location.search}`), { replace: true });
  }, [currentUser, isLoadingUser, location.pathname, location.search, navigate]);

  const {
    data: submission,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionService.getSubmissionById(id),
    enabled: !!id && currentUser?.role === "student",
  });

  useEffect(() => {
    const status = error?.response?.status;
    if ([401, 403, 404].includes(status)) queryClient.removeQueries({ queryKey: ["submission", id], exact: true });
  }, [error, id, queryClient]);

  if (isLoadingUser || (currentUser?.role === "student" && isLoading)) return <PageSkeleton />;

  if (currentUser && currentUser.role !== "student") {
    const home = currentUser.role === "admin" ? "/admin/dashboard" : "/staff/dashboard";
    return <div className="flex min-h-screen items-center justify-center bg-white p-6"><div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"><h2 className="mb-2 text-xl font-bold text-amber-900">Student account required</h2><p role="alert" className="text-gray-700">This submission link is available to its student owner after sign in.</p><button onClick={() => navigate(home, { replace: true })} className="mt-5 rounded-full bg-[#1f5cae] px-6 py-2 font-bold text-white">Continue</button></div></div>;
  }

  if (!currentUser) return <PageSkeleton />;

  if (isError || !submission) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center flex-col gap-4">
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center max-w-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Unable to load submission
          </h2>
          <p role="alert" className="text-gray-700 mb-4">
            {getApiErrorMessage(error, "We could not load this submission. Please return to the tracker and try again.")}
          </p>

          <button
            onClick={() => navigate("/student/review-tracker")}
            className="px-6 py-2 bg-[#1f5cae] text-white font-bold rounded-full hover:bg-[#164385] transition"
          >
            Return to Tracker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="student" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="student" profilePath="/student/profile" onMenuToggle={open} />

        <main
          className="dashboard-main flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "20px 24px" }}
        >
          <div className="page-content-stack w-full">
            <DetailsHeader submission={submission} />
            <DetailsNotice status={submission.status} />
            <DetailsSubmissionInfo submission={submission} isOwner={String(submission.submitted_by) === String(currentUser.user_id)} />
            <DetailsStatusHistory submissionId={submission.submission_id} />
            <SystemScopeBanner />
          </div>
        </main>
      </div>
    </div>
  );
}
