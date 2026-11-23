import { useEffect, useMemo, useState } from 'react';
import { ListChecks, Download } from 'lucide-react';
import { PanelSkeleton } from '../../../../components/loading/Skeleton';
import { submissionService } from '../../../../services/submissionService';
import { getOptimizedViewUrl } from '../../../../utils/fileOptimizer';
import { presentAuditEvent, auditFieldLabel, auditValue, sanitizeAuditData, isAuditTechnicalField, readableAuditFields } from '../auditPresentation';
import LogDetailsHeader from './LogDetailsHeader';
import LogDetailsEventSummary from './LogDetailsEventSummary';

function RecordedValue({ value, field }) {
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    return entries.length ? <dl className="admin-audit-nested">{entries.map(([key, entry]) => <div key={key}><dt>{Array.isArray(value) ? `Item ${Number(key) + 1}` : auditFieldLabel(key)}</dt><dd><RecordedValue value={entry} field={key} /></dd></div>)}</dl> : <span>See technical details</span>;
  }
  return <span>{auditValue(value, field)}</span>;
}

function Section({ title, icon: Icon, children }) {
  return <section className="admin-audit-card" aria-label={title}>
    <header className="admin-audit-card__header admin-audit-card__header--brand">{Icon && <Icon size={18} aria-hidden="true" />}<h3>{title}</h3></header>
    <div className="admin-audit-card__body">{children}</div>
  </section>;
}

export default function AuditLogDetails({ log, onBack }) {
  const event = useMemo(() => log ? presentAuditEvent(log) : null, [log]);
  const [currentRecord, setCurrentRecord] = useState({ id: null, data: null, unavailable: false });

  useEffect(() => {
    if (!event || log.table_name !== 'tbl_Submissions' || !event.entityId) return;
    let active = true;
    const id = event.entityId;
    submissionService.getSubmissionById(id).then(data => {
      if (active) setCurrentRecord({ id, data, unavailable: false });
    }).catch(() => {
      if (active) setCurrentRecord({ id, data: null, unavailable: true });
    });
    return () => { active = false; };
  }, [event, log]);

  if (!event) return null;
  const isSubmission = log.table_name === 'tbl_Submissions' && Boolean(event.entityId);
  const loaded = isSubmission && currentRecord.id === event.entityId;
  const record = loaded ? currentRecord.data : null;
  const safeLog = sanitizeAuditData(log);
  const safeFields = sanitizeAuditData(event.fieldChanges.map(entry => ({ field: entry.key, before: { [entry.key]: entry.before }, after: { [entry.key]: entry.after } })));
  const values = safeFields.filter(entry => !isAuditTechnicalField(entry.field)).map(entry => ({ key: entry.field, before: readableAuditFields(entry.before[entry.field]), after: readableAuditFields(entry.after[entry.field]) }));
  const snapshot = ['create', 'delete'].includes(event.action);

  return <div className="admin-audit-details">
    <LogDetailsHeader onBack={onBack} />
    <LogDetailsEventSummary event={event} />
    {isSubmission && <details className="admin-audit-technical admin-audit-card"><summary>Current submission</summary>
      {isSubmission && !record && <p className="admin-audit-empty" style={{ marginTop: 'var(--space-3)' }}>{loaded && currentRecord.unavailable ? 'Current submission unavailable.' : 'Loading current submission…'}</p>}
      {isSubmission && !loaded && <PanelSkeleton kind="form" framed={false} label="Loading current submission" />}
      {record && <div><p className="admin-audit-empty">Current information may differ from this recorded event.</p>
        <dl className="admin-audit-metadata">
          <div><dt>Title</dt><dd>{record.title || 'Not available'}</dd></div>
          <div><dt>Organization</dt><dd>{record.site || record.org_name || record.organization_name || record.organization?.name || 'Not available'}</dd></div>
          <div><dt>Applicant</dt><dd>{record.contactEmail || record.submitted_by_email || record.submitted_by?.email || 'Not available'}</dd></div>
          <div><dt>Document type</dt><dd>{record.doc_type_name || record.doc_type_id?.name || record.documentType || 'Not available'}</dd></div>
          <div><dt>Category</dt><dd>{record.category_name || record.category?.name || (typeof record.category === 'string' ? record.category : '') || 'Not available'}</dd></div>
        </dl>
        <div className="admin-audit-files">{record.documents?.map((document, index) => {
          const url = getOptimizedViewUrl(document.file_url);
          return url ? <a key={document.document_id || document.id || index} href={url} target="_blank" rel="noopener noreferrer"><Download size={16} aria-hidden="true" />View {document.file_name || `attached file ${index + 1}`}</a> : <p key={index}>{document.file_name || `Attached file ${index + 1}`} · File URL unavailable</p>;
        })}</div>
      </div>}
    </details>}
    {values.length > 0 && <Section title={event.action === 'create' ? 'Created record' : event.action === 'delete' ? 'Deleted record' : 'Changes made'} icon={ListChecks}>
      <table className="admin-audit-changes"><caption className="sr-only">Recorded field values for this event</caption><thead><tr><th scope="col">Field</th>{snapshot ? <th scope="col">Recorded value</th> : <><th scope="col">Before</th><th scope="col">After</th></>}</tr></thead><tbody>
        {values.map(entry => <tr key={entry.key}><th scope="row">{auditFieldLabel(entry.key)}</th>{snapshot ? <td><RecordedValue value={event.action === 'delete' ? entry.before : entry.after} field={entry.key} /></td> : <><td><RecordedValue value={entry.before} field={entry.key} /></td><td><RecordedValue value={entry.after} field={entry.key} /></td></>}</tr>)}
      </tbody></table>
    </Section>}
      <details data-audit-technical className="admin-audit-technical admin-audit-card"><summary>Technical details</summary>
        {event.invalid && <p className="admin-audit-empty">The original change data is included below.</p>}
        <dl className="admin-audit-metadata"><div><dt>Audit event ID</dt><dd><code>{log.audit_id || 'Not recorded'}</code></dd></div><div><dt>Record ID</dt><dd><code>{event.entityId || 'Not recorded'}</code></dd></div><div><dt>Source table</dt><dd><code>{log.table_name || 'Not recorded'}</code></dd></div><div><dt>Original timestamp</dt><dd><code>{log.performed_at || 'Not recorded'}</code></dd></div></dl>
        <pre>{JSON.stringify(safeLog, null, 2)}</pre>
      </details>
  </div>;
}
