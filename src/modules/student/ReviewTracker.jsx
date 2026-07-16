import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useCurrentUser } from "../../hooks/useAuth";

export default function ReviewTracker() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "student") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="student" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="student" profilePath="/student/profile" />
        <main
          className="flex-1 overflow-y-auto bg-[#f7f9fc]"
          style={{ padding: "20px 24px" }}
        >
          <h2
            className="font-inter font-bold text-[#142d55]"
            style={{ fontSize: "26px" }}
          >
            Review Tracker
          </h2>
          <p
            className="font-inter text-gray-500 mt-1"
            style={{ fontSize: "13px" }}
          >
            Coming soon.
          </p>
        </main>
      </div>
    </div>
  );
}
