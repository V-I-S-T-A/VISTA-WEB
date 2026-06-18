import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddUserModal from '../modals/AddUserModal'

export default function UserManagementHeader() {
  const [showAddModal, setShowAddModal] = useState(false)

  async function handleAddUser(data) {
    console.log('New user payload:', data)
    // await supabase.from('tbl_Users').insert({ ...data })
  }

  return (
    <>
      <div className="flex items-start justify-between w-full" style={{ marginBottom: '14px' }}>
        <div>
          <h2 className="font-inter font-bold text-[#142d55]" style={{ fontSize: '26px', lineHeight: 1.15 }}>
            User Management
          </h2>
          <p className="font-inter text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>
            Manage institutional access, roles, and security permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded border border-gray-800 bg-[#ffe100] font-inter font-bold text-black transition-colors hover:bg-[#e6c900]"
          style={{ fontSize: '12px', padding: '8px 14px', marginTop: '2px' }}
        >
          <Plus style={{ width: '13px', height: '13px' }} strokeWidth={2.5} aria-hidden="true" />
          Add User
        </button>
      </div>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddUser}
      />
    </>
  )
}