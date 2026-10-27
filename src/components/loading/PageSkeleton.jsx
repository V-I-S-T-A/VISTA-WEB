import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';
import GetAppSkeleton from './GetAppSkeleton';
import { ProfileBannerLayout, SystemScopeBanner, VerticalBanner } from '../banners/WorkspaceBanners';
import CampusScene from '../banners/CampusScene';
import { useSidebar } from '../../hooks/useSidebar';
import { LoadingRegion, Skeleton, SkeletonLines, StatsSkeleton, TableSkeleton, PanelSkeleton, AnalyticsSkeleton } from './Skeleton';

function HeadingSkeleton() {
  return <div className="skeleton-heading"><div className="skeleton-heading-copy"><Skeleton width="42%" height={26} /><Skeleton width="58%" height={12} style={{ marginTop: 12 }} /></div><Skeleton width={125} height={36} /></div>;
}

export function LandingHeroSkeleton() {
  return <LoadingRegion label="Loading welcome page" className="skeleton-hero"><div className="skeleton-hero-copy">
    <Skeleton width="90%" height={52} /><Skeleton width="72%" height={52} style={{ marginTop: 16 }} /><SkeletonLines count={2} />
    <div className="skeleton-feature-row">{[0, 1].map(i => <div key={i}><Skeleton width="72%" height={18} /><Skeleton width="95%" height={12} style={{ marginTop: 12 }} /></div>)}</div>
  </div></LoadingRegion>;
}

export function PageSkeletonContent({ kind, role }) {
  return <div className={`skeleton-stack${kind === 'profile' ? ' profile-page-body' : ''}`} data-skeleton-page={kind}>
    {kind === 'profile' ? <><CampusScene /><ProfileBannerLayout><PanelSkeleton kind="profile" label="Loading your profile" /></ProfileBannerLayout></>
      : kind === 'student-dashboard' ? <><CampusScene /><StatsSkeleton count={3} variant="student" /><TableSkeleton columns={6} /></>
      : kind === 'staff-dashboard' ? <><StatsSkeleton count={4} /><AnalyticsSkeleton /><TableSkeleton columns={7} /><div className="skeleton-two-columns"><PanelSkeleton label="Loading institutional pulse" rows={2} /><PanelSkeleton label="Loading recent activity" rows={3} /></div></>
      : kind === 'admin-dashboard' ? <><HeadingSkeleton /><StatsSkeleton count={4} variant="admin" /><TableSkeleton columns={6} /></>
      : kind === 'review-details' ? <><HeadingSkeleton /><Skeleton height={70} /><PanelSkeleton kind="form" label="Loading submission information" /><PanelSkeleton kind="timeline" label="Loading status history" rows={3} /><PanelSkeleton kind="remarks" label="Loading staff remarks" rows={2} /></>
      : kind === 'registration' || kind === 'analysis' || kind === 'drive' ? <><HeadingSkeleton /><div className="workspace-illustrated-layout"><div className="skeleton-stack">
        {kind === 'drive' && <div className="skeleton-banner"><Skeleton width="55%" height={24} /><SkeletonLines count={2} /></div>}
        <PanelSkeleton kind={kind === 'registration' ? 'form' : kind === 'drive' ? 'connection' : 'analysis'} label={`Loading ${kind === 'drive' ? 'Google Drive connection' : kind}`} />
        {kind === 'registration' && <PanelSkeleton kind="documents" label="Loading document upload panel" rows={2} />}
      </div><VerticalBanner /></div></>
      : kind === 'callback' ? <PanelSkeleton kind="connection" label="Connecting your Google account" />
      : <><HeadingSkeleton />{kind === 'configuration' && <div className="skeleton-toolbar">{[0, 1, 2, 3].map(i => <Skeleton key={i} width="22%" height={38} />)}</div>}
        {kind === 'tracker' && <Skeleton height={105} />}
        <TableSkeleton columns={kind === 'audit' ? 4 : kind === 'configuration' ? 5 : role === 'staff' ? 7 : 6} /></>}
    {kind !== 'profile' && kind !== 'callback' && <SystemScopeBanner />}
  </div>;
}

function resolvePage(pathname) {
  if (pathname.endsWith('/profile')) return ['profile', 'profile'];
  if (pathname.endsWith('/analysis-results')) return ['analysis', 'registration'];
  if (pathname.endsWith('/registration')) return ['registration', 'registration'];
  if (pathname.endsWith('/registration-config')) return ['configuration', 'registrationConfig'];
  if (pathname.endsWith('/registeredorg')) return ['organizations', 'admin'];
  if (pathname.endsWith('/callback')) return ['callback', 'gdrive'];
  if (pathname.includes('/gdrive-sync')) return ['drive', 'gdrive'];
  if (pathname.includes('/audit-logs')) return ['audit', 'auditlog'];
  if (pathname.includes('/review-tracker/')) return ['review-details', 'student'];
  if (pathname.endsWith('/review-tracker')) return ['tracker', 'student'];
  if (pathname.endsWith('/review-panel')) return ['review', 'staff'];
  const role = pathname.split('/')[1];
  return [`${role}-dashboard`, role];
}

export default function PageSkeleton() {
  const { pathname } = useLocation();
  const role = pathname.split('/')[1];
  const { isOpen, open, close } = useSidebar();
  if (!['admin', 'staff', 'student'].includes(role)) {
    return <main className="skeleton-public-content">
      {pathname === '/login' ? <LoadingRegion label="Loading sign in" className="skeleton-login"><div className="skeleton-login-card"><Skeleton width={70} height={70} circle /><Skeleton width="70%" height={26} /><Skeleton height={46} /><Skeleton height={46} /><Skeleton width="50%" /><Skeleton height={44} /></div></LoadingRegion>
        : pathname === '/' ? <LandingHeroSkeleton />
        : pathname === '/get-app' ? <GetAppSkeleton />
        : <div className="public-shell skeleton-legal-page"><Skeleton width={220} height={16} /><div className="skeleton-banner skeleton-legal-hero"><Skeleton width="50%" height={40} /><Skeleton width="40%" height={16} style={{ marginTop: 20 }} /><Skeleton width={180} height={32} style={{ marginTop: 24 }} /></div><div className="skeleton-legal"><aside><PanelSkeleton rows={7} label="Loading document contents" /></aside><div className="skeleton-stack">{[0, 1, 2].map(i => <PanelSkeleton key={i} rows={3} label="Loading document section" />)}</div></div></div>}
    </main>;
  }
  const [kind, layout] = resolvePage(pathname);
  return <div className="flex min-h-screen bg-white">
    {isOpen && <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />}
    <Sidebar role={role} isOpen={isOpen} onClose={close} />
    <div className="dashboard-content flex min-w-0 flex-1 flex-col overflow-hidden">
      <Header layout={layout} profilePath={`/${role}/profile`} onMenuToggle={open} />
      <main className="dashboard-main flex-1 overflow-y-auto bg-[#f7f9fc]" style={{ padding: role === 'staff' && kind === 'staff-dashboard' ? '24px 28px' : '20px 24px' }}>
        <PageSkeletonContent kind={kind} role={role} />
      </main>
    </div>
  </div>;
}
