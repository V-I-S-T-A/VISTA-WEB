import { FileStack, Clock, CheckCircle, RotateCcw } from 'lucide-react'

// Derived from static submissions — same 15 records used in RecentSubmissionsTable
const PENDING = 4
const UNDER_REVIEW = 3
const APPROVED = 5
const RETURNED = 3

const CARDS = [
  { label: 'Total Submissions', value: '15', icon: FileStack, bg: 'bg-[#1a51a5]' },
  { label: 'Pending', value: PENDING.toString(), icon: Clock, bg: 'bg-[#f7941d]' },
  { label: 'Approved', value: APPROVED.toString(), icon: CheckCircle, bg: 'bg-[#2d9f6f]' },
  { label: 'Returned', value: RETURNED.toString(), icon: RotateCcw, bg: 'bg-[#e05252]' },
]

export default function SubmissionSummaryCards() {
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
            <p
              className="relative z-10 font-inter font-bold leading-none"
              style={{ fontSize: index === 0 ? '72px' : '62px' }}
            >
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
