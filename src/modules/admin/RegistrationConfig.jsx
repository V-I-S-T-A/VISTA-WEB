import { useState } from "react";
import {
  Building2,
  Calendar,
  FileText,
  Tag,
  Plus,
  Settings,
} from "lucide-react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import ConfigTable from "./registrationconfig/components/ConfigTable";
import ConfigEntryModal from "./registrationconfig/modals/ConfigEntryModal";
import DeleteConfirmModal from "./registrationconfig/modals/DeleteConfirmModal"; // <-- Import added

const CONTENT_PADDING = "30px";

export default function RegistrationConfig() {
  const [activeTab, setActiveTab] = useState("organizations");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Entry Modal State (Add/Edit)
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const tabs = [
    { id: "organizations", label: "Organizations", icon: Building2 },
    { id: "academic_years", label: "Academic Years", icon: Calendar },
    { id: "document_types", label: "Document Types", icon: FileText },
    { id: "categories", label: "Categories", icon: Tag },
  ];

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsEntryModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEntryModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <Sidebar role="admin" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="registrationConfig" profilePath="/admin/profile" />

        <main className="flex-1 overflow-y-auto bg-white">
          <div style={{ paddingTop: "20px" }}>
            <div
              className="flex items-start justify-between w-full"
              style={{
                marginBottom: "14px",
                paddingLeft: "32px",
                paddingRight: "32px",
              }}
            >
              <div>
                <h2
                  className="font-inter font-bold text-[#142d55]"
                  style={{ fontSize: "26px", lineHeight: 1.15 }}
                >
                  Registration Configuration
                </h2>
                <p
                  className="font-inter text-gray-500 mt-0.5 flex items-center gap-1.5"
                  style={{ fontSize: "13px" }}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage dynamic dropdown options for document entry forms.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNew}
                className="inline-flex items-center gap-1.5 bg-[#fbbf24] hover:bg-[#f59e0b] font-inter font-bold text-gray-900 transition-colors uppercase tracking-wider"
                style={{
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  border: "2px solid #fbbf24",
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add New Entry
              </button>
            </div>

            <div
              className="flex gap-2 border-b border-gray-200"
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                marginBottom: "16px",
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-inter font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                      isActive
                        ? "text-[#1f5cae] border-b-[3px] border-[#1f5cae]"
                        : "text-gray-400 hover:text-[#142d55] border-b-[3px] border-transparent"
                    }`}
                    style={{
                      fontSize: "12px",
                      padding: "12px 16px",
                      marginBottom: "-1px",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <section className="rounded-xl border border-gray-200 bg-white mx-4 sm:mx-6 lg:mx-8 my-4">
              <div
                className="bg-[#1f5cae] flex items-center justify-between px-4 py-3 rounded-t-xl"
                style={{ minHeight: "64px" }}
              >
                <h3
                  className="font-inter text-[18px] font-bold text-white uppercase tracking-wide"
                  style={{ paddingLeft: CONTENT_PADDING }}
                >
                  {tabs.find((t) => t.id === activeTab)?.label} Database
                </h3>
              </div>

              <ConfigTable
                activeTab={activeTab}
                refreshTrigger={refreshTrigger}
                onEdit={handleEdit}
                onDelete={handleDeleteClick} // <-- Passed to table
              />

              <div
                className="flex items-center justify-between border-t border-gray-200 bg-[#f8f9fc] rounded-b-xl"
                style={{
                  paddingLeft: CONTENT_PADDING,
                  paddingRight: CONTENT_PADDING,
                  paddingTop: "12px",
                  paddingBottom: "12px",
                }}
              >
                <p className="font-inter text-[13px] font-bold text-gray-400 uppercase tracking-wider">
                  Configuring {activeTab.replace("_", " ")}
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>

      <ConfigEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        activeTab={activeTab}
        initialData={selectedItem}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        activeTab={activeTab}
        itemToDelete={itemToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
