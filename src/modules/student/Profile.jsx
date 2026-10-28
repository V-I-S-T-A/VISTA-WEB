import { ProfileBannerLayout } from "../../components/banners/WorkspaceBanners";
import PageSkeleton from "../../components/loading/PageSkeleton";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import ProfileBanner from "./profile/components/ProfileBanner";
import ProfileForm from "./profile/components/Profileform";
import StudentNotificationsCard from "./profile/components/StudentNotificationsCard";
import { useCurrentUser } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSidebar } from "../../hooks/useSidebar";

export default function Profile() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "student") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return <PageSkeleton />;


  return (
    <div className="flex min-h-screen bg-white">
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="student" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="profile" profilePath="/student/profile" onMenuToggle={open} />

        <main className="dashboard-main flex-1 overflow-y-auto bg-[#f5f7fb]">
          <div className="dashboard-page-body profile-page-body page-content-stack" style={{ padding: "20px 24px" }}>
            <ProfileBanner />
            <div className="student-profile-layout">
              <div className="student-profile-info">
                <ProfileBannerLayout><ProfileForm /></ProfileBannerLayout>
              </div>
              <StudentNotificationsCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
