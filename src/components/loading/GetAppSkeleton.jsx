import { LoadingRegion, Skeleton, SkeletonLines } from "./Skeleton";
import "./GetAppSkeleton.css";

export default function GetAppSkeleton() {
  return <LoadingRegion label="Loading the VISTA mobile guide" className="get-app-skeleton">
    <div className="public-shell">
      <div className="get-app-skeleton-hero">
        <div><Skeleton width={165} height={11} /><div className="get-app-skeleton-title"><Skeleton width="82%" height={54} /><Skeleton width="68%" height={54} /><Skeleton width="92%" height={54} /></div><SkeletonLines count={2} /><div className="get-app-skeleton-actions"><Skeleton width={160} height={48} /><Skeleton width={110} height={14} /></div></div>
        <div className="get-app-skeleton-art"><div className="get-app-skeleton-ring" /><Skeleton width="43%" height="73%" className="get-app-skeleton-phone" /><Skeleton width="53%" height={56} className="get-app-skeleton-note" /></div>
      </div>
      <Skeleton height={100} className="get-app-skeleton-band" />
      <div className="get-app-skeleton-tags">{[0,1,2,3].map(i => <Skeleton key={i} height={42} />)}</div>
      <div className="get-app-skeleton-heading"><Skeleton width="45%" height={32} /><Skeleton width="35%" height={32} /></div>
      <div className="get-app-skeleton-features">{[0,1,2,3].map(i => <div key={i}><Skeleton circle width={70} height={70} /><Skeleton width="65%" height={18} /><SkeletonLines count={2} /></div>)}</div>
      <div className="get-app-skeleton-tour"><Skeleton width="65%" height={380} style={{ borderRadius: 28 }} /><div><Skeleton width="80%" height={32} /><SkeletonLines count={3} /><Skeleton width={180} height={44} /></div></div>
    </div>
  </LoadingRegion>;
}
