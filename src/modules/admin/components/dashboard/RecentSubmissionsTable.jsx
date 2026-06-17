import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, SquarePen, ChevronDown } from 'lucide-react'
import defaultUser from '../../../../assets/shared/default_user.jpg'

const PAGE_SIZE = 50

const FIRST_NAMES = [
  'Maria', 'Juan', 'Angela', 'Carlos', 'Patricia', 'Miguel', 'Sofia', 'Rafael',
  'Isabella', 'Gabriel', 'Camille', 'Daniel', 'Nicole', 'Joshua', 'Hannah',
  'Ethan', 'Alyssa', 'Marcus', 'Bianca', 'Luis',
]

const LAST_NAMES = [
  'Santos', 'Reyes', 'Cruz', 'Garcia', 'Torres', 'Mendoza', 'Flores', 'Ramos',
  'Aquino', 'Bautista', 'Navarro', 'Castillo', 'Domingo', 'Valdez', 'Morales',
  'Fernandez', 'Gonzales', 'Rivera', 'Diaz', 'Lopez',
]

const DEPARTMENTS = [
  'OSA Secretary',
  'Site Officer',
  'College of Engineering',
  'Information Technology',
  'Human Resources',
  "Registrar's Office",
  'Finance Office',
  'College of Education',
  'College of Business',
  'Library Services',
]

const ROLES = ['Staff', 'Student']
const STATUSES = ['Active', 'Pending', 'Inactive']

const LAST_LOGINS = [
  'June 6, 2026',
  'June 5, 2026',
  'June 4, 2026',
  'June 3, 2026',
  'June 2, 2026',
  'June 1, 2026',
  'May 31, 2026',
  'May 30, 2026',
]

function generateUsers() {
  return Array.from({ length: 110 }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
    const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length]
    const name = `${firstName} ${lastName}`
    const emailSlug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}`
    const department = DEPARTMENTS[index % DEPARTMENTS.length]

    return {
      id: index + 1,
      name,
      email: `${emailSlug}@gmail.com`,
      role: ROLES[index % 3 === 0 ? 0 : index % 2],
      department,
      lastLogin: LAST_LOGINS[index % LAST_LOGINS.length],
      status: STATUSES[index % 5 === 0 ? 1 : index % 7 === 0 ? 2 : 0],
      avatar: defaultUser,
    }
  })
}

const ALL_USERS = generateUsers()

const STATUS_CONFIG = {
  Active: { dot: '#22c55e', text: '#16a34a' },
  Pending: { dot: '#a16207', text: '#854d0e' },
  Inactive: { dot: '#9ca3af', text: '#6b7280' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Inactive
  return (
    <span
      style={{ color: config.text }}
      className="inline-flex items-center gap-1.5 font-inter text-sm font-bold"
    >
      <span
        style={{ backgroundColor: config.dot }}
        className="h-2 w-2 rounded-full"
      />
      {status}
    </span>
  )
}

export default function RecentSubmissionsTable() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return ALL_USERS.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)

      const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter
      const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [search, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, safeCurrentPage])

  // Pagination is only shown when total filtered users >= 50
  const showPagination = filteredUsers.length >= 50

  const showingCount = paginatedUsers.length
  const totalCount = filteredUsers.length

  function handleSearchChange(value) {
    setSearch(value)
    setCurrentPage(1)
  }

  function handleRoleChange(value) {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  function handleStatusChange(value) {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  // Show a windowed set of page numbers (max 5 visible at a time)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const half = 2
    let start = Math.max(1, safeCurrentPage - half)
    let end = Math.min(totalPages, safeCurrentPage + half)
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, 5)
      else start = Math.max(1, end - 4)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [totalPages, safeCurrentPage])

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white w-full mt-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between px-6 py-4 bg-[#f8f9fc]">
        {/* Search */}
        <div className="relative w-full max-w-[380px]">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full rounded border border-gray-300 bg-white py-2.5 pl-11 pr-4 font-inter text-[14px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#1a51a5]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(event) => handleRoleChange(event.target.value)}
              className="appearance-none rounded border border-gray-300 bg-white py-2.5 pl-4 pr-10 font-inter text-[14px] font-medium text-gray-700 outline-none"
            >
              <option>All Roles</option>
              <option>Staff</option>
              <option>Student</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="appearance-none rounded border border-gray-300 bg-white py-2.5 pl-4 pr-10 font-inter text-[14px] font-medium text-gray-700 outline-none"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </div>

          {/* More Filters */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-5 py-2.5 font-inter text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            More Filters
          </button>
        </div>
      </div>

      {/* ── Section header ── */}
      <div className="bg-[#1f5cae] px-6 py-4">
        <h3 className="font-inter text-[15px] font-bold text-white">Recent Submissions</h3>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#f8f9fc]">
              {['USER', 'ROLE', 'DEPARTMENT', 'LAST LOGIN', 'STATUS', 'ACTION'].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-4 text-left font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-inter text-sm text-gray-500">
                  No users match your search or filters.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-inter text-[15px] font-bold text-gray-900">{user.name}</p>
                        <p className="max-w-[200px] truncate font-inter text-[13px] font-medium text-gray-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3.5 py-1 font-inter text-[12px] font-bold ${
                      user.role === 'Staff' ? 'bg-[#e8eaf6] text-[#3949ab]' : 'bg-[#ede7f6] text-[#5e35b1]'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 font-inter text-[14px] font-medium uppercase tracking-wide text-gray-700">
                    {user.department}
                  </td>

                  {/* Last Login */}
                  <td className="px-6 py-4 font-inter text-[14px] font-medium text-gray-500">{user.lastLogin}</td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded bg-[#ffe100] px-4 py-2 font-inter text-[12px] font-bold text-gray-900 transition hover:bg-[#e6c900] active:scale-95 border border-[#d4a000]/50"
                    >
                      <SquarePen className="h-4 w-4" aria-hidden="true" />
                      EDIT
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: showing count + pagination ── */}
      <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Showing X of Y users */}
        <p className="font-inter text-[14px] text-gray-500">
          Showing <span className="font-semibold text-gray-700">{showingCount}</span> of{' '}
          <span className="font-semibold text-gray-700">{totalCount}</span> users
        </p>

        {/* Pagination — only rendered when total users >= 50 */}
        {showPagination && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Previous */}
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="rounded-md border border-gray-200 bg-white px-4 py-1.5 font-inter text-[14px] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {/* Page numbers */}
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={[
                  'min-w-[36px] rounded-md border px-3 py-1.5 font-inter text-[14px] font-semibold transition',
                  page === safeCurrentPage
                    ? 'border-[#142d55] bg-[#142d55] text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="rounded-md border border-gray-200 bg-white px-4 py-1.5 font-inter text-[14px] text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
