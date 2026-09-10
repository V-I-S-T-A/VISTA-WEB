import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, Eye } from "lucide-react";
import AddUserModal from "../modals/AddUserModal";
import AddOrgModal from "../modals/AddOrgModal";
import { useCreateUser } from "../../../../hooks/useUserMutations";
import { useCreateOrganization } from "../../../../hooks/useOrganizations";
import { PageHeader } from "../../../../components";

export default function UserManagementHeader() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const createUserMutation = useCreateUser();
  const createOrgMutation = useCreateOrganization();

  async function handleAddUser(data) {
    try {
      await createUserMutation.mutateAsync({
        first_name: data.first_name || data.firstName,
        last_name: data.last_name || data.lastName,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm || data.confirmPassword,
        role: data.role,
        org_id: data.org_id ?? data.orgId ?? null,
        is_active:
          data.is_active !== undefined ? data.is_active : data.isActive,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating user:", error.response?.data ?? error);
    }
  }

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
        title="User Management"
        subtitle="Manage institutional access, roles, and security permissions."
      >
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard/registeredorg")}
          className="inline-flex items-center gap-1.5 rounded border border-blue-900 bg-[#003370] font-inter font-bold text-white transition-colors hover:bg-[#16385f]"
          style={{ fontSize: "12px", padding: "8px 14px", marginTop: "2px" }}
        >
          <Eye
            style={{ width: "13px", height: "13px" }}
            strokeWidth={2.5}
            aria-hidden="true"
          />
          View Org
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

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded border border-gray-800 bg-[#ffe100] font-inter font-bold text-black transition-colors hover:bg-[#e6c900]"
          style={{ fontSize: "12px", padding: "8px 14px", marginTop: "2px" }}
        >
          <Plus
            style={{ width: "13px", height: "13px" }}
            strokeWidth={2.5}
            aria-hidden="true"
          />
          Add User
        </button>
      </PageHeader>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddUser}
        isLoading={createUserMutation.isPending}
        error={createUserMutation.error}
      />

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
