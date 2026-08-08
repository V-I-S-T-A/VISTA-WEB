import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import AddOrgModal from "../modals/AddOrgModal";
import { useCreateOrganization } from "../../../../hooks/useOrganizations";

export default function RegisteredOrgHeader() {
  const navigate = useNavigate();
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const createOrgMutation = useCreateOrganization();

  async function handleAddOrg(data) {
    try {
      await createOrgMutation.mutateAsync(data);
      setShowAddOrgModal(false);
    } catch (error) {
      console.error(
        "Error creating organization:",
        error.response?.data ?? error,
      );
    }
  }

  return (
    <>
      <div
        className="flex items-start justify-between w-full"
        style={{ marginBottom: "14px" }}
      >
        <div>
          <h2
            className="font-inter font-bold text-[#142d55]"
            style={{ fontSize: "26px", lineHeight: 1.15 }}
          >
            Organization Management
          </h2>
          <p
            className="font-inter text-gray-500 mt-0.5"
            style={{ fontSize: "13px" }}
          >
            Manage registered student organizations, view details, and configure institution settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white font-inter font-bold text-gray-700 transition-colors hover:bg-gray-50"
            style={{ fontSize: "12px", padding: "8px 14px", marginTop: "2px" }}
          >
            <ArrowLeft
              style={{ width: "13px", height: "13px" }}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setShowAddOrgModal(true)}
            className="inline-flex items-center gap-1.5 rounded border border-green-800 bg-[#22c55e] font-inter font-bold text-white transition-colors hover:bg-[#16a34a]"
            style={{ fontSize: "12px", padding: "8px 14px", marginTop: "2px" }}
          >
            <Building2
              style={{ width: "13px", height: "13px" }}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            Add Org
          </button>
        </div>
      </div>

      <AddOrgModal
        isOpen={showAddOrgModal}
        onClose={() => setShowAddOrgModal(false)}
        onSave={handleAddOrg}
        isLoading={createOrgMutation.isPending}
        error={createOrgMutation.error}
      />
    </>
  );
}
