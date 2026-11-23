import { CircleCheck } from 'lucide-react';

export default function LogDetailsTimeline({ event }) {
  return <section className="admin-audit-card" aria-label="Context timeline">
    <header className="admin-audit-card__header"><h3>Context timeline</h3></header>
    <div className="admin-audit-card__body">
      <ol className="admin-audit-timeline"><li><CircleCheck size={20} aria-hidden="true" /><div>
        <strong>{event.title}</strong><p>{event.dateTime}</p><p>{event.actor} · This recorded event</p>
      </div></li></ol>
      <p className="admin-audit-empty" style={{ marginTop: 'var(--space-4)' }}>Only this event is included in the audit response. No additional timeline events were provided.</p>
    </div>
  </section>;
}
