import { useState } from "react";
import {
  Building2,
  Calendar,
  FileText,
  Tag,
  Plus,
} from "lucide-react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { PageHeader } from "../../components";
import ConfigTable from "./registrationconfig/components/ConfigTable";
import ConfigEntryModal from "./registrationconfig/modals/ConfigEntryModal";
import DeleteConfirmModal from "./registrationconfig/modals/DeleteConfirmModal";

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

  const currentTabLabel =
    tabs.find((t) => t.id === activeTab)?.label || "Entries";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role="admin" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header layout="registrationConfig" profilePath="/admin/profile" />

        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "20px 24px" }}
        >
          <div className="w-full">
            <PageHeader
              title="Registration Configuration"
              subtitle="Manage dynamic dropdown options for document entry forms."
            >
              <button
                type="button"
                onClick={handleAddNew}
                className="inline-flex items-center gap-1.5 rounded border border-gray-800 bg-[#ffe100] font-inter font-bold text-black transition-colors hover:bg-[#e6c900]"
                style={{
                  fontSize: "12px",
                  padding: "8px 14px",
                  marginTop: "2px",
                }}
              >
                <Plus
                  style={{ width: "13px", height: "13px" }}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                Add New Entry
              </button>
            </PageHeader>

            {/* Tab Navigation */}
            <div
              className="flex gap-2 border-b border-gray-200"
              style={{ marginBottom: "16px" }}
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

            <ConfigTable
              activeTab={activeTab}
              tabLabel={currentTabLabel}
              refreshTrigger={refreshTrigger}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
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
