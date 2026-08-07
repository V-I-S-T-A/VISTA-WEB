import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import api from "./../../../lib/axios";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import DocumentEntryHeader from "./components/DocumentEntryHeader";
import SubmitRegistration from "./components/SubmitRegistration";
import registrationSider from "../../assets/registration_sider.png";

export default function DocumentEntry() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    org_id: "",
    submitted_by: "",
    academic_year_id: "",
    doc_type_id: "",
    category_id: "",
    title: "",
  });

  // 1. FETCH ALL DROPDOWNS SECURELY FROM DJANGO (Prevents UUID errors)
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [orgRes, userRes, acadRes, docTypeRes, catRes] =
          await Promise.all([
            api.get("/organizations/"),
            api.get("/users/"),
            api.get("/academic-years/"),
            api.get("/document-types/"),
            api.get("/categories/"),
          ]);

        setOrganizations(orgRes.data.results || orgRes.data || []);
        setUsers(userRes.data.results || userRes.data || []);
        setAcademicYears(acadRes.data.results || acadRes.data || []);
        setDocumentTypes(docTypeRes.data.results || docTypeRes.data || []);
        setCategories(catRes.data.results || catRes.data || []);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };
    fetchDropdowns();
  }, []);

  // 2. STRICT USER FILTERING
  const availableUsers = useMemo(() => {
    if (!formData.org_id) return [];
    return users.filter((u) => String(u.org_id) === String(formData.org_id));
  }, [users, formData.org_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "org_id") {
      setFormData((prev) => ({ ...prev, [name]: value, submitted_by: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  // 3. OCR AUTOFILL INTEGRATION
  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    if (!uploadedFile) return;

    setIsScanning(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);

      // Hit the Django OCR autofill endpoint immediately on upload
      const res = await api.post("/submissions/autofill/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const draft = res.data;

      // Auto-fill the form fields based on the OCR matches
      if (draft.status === "draft_pending_review") {
        setFormData((prev) => ({
          ...prev,
          org_id: draft.suggested_org_id || prev.org_id,
          doc_type_id: draft.suggested_doc_type_id || prev.doc_type_id,
          category_id: draft.suggested_category_id || prev.category_id,
          // FIX: The new OCR display name now overwrites the old title
          title: draft.display_name || prev.title || "",
        }));
      }
    } catch (err) {
      console.error("OCR Failed:", err);
      setError(
        "OCR Engine failed to read the document. You can still select the fields manually.",
      );
    } finally {
      setIsScanning(false);
    }
  };

  // 4. SUBMIT FORM (WITH CLOUDINARY BYPASS)
  const handleSubmit = async () => {
    if (
      !formData.org_id ||
      !formData.submitted_by ||
      !formData.academic_year_id ||
      !formData.doc_type_id ||
      !formData.category_id ||
      !formData.title.trim()
    ) {
      setError("Please fill out all fields before submitting.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const submissionRes = await api.post("/submissions/", {
        ...formData,
        description: "Direct Staff Upload (OCR Processed)",
      });

      const submissionId = submissionRes.data.submission_id;

      if (file) {
        try {
          const cloudinaryData = new FormData();
          cloudinaryData.append("file", file);
          // CRITICAL: You must create an unsigned upload preset named "vista_uploads" in Cloudinary
          cloudinaryData.append("upload_preset", "vista_uploads");

          const cloudName = "djtdar2ex"; // Your actual cloud name
          const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            {
              method: "POST",
              body: cloudinaryData,
            },
          );

          const cloudinaryJson = await cloudinaryRes.json();

          if (cloudinaryJson.secure_url) {
            // Save the real Cloudinary URL to Django
            await api.post("/documents/", {
              submission_id: submissionId,
              file_name: file.name,
              file_url: cloudinaryJson.secure_url,
              mime_type: file.type || "application/pdf",
              file_size_kb: Math.max(1, Math.round(file.size / 1024)),
            });
          } else {
            throw new Error(JSON.stringify(cloudinaryJson));
          }
        } catch (docErr) {
          console.error("Cloudinary upload failed:", docErr);
          alert(
            "Submission created but file failed to upload to Cloudinary. Check your upload preset.",
          );
        }
      }
      // Navigate directly to the Analysis Results Page
      navigate("/staff/registration/analysis-results", {
        state: { submissionId },
      });
    } catch (err) {
      console.error("Submission failed:", err);
      let errorMessage =
        "An error occurred while creating the submission in the database.";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) {
            errorMessage = data[firstKey][0];
          } else if (typeof data[firstKey] === "string") {
            errorMessage = data[firstKey];
          }
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyle = (fieldValue) => ({
    width: "100%",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "13px",
    fontFamily: "Inter, sans-serif",
    color: fieldValue ? "#111827" : "#9ca3af",
    backgroundColor: "#fff",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  });

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="staff" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="registration" profilePath="/staff/profile" />

        <main className="flex-1 overflow-y-auto">
          <div style={{ padding: "20px 24px" }}>
            <DocumentEntryHeader />

            <div
              style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}
            >
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                <div
                  style={{
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "28px 28px 20px",
                    marginBottom: "24px",
                  }}
                >
                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        color: "#dc2626",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        marginBottom: "20px",
                      }}
                    >
                      <AlertCircle
                        style={{ width: "16px", height: "16px", flexShrink: 0 }}
                      />
                      <span style={{ wordBreak: "break-word" }}>{error}</span>
                    </div>
                  )}

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
                      <select
                        name="org_id"
                        value={formData.org_id}
                        onChange={handleChange}
                        style={selectStyle(formData.org_id)}
                      >
                        <option value="" disabled>
                          Select Institution
                        </option>
                        {organizations.map((org) => (
                          <option
                            key={org.org_id}
                            value={org.org_id}
                            style={{ color: "#111827" }}
                          >
                            {org.name}
                          </option>
                        ))}
                      </select>
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
                      <select
                        name="submitted_by"
                        value={formData.submitted_by}
                        onChange={handleChange}
                        style={selectStyle(formData.submitted_by)}
                        disabled={!formData.org_id}
                      >
                        <option value="" disabled>
                          {formData.org_id
                            ? "Select User in Org"
                            : "Select Institution First"}
                        </option>
                        {availableUsers.map((user) => (
                          <option
                            key={user.user_id}
                            value={user.user_id}
                            style={{ color: "#111827" }}
                          >
                            {user.first_name} {user.last_name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                      <select
                        name="academic_year_id"
                        value={formData.academic_year_id}
                        onChange={handleChange}
                        style={selectStyle(formData.academic_year_id)}
                      >
                        <option value="" disabled>
                          Select Year
                        </option>
                        {academicYears.map((ay) => (
                          <option
                            key={ay.academic_year_id}
                            value={ay.academic_year_id}
                            style={{ color: "#111827" }}
                          >
                            {ay.year}
                          </option>
                        ))}
                      </select>
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
                      <select
                        name="doc_type_id"
                        value={formData.doc_type_id}
                        onChange={handleChange}
                        style={selectStyle(formData.doc_type_id)}
                      >
                        <option value="" disabled>
                          Select Type
                        </option>
                        {documentTypes.map((dt) => (
                          <option
                            key={dt.doc_type_id}
                            value={dt.doc_type_id}
                            style={{ color: "#111827" }}
                          >
                            {dt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      style={{
                        ...selectStyle(formData.category_id),
                        maxWidth: "220px",
                      }}
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat.category_id}
                          value={cat.category_id}
                          style={{ color: "#111827" }}
                        >
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Q4 Financial Analysis Report"
                      style={{
                        width: "100%",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        padding: "9px 13px",
                        fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        color: "#111827",
                        backgroundColor: "#fff",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* OCR SCANNING INDICATOR */}
                  {isScanning && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        backgroundColor: "#eef2fa",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-[#1f5cae]" />
                      <span className="font-inter text-[#1f5cae] font-semibold text-[13px]">
                        Scanning document with OCR Engine... Auto-filling
                        fields.
                      </span>
                    </div>
                  )}

                  <SubmitRegistration
                    file={file}
                    setFile={handleFileUpload}
                    isLoading={isLoading || isScanning}
                    onSubmit={handleSubmit}
                  />
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
