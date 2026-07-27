import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { submissionService } from "../../../services/submissionService";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import DetailsHeader from "./components/DetailsHeader";
import DetailsNotice from "./components/DetailsNotice";
import DetailsSubmissionInfo from "./components/DetailsSubmissionInfo";
import DetailsStatusHistory from "./components/DetailsStatusHistory";
import DetailsStaffRemarks from "./components/DetailsStaffRemarks";
import { Loader2 } from "lucide-react";

export default function ReviewTrackerDetails() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // BULLETPROOF ID EXTRACTION:
  // Grabs the ID from params, OR forcefully extracts it from the end of the URL
  // just in case your App.jsx route parameter is named something else.
  const id =
    params.id || params.submissionId || location.pathname.split("/").pop();

  const {
    data: submission,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionService.getSubmissionById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#1f5cae]" />
      </div>
    );
  }

  // ENHANCED ERROR SCREEN: This will tell us exactly why it is failing!
  if (isError || !submission) {
    return (
      <div className="flex min-h-screen bg-white items-center justify-center flex-col gap-4">
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center max-w-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Submission Not Found
          </h2>
          <p className="text-gray-700 mb-4">
            We could not load this document's details.
          </p>

          <div className="bg-white p-4 rounded text-left border border-gray-200 mb-6 shadow-inner text-sm font-mono text-gray-600">
            <p>
              <strong>Extracted URL ID:</strong> {id || "UNDEFINED"}
            </p>
            {error && (
              <p className="mt-2 text-red-600">
                <strong>Backend Error:</strong> {error.message}
              </p>
            )}
          </div>

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
      <Sidebar role="student" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="student" profilePath="/student/profile" />

        <main
          className="flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <DetailsHeader submission={submission} />
            <DetailsNotice status={submission.status} />
            <DetailsSubmissionInfo submission={submission} />
            <DetailsStatusHistory submissionId={submission.submission_id} />
            <DetailsStaffRemarks submissionId={submission.submission_id} />
          </div>
        </main>
      </div>
    </div>
  );
}
