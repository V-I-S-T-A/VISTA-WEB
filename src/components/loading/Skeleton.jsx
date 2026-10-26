import './Skeleton.css';

export function Skeleton({ width = '100%', height = 14, circle = false, className = '', style }) {
  return <span aria-hidden="true" className={`vista-skeleton ${circle ? 'vista-skeleton--circle' : ''} ${className}`}
    style={{ width, height, ...style }} />;
}

export function LoadingRegion({ label = 'Loading content', children, className = '', style }) {
  return <div role="status" aria-busy="true" className={`vista-loading ${className}`} style={style}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" style={{ width: '100%', minWidth: 0 }}>{children}</div>
  </div>;
}

export function SkeletonLines({ count = 3 }) {
  return <div className="skeleton-lines">{Array.from({ length: count }, (_, i) =>
    <Skeleton key={i} width={i === count - 1 ? '64%' : '100%'} />)}</div>;
}

export function TableRowsSkeleton({ columns = 6, rows = 5, label = 'Loading records' }) {
  return <>{Array.from({ length: rows }, (_, row) => <tr key={row} className="skeleton-table-row" aria-busy="true">
    {Array.from({ length: columns }, (_, col) => <td key={col}>
      {row === 0 && col === 0 && <span role="status" className="sr-only">{label}</span>}
      <Skeleton height={col === columns - 1 ? 26 : 13} width={col === 0 ? '72%' : '85%'} />
      {col === 1 && <Skeleton height={9} width="55%" style={{ marginTop: 8 }} />}
    </td>)}
  </tr>)}</>;
}

export function StatsSkeleton({ count = 4, variant = 'staff' }) {
  return <LoadingRegion label="Loading summary cards"><div className={`skeleton-stats skeleton-stats--${variant}`} style={{ '--skeleton-columns': count }}>
    {Array.from({ length: count }, (_, i) => <div key={i} className={`skeleton-stat skeleton-stat--${i % 4}`}>
      <Skeleton width="58%" height={13} /><div className="skeleton-spread"><Skeleton width={72} height={44} /><Skeleton circle width={44} height={44} /></div>
    </div>)}
  </div></LoadingRegion>;
}

export function AnalyticsSkeleton() {
  return <LoadingRegion label="Loading submission analytics" className="skeleton-panel">
    <div className="skeleton-toolbar"><Skeleton width="35%" height={22} /><Skeleton width="30%" height={32} /></div>
    <div className="skeleton-two-columns"><PanelSkeleton kind="chart" chart="donut" label="Loading submission status" /><PanelSkeleton kind="chart" label="Loading document types" /></div>
    <div style={{ marginTop: 20 }}><PanelSkeleton kind="chart" label="Loading submission timeline" /></div>
  </LoadingRegion>;
}

export function PanelSkeleton({ kind = 'list', label = 'Loading panel', framed = true, rows = 4, chart = 'bars' }) {
  let content;
  if (kind === 'profile' || kind === 'form') {
    content = <div className={`skeleton-form ${kind === 'profile' ? 'skeleton-form--profile' : ''}`}>
      {kind === 'profile' && <div className="skeleton-avatar"><Skeleton circle width={112} height={112} /><Skeleton width={100} height={32} /></div>}
      <div className="skeleton-fields">{Array.from({ length: kind === 'profile' ? 6 : 8 }, (_, i) => <div key={i}><Skeleton width="32%" height={11} /><Skeleton height={46} style={{ marginTop: 8, borderRadius: 24 }} /></div>)}
        <div className="skeleton-actions"><Skeleton width={100} height={38} /><Skeleton width={140} height={38} /></div>
      </div>
    </div>;
  } else if (kind === 'chart') {
    content = <><Skeleton width="42%" height={18} /><div className="skeleton-chart">
      {chart === 'donut' ? <div className="skeleton-donut" /> : <div className="skeleton-bars">{[42, 72, 54, 92, 65, 80].map((height, i) => <Skeleton key={i} height={`${height}%`} />)}</div>}
    </div><SkeletonLines count={2} /></>;
  } else if (kind === 'connection' || kind === 'analysis') {
    content = <><Skeleton circle width={52} height={52} /><Skeleton width="48%" height={22} style={{ marginTop: 20 }} /><SkeletonLines count={3} />
      {kind === 'analysis' && <div className="skeleton-fields"><Skeleton height={120} /><Skeleton height={120} /></div>}
      <Skeleton width={180} height={42} style={{ marginTop: 22 }} /></>;
  } else {
    content = <>{Array.from({ length: rows }, (_, i) => <div key={i} className={`skeleton-list-row skeleton-list-row--${kind}`}>
      <Skeleton circle={kind !== 'documents' && kind !== 'folders'} width={kind === 'timeline' ? 12 : 36} height={kind === 'timeline' ? 12 : 36} />
      <div className="skeleton-list-copy"><Skeleton width={i % 2 ? '62%' : '82%'} /><Skeleton width="45%" height={10} style={{ marginTop: 9 }} />
        {kind === 'remarks' && <Skeleton width="95%" height={36} style={{ marginTop: 14 }} />}</div>
      {kind === 'folders' && <Skeleton width={65} height={28} />}
    </div>)}</>;
  }
  return <LoadingRegion label={label} className={framed ? `skeleton-panel skeleton-panel--${kind}` : ''}>{content}</LoadingRegion>;
}

export function TableSkeleton({ columns = 6, rows = 5 }) {
  return <LoadingRegion label="Loading table" className="skeleton-panel">
    <div className="skeleton-toolbar"><Skeleton width="35%" height={34} /><Skeleton width={100} height={34} /></div>
    <div className="skeleton-table-scroll"><table className="skeleton-table"><thead><tr>{Array.from({ length: columns }, (_, i) => <th key={i}><Skeleton width="70%" height={11} /></th>)}</tr></thead>
      <tbody><TableRowsSkeleton columns={columns} rows={rows} /></tbody></table></div>
    <div className="skeleton-spread"><Skeleton width={140} height={12} /><Skeleton width={170} height={30} /></div>
  </LoadingRegion>;
}
