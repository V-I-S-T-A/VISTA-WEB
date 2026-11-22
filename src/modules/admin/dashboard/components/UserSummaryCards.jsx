import { Users, ShieldCheck, GraduationCap, FileClock } from 'lucide-react'
import { useUserSummary } from '../../../../hooks/useUsers'
import ErrorNotice from '../../../../components/ErrorNotice'
import { Skeleton } from '../../../../components/loading/Skeleton'

export default function UserSummaryCards() {
  const { data, isPending, error, refetch } = useUserSummary()
  const count = key => isPending ? '…' : error ? '—' : String(data?.[key] ?? 0)

  const CARDS = [
    { label: 'Total Users', value: count('total'), icon: Users, bg: 'bg-[var(--ui-blue)]' },
    { label: 'Staffs', value: count('staff'), icon: ShieldCheck, bg: 'bg-[var(--ui-green)]' },
    { label: 'Students', value: count('students'), icon: GraduationCap, bg: 'bg-[var(--ui-navy)]' },
    { label: 'Inactive', value: count('inactive'), icon: FileClock, bg: 'bg-[var(--ui-warning)]' },
  ]

  return (
    <div className="w-full" style={{ marginBottom: '12px' }}>
      {error && <ErrorNotice message="Could not load user totals. Please try again." onRetry={refetch} />}
      <div className="admin-cards-grid grid grid-cols-5" style={{ gap: '10px' }}>
        {CARDS.map(({ label, value, icon: Icon, bg }, index) => (
          <div
            key={label}
            data-tone={index === 1 ? 'approved' : index > 1 ? 'muted' : 'default'}
            className={`vista-summary-card relative overflow-hidden ${bg} text-white flex flex-col justify-between ${index === 0 ? 'card-full-width col-span-2' : 'col-span-1'}`}
            style={{ padding: 'var(--space-5)', minHeight: '150px' }}
          >
            <p className="relative z-10 font-inter font-semibold text-white/90" style={{ fontSize: '13px' }}>
              {label}
            </p>
            <p data-summary-value className="relative z-10 font-inter font-bold leading-none"
              style={{ fontSize: index === 0 ? 'clamp(40px, 4vw, 64px)' : 'clamp(36px, 3.5vw, 56px)' }}>
              {isPending ? <Skeleton width={90} height={60} /> : value}
            </p>
            <Icon
              className="absolute opacity-25"
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
