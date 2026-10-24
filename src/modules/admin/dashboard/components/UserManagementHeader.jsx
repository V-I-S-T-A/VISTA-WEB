import { useState } from "react";
import { Plus } from "lucide-react";
import AddUserModal from "../modals/AddUserModal";
import { useCreateUser } from "../../../../hooks/useUserMutations";
import { PageHeader } from "../../../../components";
import { useToast } from "../../../../components/toastContext";

export default function UserManagementHeader() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();
  const createUserMutation = useCreateUser();

  async function handleAddUser(data) {
    try {
      const createdUser = await createUserMutation.mutateAsync({
        first_name: data.first_name || data.firstName,
        last_name: data.last_name || data.lastName,
        email: data.email,
        role: data.role,
        org_id: data.org_id ?? data.orgId ?? null,
        is_active:
          data.is_active !== undefined ? data.is_active : data.isActive,
      });
      const sent = createdUser.welcome_email_sent;
      showToast(
        sent === true
          ? "Account created. Email accepted for sending; ask the user to check their inbox or spam folder."
          : sent === false
            ? "Account created, but the welcome email could not be sent. Ask your system administrator to check the email service and renew the Gmail authorization token if needed. Do not create the account again."
            : "Account created, but email delivery could not be confirmed. Ask your system administrator to check the email service. Do not create the account again.",
        sent === true ? "success" : "error",
        sent === true ? 7000 : 20000,
      );
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating user:", error.response?.data ?? error);
      throw error;
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
    </>
  );
}
