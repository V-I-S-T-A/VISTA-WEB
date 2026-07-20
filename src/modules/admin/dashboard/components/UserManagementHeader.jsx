import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import AddUserModal from "../modals/AddUserModal";
import AddOrgModal from "../modals/AddOrgModal";
import { useCreateUser } from "../../../../hooks/useUserMutations";
import { useCreateOrganization } from "../../../../hooks/useOrganizations";

export default function UserManagementHeader() {
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
      console.error("Error creating organization:", error);
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
            User Management
          </h2>
          <p
            className="font-inter text-gray-500 mt-0.5"
            style={{ fontSize: "13px" }}
          >
            Manage institutional access, roles, and security permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddOrgModal(true)}
            className="inline-flex items-center gap-1.5 rounded border border-green-700 bg-[#22c55e] font-inter font-bold text-white transition-colors hover:bg-green-600"
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
        </div>
      </div>

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
