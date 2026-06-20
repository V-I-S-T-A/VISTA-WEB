import { Users, ShieldCheck, GraduationCap, FileClock } from 'lucide-react'
import { useUsers } from '../../../../hooks/useUsers'

export default function UserSummaryCards() {
  // Fetch all users to calculate stats
  const { data: usersData = [] } = useUsers({ pageSize: 1000 })

  const users = Array.isArray(usersData) ? usersData : (usersData.results || [])

  // Calculate statistics
  const totalUsers = users.length
  const staffCount = users.filter((u) => u.role === 'staff').length
  const studentCount = users.filter((u) => u.role === 'student').length
  const inactiveCount = users.filter((u) => !u.is_active).length

  const CARDS = [
    { label: 'Total Users', value: totalUsers.toString(), icon: Users, bg: 'bg-[#1a51a5]' },
    { label: 'Staffs', value: staffCount.toString(), icon: ShieldCheck, bg: 'bg-[#2d9f6f]' },
    { label: 'Students', value: studentCount.toString(), icon: GraduationCap, bg: 'bg-[#3cb8a0]' },
    { label: 'Inactive', value: inactiveCount.toString(), icon: FileClock, bg: 'bg-[#f7941d]' },
  ]

  return (
    <div className="w-full" style={{ marginBottom: '12px' }}>
      <div className="grid grid-cols-5" style={{ gap: '10px' }}>
        {CARDS.map(({ label, value, icon: Icon, bg }, index) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-xl ${bg} text-white flex flex-col justify-between ${index === 0 ? 'col-span-2' : 'col-span-1'}`}
            style={{ padding: '16px 20px', height: '150px' }}
          >
            <p className="relative z-10 font-inter font-semibold text-white/90" style={{ fontSize: '13px' }}>
              {label}
            </p>
            <p className="relative z-10 font-inter font-bold leading-none"
              style={{ fontSize: index === 0 ? '72px' : '62px' }}>
              {value}
            </p>
            <Icon
              className="absolute text-white/20"
              style={{
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: index === 0 ? '88px' : '72px',
                height: index === 0 ? '88px' : '72px',
              }}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  )
}