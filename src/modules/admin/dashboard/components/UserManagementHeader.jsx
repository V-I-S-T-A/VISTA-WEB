import { useState } from "react";
import { Plus } from "lucide-react";
import AddUserModal from "../modals/AddUserModal";
import { useCreateUser } from "../../../../hooks/useUserMutations";
import { PageHeader } from "../../../../components";

export default function UserManagementHeader() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const createUserMutation = useCreateUser();

  async function handleAddUser(data) {
    setEmailResult(null);
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
      setEmailResult({
        success: sent === true,
        message:
          sent === true
            ? "Account created. The email service accepted the temporary-password email. This does not confirm inbox delivery; ask the recipient to check their inbox and spam folder."
            : sent === false
              ? "Account created, but the temporary-password email could not be sent. The account already exists; do not create it again. Contact your system administrator to restore email delivery and help the user reset their password."
              : "Account created, but the server did not report whether the temporary-password email was sent. The account already exists; do not create it again. Contact your system administrator to check email delivery.",
      });
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

      {emailResult && (
        <div
          role={emailResult.success ? "status" : "alert"}
          className={`mx-6 mb-4 flex items-start justify-between gap-3 rounded-lg border p-4 font-inter text-sm ${
            emailResult.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <p>{emailResult.message}</p>
          <button
            type="button"
            onClick={() => setEmailResult(null)}
            className="shrink-0 font-semibold underline"
            aria-label="Dismiss account email status"
          >
            Dismiss
          </button>
        </div>
      )}

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
