import AuditActionLabel from '../../../../components/AuditActionLabel';
import { Info, User, Building2, FileText } from 'lucide-react';
import defaultAvatar from '../../../../assets/shared/default_user.webp';

export default function LogDetailsEventSummary({ event }) {
  const EntityIcon = event.type === 'User account' ? User : event.type === 'Organization' ? Building2 : FileText;
  return <div className="admin-audit-overview">
  <section className="admin-audit-card" aria-label="Event summary">
    <header className="admin-audit-card__header admin-audit-card__header--brand"><h3>Event summary</h3><Info size={18} aria-hidden="true" /></header>
    <div className="admin-audit-card__body">
      <div className="admin-audit-event-heading"><h3>{event.title}</h3><AuditActionLabel action={event.action} /></div>
      <p>{event.summary}</p>
      <dl className="admin-audit-metadata">
        <div><dt>Performed by</dt><dd>{event.actor}</dd></div>
        <div><dt>Recorded at</dt><dd>{event.dateTime}</dd></div>
      </dl>
    </div>
  </section>
  <section className="admin-audit-card" aria-label={event.entityLabel}>
    <header className="admin-audit-card__header admin-audit-card__header--muted"><EntityIcon size={18} aria-hidden="true" /><h3>{event.entityLabel}</h3></header>
    <div className="admin-audit-card__body">
      <div className="admin-audit-entity">
        {event.isAuth || event.type === 'User account'
          ? <img src={event.entityImageUrl || defaultAvatar} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = defaultAvatar; }} className="h-10 w-10 shrink-0 rounded-full object-cover" />
          : <EntityIcon size={22} aria-hidden="true" />}
        <div><strong>{event.entityName}</strong>{event.entityEmail && <p>{event.entityEmail}</p>}</div>
      </div>
      <dl className="admin-audit-metadata"><div><dt>Record type</dt><dd>{event.type}</dd></div></dl>
    </div>
  </section>
  </div>;
}
