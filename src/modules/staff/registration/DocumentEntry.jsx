import { SystemScopeBanner, VerticalBanner } from "../../../components/banners/WorkspaceBanners";
import VistaSelect from "../../../components/VistaSelect";
import { PanelSkeleton } from "../../../components/loading/Skeleton";
import { getApiErrorMessage } from "../../../utils/apiErrorMessage";
import ErrorNotice from "../../../components/ErrorNotice";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RotateCcw } from "lucide-react";
import { fetchAllPages } from "../../../utils/fetchAllPages";
import { getRegistrationValidationError, mergeRegistrationSuggestions } from "../../../utils/registrationDraft";
import api from "./../../../lib/axios";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import DocumentEntryHeader from "./components/DocumentEntryHeader";
import SubmitRegistration from "./components/SubmitRegistration";
import OCRResults from "./components/OCRResults";
import { useSidebar } from "../../../hooks/useSidebar";
import { prepareAttachment } from "../../../utils/prepareAttachment";
import { createRegistrationSaver, processRegistrationUpload } from "../../../utils/registrationUpload";
import { ActionButton, StatusModal } from "../../../components";
export default function DocumentEntry() {
  const navigate = useNavigate();
  const [saveRegistration] = useState(createRegistrationSaver);
  const { isOpen, open, close } = useSidebar();

  const [activeView, setActiveView] = useState("form");
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dropdownError, setDropdownError] = useState("");
  const [dropdownRetry, setDropdownRetry] = useState(0);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const manualFields = useRef(new Set());
  const scanRequest = useRef({ version: 0, controller: null });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showNotification = (
    title,
    message,
    type = "success",
    onConfirm = null,
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeNotification = () => {
    const callback = modalConfig.onConfirm;
    setModalConfig({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
      onConfirm: null,
    });
    if (callback) callback();
  };

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

  useEffect(() => {
    const controller = new AbortController();
    const fetchDropdowns = async () => {
      setDropdownError("");
      setLoadingDropdowns(true);
      try {
        const [orgs, members, years, types, categoryOptions] =
          await Promise.all([
            fetchAllPages(api, "/organizations/", { signal: controller.signal, params: { is_active: true } }),
            fetchAllPages(api, "/users/", { signal: controller.signal, params: { is_active: true } }),
            fetchAllPages(api, "/academic-years/", { signal: controller.signal }),
            fetchAllPages(api, "/document-types/", { signal: controller.signal }),
            fetchAllPages(api, "/categories/", { signal: controller.signal }),
          ]);
        if (controller.signal.aborted) return;
        setOrganizations(orgs);
        setUsers(members);
        setAcademicYears(years);
        setDocumentTypes(types);
        setCategories(categoryOptions);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load dropdown data:", err);
        setDropdownError("Could not load the form options. Please try again before submitting.");
      } finally {
        if (!controller.signal.aborted) setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
    return () => controller.abort();
  }, [dropdownRetry]);

  useEffect(() => () => {
    scanRequest.current.version += 1;
    scanRequest.current.controller?.abort();
  }, []);

  const availableUsers = useMemo(() => {
    if (!formData.org_id) return [];
    return users.filter((u) => u.is_active !== false && String(u.org_id) === String(formData.org_id));
  }, [users, formData.org_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    manualFields.current.add(name);
    if (name === "org_id") {
      setFormData((prev) => ({ ...prev, [name]: value, submitted_by: String(prev.org_id) === String(value) ? prev.submitted_by : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  const handleRedo = () => {
    scanRequest.current.controller?.abort();
    scanRequest.current.version += 1;
    manualFields.current.clear();
    setIsScanning(false);
    setFile(null);
    setFormData({
      org_id: "",
      submitted_by: "",
      academic_year_id: "",
      doc_type_id: "",
      category_id: "",
      title: "",
    });
    setError("");
  };

  const handleFileUpload = async (uploadedFile) => {
    scanRequest.current.controller?.abort();
    const version = ++scanRequest.current.version;
    const controller = new AbortController();
    scanRequest.current.controller = controller;
    if (!uploadedFile) {
      setFile(null);
      setIsScanning(false);
      setError("");
      return;
    }

    setIsScanning(true);
    setFile(uploadedFile);
    setError("");

    try {
      const { preparationError, readingError } = await processRegistrationUpload(uploadedFile, {
        signal: controller.signal,
        prepare: source => prepareAttachment(source, controller.signal),
        read: source => {
          const fd = new FormData();
          fd.append("file", source);
          return api.post("/submissions/autofill/", fd, {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
          });
        },
        onPrepared: prepared => {
          if (!controller.signal.aborted && version === scanRequest.current.version) setFile(prepared);
        },
        onRead: res => {
          if (controller.signal.aborted || version !== scanRequest.current.version) return;
          const draft = res.data;
          if (draft.status === "draft_pending_review") {
            setFormData(prev => mergeRegistrationSuggestions(prev, draft, manualFields.current, { categories, documentTypes }));
          }
        },
      });
      if (controller.signal.aborted || version !== scanRequest.current.version) return;
      const messages = [];
      // Preview is optional: retain an openable original if conversion is unavailable.
      if (preparationError) console.warn("Attachment conversion unavailable; using original preview.");
      if (readingError) messages.push(getApiErrorMessage(readingError, "The document could not be read. Your file is still attached; review the fields manually or try again."));
      setError(messages.join(" "));
    } catch (err) {
      if (controller.signal.aborted || version !== scanRequest.current.version) return;
      console.error("OCR Failed:", err);
      setError(
        "The document could not be processed. Your original file is still attached; review the fields manually or try again.",
      );
    } finally {
      if (version === scanRequest.current.version) setIsScanning(false);
    }
  };

  // 1. Move to Review Screen (Does NOT save to DB yet)
  const handleNextReview = () => {
    if (isScanning) {
      setError("Please wait for document scanning to finish before continuing.");
      return;
    }
    if (loadingDropdowns || dropdownError) {
      setError("Please wait for the form options to load, or retry loading them before continuing.");
      return;
    }
    const validationError = getRegistrationValidationError(formData, { organizations, users });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setActiveView("results");
  };

  // 2. Map IDs to readable names for the summary UI
  const getSummaryData = () => {
    const selectedUser = users.find(
      (u) => String(u.user_id) === String(formData.submitted_by),
    );
    const selectedDocType = documentTypes.find(
      (d) => String(d.doc_type_id) === String(formData.doc_type_id),
    );

    return {
      submitted_by_name: selectedUser
        ? `${selectedUser.first_name} ${selectedUser.last_name}`
        : "Unknown",
      doc_type_name: selectedDocType?.name || "Unknown",
      org_name: organizations.find(item => String(item.org_id) === String(formData.org_id))?.name || "Unknown",
      academic_year: academicYears.find(item => String(item.academic_year_id) === String(formData.academic_year_id))?.year || "Unknown",
      category_name: categories.find(item => String(item.category_id) === String(formData.category_id))?.name || "Unknown",
      title: formData.title,
      file_name: file?.name || "No File Attached",
    };
  };

  // 3. Finalize and Save to Database
  const handleFinalApprove = async () => {
    if (loadingDropdowns || dropdownError) return;
    const validationError = getRegistrationValidationError(formData, { organizations, users });
    if (validationError) {
      setError(validationError);
      setActiveView("form");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await saveRegistration({
        payload: { ...formData, description: "Direct Staff Upload" }, file,
        create: async payload => (await api.post("/submissions/", payload)).data.submission_id,
        upload: async source => {
          const body = new FormData();
          body.append("file", source);
          body.append("upload_preset", "vista_uploads");
          const response = await fetch("https://api.cloudinary.com/v1_1/djtdar2ex/auto/upload", { method: "POST", body });
          const result = await response.json();
          if (!response.ok || !result.secure_url || !result.public_id || !result.resource_type) throw new Error("Attachment storage did not confirm the upload.");
          return result;
        },
        findAttachment: async (id, url) => {
          const documents = await fetchAllPages(api, "/documents/", { params: { submission_id: id } });
          return documents.some(document => document.file_url === url);
        },
        attach: (id, source, stored) => api.post("/documents/", {
          submission_id: id, file_name: source.name, file_url: stored.secure_url,
          cloudinary_public_id: stored.public_id, cloudinary_resource_type: stored.resource_type,
          mime_type: source.type || (/\.pdf$/i.test(source.name) ? "application/pdf" : "application/octet-stream"),
          file_size_kb: Math.max(1, Math.round(source.size / 1024)),
        }),
      });

      // Step C: Route to dashboard on absolute success
      navigate("/staff/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      setError(getApiErrorMessage(err, "Could not create the submission."));
      if (err.message?.includes('attachment is not confirmed')) {
        showNotification('Finish attachment upload', err.message, 'warning');
      }
    } finally {
      setIsSubmitting(false);
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
      {isOpen && (
        <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />
      )}

      <Sidebar role="staff" isOpen={isOpen} onClose={close} />

      <div className="dashboard-content flex flex-1 flex-col overflow-hidden">
        <Header
          layout="registration"
          profilePath="/staff/profile"
          onMenuToggle={open}
        />

        <main className="dashboard-main flex-1 overflow-y-auto">
          <div className="dashboard-page-body page-content-stack" style={{ padding: "20px 24px" }}>
            <div className="workspace-illustrated-layout">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: "12px",
                  minWidth: 0,
                }}
              >
                <DocumentEntryHeader />
                {!loadingDropdowns && activeView === "form" && (
                  <ActionButton
                    onClick={handleRedo}
                    label="Redo"
                    icon={<RotateCcw size={13} aria-hidden="true" />}
                    disabled={isSubmitting}
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      fontSize: "13px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                  />
                )}
              </div>
            </div>
            <div className="workspace-illustrated-layout">
              <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                <ErrorNotice message={error} />
                <ErrorNotice message={dropdownError} onRetry={() => setDropdownRetry(c => c + 1)} retrying={loadingDropdowns} />
                {loadingDropdowns ? <PanelSkeleton kind="form" label="Loading registration form options" /> : activeView === "form" ? (
                  <div className="registration-form-card"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "28px 28px 20px",
                      marginBottom: "24px",
                    }}
                  >
                    <div className="responsive-form-grid"
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
                        <VistaSelect
                          aria-label="Organization"
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
                        </VistaSelect>
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
                        <VistaSelect
                          aria-label="Submitted by"
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
                        </VistaSelect>
                      </div>
                    </div>

                    <div className="responsive-form-grid"
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
                        <VistaSelect
                          aria-label="Academic year"
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
                        </VistaSelect>
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
                        <VistaSelect
                          aria-label="Document type"
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
                        </VistaSelect>
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
                      <VistaSelect
                        className="entry-category-select"
                        aria-label="Category"
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
                      </VistaSelect>
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
                      isLoading={isScanning}
                      onSubmit={handleNextReview}
                    />
                  </div>
                ) : (
                  <OCRResults
                    file={file}
                    summaryData={getSummaryData()}
                    isSubmitting={isSubmitting}
                    onApprove={handleFinalApprove}
                    onRedo={() => setActiveView("form")}
                  />
                )}
              </div>

              <VerticalBanner />
            </div>
            <SystemScopeBanner />
          </div>
        </main>
      </div>

      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={closeNotification}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="OK"
        onConfirm={closeNotification}
      />
    </div>
  );
}
