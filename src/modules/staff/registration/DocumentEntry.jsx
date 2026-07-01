import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import DocumentEntryHeader from "./components/DocumentEntryHeader";
import SubmitRegistration from "./components/SubmitRegistration";
import registrationSider from "../../assets/registration_sider.png";
import systemScopeBanner from "../../../assets/shared/systemscope.png";

export default function DocumentEntry() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="registration" profilePath="/staff/profile" />

        <main className="flex-1 overflow-y-auto">
          <div style={{ padding: "20px 24px" }}>
            <DocumentEntryHeader />

            {/* Content area — form + side image */}
            <div
              style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
            >
              {/* Left: Form */}
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                {/* Form Card */}
                <div
                  style={{
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "28px 28px 20px",
                    marginBottom: "24px",
                  }}
                >
                  {/* Row 1: Organization + Submitted By */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <p
                        className="font-inter font-bold text-[#142d55] uppercase"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.04em",
                          marginBottom: "6px",
                        }}
                      >
                        Organization
                      </p>
                      <div
                        style={{
                          border: "1.5px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "9px 13px",
                          fontSize: "13px",
                          fontFamily: "Inter, sans-serif",
                          color: "#9ca3af",
                          backgroundColor: "#fff",
                        }}
                      >
                        Select Institution
                      </div>
                    </div>
                    <div>
                      <p
                        className="font-inter font-bold text-[#142d55] uppercase"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.04em",
                          marginBottom: "6px",
                        }}
                      >
                        Submitted By
                      </p>
                      <div
                        style={{
                          border: "1.5px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "9px 13px",
                          fontSize: "13px",
                          fontFamily: "Inter, sans-serif",
                          color: "#9ca3af",
                          backgroundColor: "#fff",
                        }}
                      >
                        Select Institution
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Academic Year + Document Type */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <p
                        className="font-inter font-bold text-[#142d55] uppercase"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.04em",
                          marginBottom: "6px",
                        }}
                      >
                        Academic Year
                      </p>
                      <div
                        style={{
                          border: "1.5px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "9px 13px",
                          fontSize: "13px",
                          fontFamily: "Inter, sans-serif",
                          color: "#9ca3af",
                          backgroundColor: "#fff",
                        }}
                      >
                        Enter academic year
                      </div>
                    </div>
                    <div>
                      <p
                        className="font-inter font-bold text-[#142d55] uppercase"
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.04em",
                          marginBottom: "6px",
                        }}
                      >
                        Document Type
                      </p>
                      <div
                        style={{
                          border: "1.5px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "9px 13px",
                          fontSize: "13px",
                          fontFamily: "Inter, sans-serif",
                          color: "#9ca3af",
                          backgroundColor: "#fff",
                        }}
                      >
                        Select Type
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Category (half-width) */}
                  <div style={{ marginBottom: "20px" }}>
                    <p
                      className="font-inter font-bold text-[#142d55] uppercase"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.04em",
                        marginBottom: "6px",
                      }}
                    >
                      Category
                    </p>
                    <div
                      style={{
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        padding: "9px 13px",
                        fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        color: "#9ca3af",
                        backgroundColor: "#fff",
                        maxWidth: "220px",
                      }}
                    >
                      Select Type
                    </div>
                  </div>

                  {/* Document Title (full-width) */}
                  <div style={{ marginBottom: "24px" }}>
                    <p
                      className="font-inter font-bold text-[#142d55] uppercase"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.04em",
                        marginBottom: "6px",
                      }}
                    >
                      Document Title
                    </p>
                    <div
                      style={{
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        padding: "9px 13px",
                        fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        color: "#9ca3af",
                        backgroundColor: "#fff",
                      }}
                    >
                      e.g. Q4 Financial Analysis Report
                    </div>
                  </div>

                  {/* Secure File Upload + Submit */}
                  <SubmitRegistration
                    onSubmit={() =>
                      navigate("/staff/registration/analysis-results")
                    }
                  />
                </div>
              </div>

              {/* Right: Side Image */}
              <div
                style={{
                  width: "180px",
                  flexShrink: 0,
                }}
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

            {/* System Scope Banner */}
            <div style={{ paddingTop: "48px" }}>
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
