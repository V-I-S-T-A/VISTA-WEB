import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, SquarePen, ChevronDown, Check } from 'lucide-react'
import defaultUser from '../../../../assets/shared/default_user.jpg'

const PAGE_SIZE = 50
const CONTENT_PADDING = '30px'

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

const ROLE_OPTIONS = ['All Roles', ...ROLES]
const STATUS_OPTIONS = ['All Status', ...STATUSES]

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
      className="inline-flex items-center gap-1.5 font-inter font-bold" style={{ fontSize: '12px' }}
    >
      <span
        style={{ backgroundColor: config.dot }}
        className="h-2 w-2 rounded-full flex-shrink-0"
      />
      {status}
    </span>
  )
}

/**
 * Custom dropdown that visually matches the previous native <select>
 * (same border, radius, padding, type styles) but renders its own
 * menu so it can be styled consistently across browsers/OSes.
 */
function FilterDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleSelect(option) {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        className="appearance-none bg-white font-inter font-semibold text-gray-700 outline-none cursor-pointer inline-flex items-center gap-6 hover:bg-gray-50 transition-colors whitespace-nowrap"
        style={{
          border: '1.5px solid #d1d5db',
          borderRadius: '7px',
          padding: '7px 11px',
          fontSize: '12px',
        }}
      >
        {value}
        <ChevronDown
          className="pointer-events-none h-4 w-4 flex-shrink-0 text-gray-500 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option === value
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option)}
                className={[
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-inter font-semibold transition-colors',
                  isSelected ? 'bg-[#eef2ff] text-[#1f5cae]' : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')}
                style={{ fontSize: '12px' }}
              >
                {option}
                {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
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
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white mx-4 sm:mx-6 lg:mx-8 my-4">

      {/* ── Toolbar ── */}
      <div className="bg-[#eef1f7] border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-4 h-auto">
          {/* Search */}
          <div
            className="relative flex-shrink-0"
            style={{
              width: '480px',
              paddingTop: '18px',
              paddingBottom: '18px',
              paddingLeft: CONTENT_PADDING,
            }}
          >
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              style={{ width: '58px', height: '18px' }}
            />

            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full bg-white font-inter text-gray-600 placeholder:text-gray-400 outline-none"
              style={{
                height: '40px',
                border: '1.5px solid #d1d5db',
                borderRadius: '10px',
                padding: '0 16px 0 48px',
                fontSize: '13px',
                lineHeight: '52px',
              }}
            />
          </div>

          {/* Filters */}
          <div
            className="flex items-center gap-2.5"
            style={{
              paddingRight: '20px',
            }}
          >
            <FilterDropdown
              label="Filter by role"
              options={ROLE_OPTIONS}
              value={roleFilter}
              onChange={handleRoleChange}
            />

            <FilterDropdown
              label="Filter by status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={handleStatusChange}
            />

            <button
              type="button"
              className="inline-flex items-center gap-1.5 bg-white font-inter font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              style={{
                border: '1.5px solid #d1d5db',
                borderRadius: '7px',
                padding: '7px 13px',
                fontSize: '12px',
              }}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Section header ── */}
      <div
        className="bg-[#1f5cae] h-16 flex items-center"
        style={{ paddingLeft: CONTENT_PADDING }}
      >
        <h3 className="font-inter text-[18px] font-bold text-white">
          Recent Submissions
        </h3>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="h-14 border-b border-gray-100 bg-[#f8f9fc] ">
              {['USER', 'ROLE', 'DEPARTMENT', 'LAST LOGIN', 'STATUS', 'ACTION'].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-2.5 text-left font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500"
                  style={heading === 'USER' ? { paddingLeft: CONTENT_PADDING } : undefined}
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
                  className="h-16 border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f7f9ff]"
                >
                  {/* User */}
                  <td className="px-5 py-2.5" style={{ paddingLeft: CONTENT_PADDING }}>
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt=""
                        className="flex-shrink-0 rounded-full object-cover"
                        style={{ width: '45px', height: '45px' }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-inter font-bold text-gray-900 leading-tight" style={{ fontSize: '15px' }}>{user.name}</p>
                        <p className="max-w-[200px] truncate font-inter font-medium text-gray-400 mt-0.5" style={{ fontSize: '12px' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-7 py-3 font-inter font-semibold ${user.role === 'Staff'
                        ? 'bg-[#dfe7fb] text-[#12345b]'
                        : 'bg-[#e8e3ff] text-[#4a3f99]'
                        }`}
                      style={{ fontSize: '13px', minWidth: '80px' }}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-2.5 font-inter font-semibold uppercase tracking-wide text-gray-700" style={{ fontSize: '13px' }}>
                    {user.department}
                  </td>

                  {/* Last Login */}
                  <td className="px-5 py-2.5 font-inter font-medium text-gray-500 whitespace-nowrap" style={{ fontSize: '13px' }}>
                    {user.lastLogin}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-2.5 style={{ fontSize: '13px'}}">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Action */}
                  <td className="px-5 py-2.5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded bg-[#ffe100] font-inter font-bold text-gray-900 transition hover:bg-[#e6c900] active:scale-95 border border-[#d4a000]/50"
                      style={{ fontSize: '12px', padding: '4px 12px' }}
                    >
                      <SquarePen style={{ width: '12px', height: '12px' }} aria-hidden="true" />
                      EDIT
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between border-t border-gray-200 bg-white"
        style={{
          paddingLeft: CONTENT_PADDING,
          paddingRight: CONTENT_PADDING,
          paddingTop: '12px',
          paddingBottom: '12px',
        }}
      >
        <p className="font-inter text-[14px] font-medium text-gray-500">
          Showing <span className="font-semibold text-gray-700">{showingCount}</span> of{' '}
          <span className="font-semibold text-gray-700">{totalCount}</span> users
        </p>

        {showPagination && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="font-inter font-semibold border rounded-md transition"
              style={{
                height: '30px',
                padding: '0 14px',
                fontSize: '13px',
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb',
                color: safeCurrentPage === 1 ? '#9ca3af' : '#374151',
                cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className="font-inter font-semibold border rounded-md transition"
                style={{
                  width: '34px',
                  height: '30px',
                  fontSize: '13px',
                  borderColor: page === safeCurrentPage ? '#002b5c' : '#d1d5db',
                  backgroundColor: page === safeCurrentPage ? '#002b5c' : '#ffffff',
                  color: page === safeCurrentPage ? '#ffffff' : '#374151',
                }}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="font-inter font-semibold border rounded-md transition"
              style={{
                height: '30px',
                padding: '0 14px',
                fontSize: '13px',
                borderColor: '#d1d5db',
                backgroundColor: '#ffffff',
                color: safeCurrentPage >= totalPages ? '#9ca3af' : '#374151',
                cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}