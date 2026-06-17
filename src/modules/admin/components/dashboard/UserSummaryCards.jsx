import { Users, ShieldCheck, GraduationCap, FileClock } from 'lucide-react'

const CARDS = [
  {
    label: 'Total Users',
    value: '42',
    icon: Users,
    bg: 'bg-[#1a51a5]',
  },
  {
    label: 'Staffs',
    value: '08',
    icon: ShieldCheck,
    bg: 'bg-[#2d9f6f]',
  },
  {
    label: 'Students',
    value: '08',
    icon: GraduationCap,
    bg: 'bg-[#3cb8a0]',
  },
  {
    label: 'Pending Access',
    value: '24',
    icon: FileClock,
    bg: 'bg-[#f7941d]',
  },
]

export default function UserSummaryCards() {
  return (
    <div className="w-full">
      <div className="mb-8 grid grid-cols-5 gap-6">
        {CARDS.map(({ label, value, icon: Icon, bg }, index) => (
          <div
            key={label}
            className={`
              relative overflow-hidden rounded-2xl ${bg}
              px-6 py-6 lg:px-8 lg:py-8 text-white shadow-sm
              flex flex-col justify-between
              h-[160px] lg:h-[180px]
              ${index === 0 ? 'col-span-2' : 'col-span-1'}
            `}
          >
            <p className="relative z-10 font-inter text-[16px] lg:text-[18px] font-semibold text-white/90">
              {label}
            </p>
            <p className="relative z-10 font-inter text-[56px] lg:text-[64px] font-bold leading-none tracking-tight">
              {value}
            </p>

            <Icon
              className="absolute right-6 top-1/2 -translate-y-1/2 h-[72px] w-[72px] lg:h-[84px] lg:w-[84px] text-white/20"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </div>
  )
}