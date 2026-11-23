import AdminSummaryArtwork from './AdminSummaryArtwork'
import { useUserSummary } from '../../../../hooks/useUsers'
import ErrorNotice from '../../../../components/ErrorNotice'
import { Skeleton } from '../../../../components/loading/Skeleton'

export default function UserSummaryCards() {
  const { data, isPending, error, refetch } = useUserSummary()
  const count = key => isPending ? '…' : error ? '—' : String(data?.[key] ?? 0)

  const CARDS = [
    { label: 'Total Users', value: count('total'), kind: 'total', bg: 'bg-[var(--ui-blue)]' },
    { label: 'Staffs', value: count('staff'), kind: 'staff', bg: 'bg-[var(--ui-yellow)]' },
    { label: 'Students', value: count('students'), kind: 'students', bg: 'bg-[var(--ui-green)]' },
    { label: 'Inactive', value: count('inactive'), kind: 'inactive', bg: 'bg-[var(--ui-danger)]' },
  ]

  return (
    <div className="w-full" style={{ marginBottom: '12px' }}>
      {error && <ErrorNotice message="Could not load user totals. Please try again." onRetry={refetch} />}
      <div className="admin-cards-grid grid grid-cols-5" style={{ gap: '10px' }}>
        {CARDS.map(({ label, value, kind, bg }, index) => (
          <div
            key={label}
            data-tone={kind}
            className={`vista-summary-card relative overflow-hidden ${bg} text-white flex flex-col justify-between ${index === 0 ? 'card-full-width col-span-2' : 'col-span-1'}`}
            style={{ padding: 'var(--space-5)', minHeight: '150px' }}
          >
            <p className="relative z-10 font-inter font-semibold text-white/90" style={{ fontSize: '13px' }}>
              {label}
            </p>
            <div className="admin-summary-value"><p data-summary-value className="relative z-10 font-inter font-bold leading-none"
              style={{ fontSize: index === 0 ? 'clamp(40px, 4vw, 64px)' : 'clamp(36px, 3.5vw, 56px)' }}>
              {isPending ? <Skeleton width={90} height={60} /> : value}
            </p>
            <AdminSummaryArtwork kind={kind} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
