import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import ProfileBanner from "./profile/components/ProfileBanner";
import ProfileForm from "./profile/components/ProfileForm";
import systemScopeBanner from "../../assets/shared/systemscope.png";
import { useCurrentUser } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "student") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="student" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="profile" />

        <main className="flex-1 overflow-y-auto bg-[#f5f7fb]">
          <div style={{ padding: "20px 24px" }}>
            <ProfileBanner />
            <ProfileForm />

            {/* System Scope Banner */}
            <div style={{ paddingTop: "32px" }}>
              <img
                src={systemScopeBanner}
                alt="System Scope"
                className="w-3/4 h-auto"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
