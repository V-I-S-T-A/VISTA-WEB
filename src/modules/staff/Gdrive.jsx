import { PanelSkeleton } from "../../components/loading/Skeleton";
import PageSkeleton from "../../components/loading/PageSkeleton";
import ErrorNotice from "../../components/ErrorNotice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import GdriveHeader from "./gdrive/components/GdriveHeader";
import SecureIntegrationBanner from "./gdrive/components/SecureIntegrationBanner";
import InstitutionalEfficiency from "./gdrive/components/InstitutionalEfficiency";
import GoogleSignInCard from "./gdrive/components/GoogleSignInCard";
import FolderPicker from "./gdrive/components/FolderPicker";
import ConnectedStatusCard from "./gdrive/components/ConnectedStatusCard";
import { useCurrentUser } from "../../hooks/useAuth";
import { useDriveConnection } from "../../hooks/useDrive";
import { useSidebar } from "../../hooks/useSidebar";

import registrationSider from "../assets/registration_sider.png";

export default function Gdrive() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: connection, isLoading: isLoadingConnection, isError, refetch, isFetching } =
    useDriveConnection();
  const [pickingFolder, setPickingFolder] = useState(false);
  const { isOpen, open, close } = useSidebar();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "staff") {
        navigate("/login");
      }
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) return <PageSkeleton />;

  const isConnected = !!connection?.connected;
  const hasFolder = isConnected && !!connection?.folder_id;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header layout="gdrive" profilePath="/staff/profile" onMenuToggle={open} />

        <main className="dashboard-main flex-1 overflow-y-auto overflow-x-hidden">
          <div className="dashboard-page-body page-content-stack" style={{ padding: "20px 24px" }}>
            <GdriveHeader />

            <div
              style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
            >
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                <SecureIntegrationBanner />
                <InstitutionalEfficiency />
                <div style={{ position: "relative" }}>
                  <div
                    className="drive-ambient-glow hidden md:block"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "-20%",
                      width: "600px",
                      height: "600px",
                      background:
                        "radial-gradient(circle, rgba(253, 224, 71, 0.4) 0%, rgba(253, 224, 71, 0) 70%)",
                      transform: "translateY(-50%)",
                      zIndex: 0,
                      pointerEvents: "none",
                      borderRadius: "50%",
                    }}
                  />

                  {isLoadingConnection ? (
                    <PanelSkeleton kind="connection" label="Loading Google Drive connection" />
                  ) : isError ? (
                    <ErrorNotice message="Could not check your Google Drive connection." onRetry={() => refetch()} retrying={isFetching} />
                  ) : !isConnected ? (
                    <GoogleSignInCard />
                  ) : !hasFolder || pickingFolder ? (
                    <FolderPicker onDone={() => setPickingFolder(false)} />
                  ) : (
                    <ConnectedStatusCard
                      connection={connection}
                      onChangeFolder={() => setPickingFolder(true)}
                    />
                  )}
                </div>
              </div>

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
