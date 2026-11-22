// Web counterpart of Mobile's project-owned DashboardCardIllustration shapes.
// Decorative only: the surrounding tile supplies the label and count.
export default function DashboardIllustration({ kind = 'total' }) {
  return <svg className="vista-dashboard-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <g transform={`rotate(${kind === 'returned' ? 10 : -10} 50 50)`}>
      {kind === 'total' ? <>
        <path d="M10 30V24a5 5 0 0 1 5-5h25l9 10h37v58H10Z" fill="#BB9142" />
        <rect x="25" y="8" width="56" height="72" rx="5" fill="#DAD7CB" />
        <rect x="21" y="5" width="56" height="72" rx="5" fill="#F7F3E9" />
        <path d="M32 20h33M32 28h25M32 36h33" stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" />
        <path d="M8 42h80l-5 45H15Z" fill="#EDCB83" />
        <path d="M15 84h68" stroke="#D8AD55" strokeWidth="4" />
      </> : kind === 'process' ? <>
        <rect x="39" y="7" width="24" height="14" rx="5" fill="#1A59A5" />
        <path d="M23 85l-6 7M77 85l6 7" stroke="#142B52" strokeWidth="5" strokeLinecap="round" />
        <circle cx="50" cy="53" r="36" fill="#94BCE5" stroke="#1A59A5" strokeWidth="4" />
        <circle cx="50" cy="53" r="28" fill="#F7F3E9" />
        <path d="M50 29v5m24 19h-5M50 77v-5M26 53h5M50 38v16h18" fill="none" stroke="#142B52" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="53" r="3" fill="#1A59A5" />
      </> : <>
        <rect x="23" y="12" width="59" height="79" rx="6" fill="#DAD7CB" />
        <rect x="19" y="8" width="59" height="79" rx="6" fill="#F7F3E9" />
        {kind === 'approved' ? <>
          <rect x="35" y="4" width="27" height="13" rx="4" fill="#D8AD55" />
          <rect x="42" y="7" width="13" height="4" rx="2" fill="#BB9142" />
          {[33, 48, 63].map(y => <g key={y}><path d={`M27 ${y}l3 3 6-7`} fill="none" stroke="#BB9142" strokeWidth="2" /><path d={`M42 ${y}h24`} stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" /></g>)}
        </> : <>
          <path d="M61 8v17h17" fill="#DAD7CB" />
          <path d="M30 33h31M30 42h24M30 51h31" stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" />
          <circle cx="61" cy="70" r="12" fill="#F2D4CB" />
          <path d="M56 65l10 10m0-10-10 10" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
        </>}
      </>}
    </g>
  </svg>;
}
