import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import DetailsHeader from "./components/DetailsHeader";
import DetailsNotice from "./components/DetailsNotice";
import DetailsSubmissionInfo from "./components/DetailsSubmissionInfo";
import DetailsStatusHistory from "./components/DetailsStatusHistory";
import DetailsStaffRemarks from "./components/DetailsStaffRemarks";

export default function ReviewTrackerDetails() {
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
            <DetailsHeader />
            <DetailsNotice />
            <DetailsSubmissionInfo />
            <DetailsStatusHistory />
            <DetailsStaffRemarks />
          </div>
        </main>
      </div>
    </div>
  );
}
