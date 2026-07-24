import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import GdriveHeader from "./gdrive/components/GdriveHeader";
import SecureIntegrationBanner from "./gdrive/components/SecureIntegrationBanner";
import InstitutionalEfficiency from "./gdrive/components/InstitutionalEfficiency";
import GoogleSignInCard from "./gdrive/components/GoogleSignInCard";
import { useCurrentUser } from "../../hooks/useAuth";
import systemScopeBanner from "../../assets/shared/systemscope.png";

import registrationSider from "../assets/registration_sider.png";

export default function Gdrive() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "staff") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="gdrive" profilePath="/staff/profile" />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div style={{ padding: "20px 24px" }}>
            <GdriveHeader />

            <div
              style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
            >
              {/* Left side content */}
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                <SecureIntegrationBanner />
                <InstitutionalEfficiency />
                <div style={{ position: "relative" }}>
                  {/* Yellow glow background effect - hidden on small screens */}
                  <div 
                    className="hidden md:block"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "-20%",
                      width: "600px",
                      height: "600px",
                      background: "radial-gradient(circle, rgba(253, 224, 71, 0.4) 0%, rgba(253, 224, 71, 0) 70%)",
                      transform: "translateY(-50%)",
                      zIndex: 0,
                      pointerEvents: "none",
                      borderRadius: "50%"
                    }}
                  />
                  <GoogleSignInCard />
                </div>
              </div>

              {/* Right side sider image */}
              <div
                style={{ width: "180px", flexShrink: 0 }}
                className="hidden lg:block"
              >
                <img
                  src={registrationSider}
                  alt="Registration illustration"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
