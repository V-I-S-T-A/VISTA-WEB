import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import AddOrgModal from "../modals/AddOrgModal";
import { useCreateOrganization } from "../../../../hooks/useOrganizations";
import { BackButton, PageHeader } from "../../../../components";

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
      <PageHeader
        title="Organization Management"
        subtitle="Manage registered student organizations, view details, and configure institution settings."
      >
        <BackButton onClick={() => navigate("/admin/dashboard")}>Dashboard</BackButton>

        <button data-ui="primary"
          type="button"
          onClick={() => setShowAddOrgModal(true)}
          className="inline-flex items-center gap-1.5 border border-green-800 font-inter font-bold transition-colors"
          style={{ marginTop: "2px" }}
        >
          <Building2
            style={{ width: "13px", height: "13px" }}
            strokeWidth={2.5}
            aria-hidden="true"
          />
          Add Org
        </button>
      </PageHeader>

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
