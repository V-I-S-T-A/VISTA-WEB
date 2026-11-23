// Project-owned SVGs in the same paper, gold, blue and soft-shadow vocabulary
// as DashboardIllustration. Decorative: labels and counts remain real text.
export default function AdminSummaryArtwork({ kind }) {
  return <svg className="admin-summary-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <g transform={`rotate(${kind === 'inactive' ? 9 : -9} 50 50)`}>
      {kind === 'total' ? <>
        <rect x="30" y="14" width="56" height="73" rx="6" fill="#DAD7CB" />
        <rect x="22" y="9" width="56" height="73" rx="6" fill="#F7F3E9" />
        <circle cx="42" cy="31" r="9" fill="#94BCE5" />
        <path d="M28 55v-5a14 14 0 0 1 28 0v5" fill="#1A59A5" />
        <path d="M31 65h37M31 72h28" stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" />
        <rect x="59" y="42" width="25" height="35" rx="4" fill="#EDCB83" />
        <circle cx="71.5" cy="53" r="5" fill="#F7F3E9" /><path d="M64 69a8 8 0 0 1 15 0" fill="#BB9142" />
      </> : kind === 'staff' ? <>
        <path d="M35 17V9h30v8" fill="none" stroke="#1A59A5" strokeWidth="6" strokeLinejoin="round" />
        <rect x="16" y="20" width="70" height="66" rx="7" fill="#DAD7CB" />
        <rect x="12" y="16" width="70" height="66" rx="7" fill="#F7F3E9" />
        <rect x="12" y="16" width="70" height="14" rx="5" fill="#94BCE5" />
        <circle cx="35" cy="46" r="9" fill="#EDCB83" /><path d="M22 69v-4a13 13 0 0 1 26 0v4" fill="#1A59A5" />
        <path d="M56 44h16M56 52h12M56 63h16" stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" />
      </> : kind === 'students' ? <>
        <rect x="20" y="20" width="63" height="67" rx="6" fill="#DAD7CB" />
        <rect x="15" y="16" width="63" height="67" rx="6" fill="#F7F3E9" />
        <path d="M20 32l29-14 29 14-29 14Z" fill="#1A59A5" /><path d="M30 39v12q19 13 38 0V39" fill="#94BCE5" />
        <path d="M76 33v23" stroke="#D8AD55" strokeWidth="3" /><circle cx="76" cy="59" r="4" fill="#EDCB83" />
        <path d="M27 66h37M27 73h26" stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" />
      </> : <>
        <rect x="24" y="13" width="58" height="76" rx="6" fill="#DAD7CB" />
        <rect x="19" y="9" width="58" height="76" rx="6" fill="#F7F3E9" />
        <circle cx="45" cy="31" r="9" fill="#94BCE5" /><path d="M31 55v-5a14 14 0 0 1 28 0v5" fill="#1A59A5" />
        <path d="M30 66h29M30 74h20" stroke="#BFC8C3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="72" cy="70" r="15" fill="#EDCB83" /><path d="M67 63v14M76 63v14" stroke="#BB9142" strokeWidth="4" strokeLinecap="round" />
      </>}
    </g>
  </svg>;
}
