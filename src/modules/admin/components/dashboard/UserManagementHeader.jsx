import { Plus } from 'lucide-react'

export default function UserManagementHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between w-full">
      <div>
        <h2 className="font-inter text-[28px] lg:text-[32px] font-bold text-[#142d55]">User Management</h2>
        <p className="font-inter text-[15px] lg:text-[16px] text-gray-600 mt-1">
          Manage institutional access, roles, and security permissions.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 self-start rounded border border-gray-800 bg-[#ffe100] px-6 py-2.5 font-inter text-[14px] lg:text-[15px] font-bold text-[#000000] transition-colors hover:bg-[#e6c900]"
      >
        <Plus className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2} aria-hidden="true" />
        Add User
      </button>
    </div>
  )
}
