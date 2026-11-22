import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import FilterPopover, { FilterPopoverRow, FilterSelect, FilterDateInput } from '../../src/components/FilterPopover';
import DateOfBirthField from '../../src/components/DateOfBirthField';
import ActionButton from '../../src/components/ActionButton';
import StatusModal from '../../src/components/StatusModal';
import ConfirmDriveSyncModal from '../../src/modules/staff/review-panel/components/modals/ConfirmDriveSyncModal';
import ResendInvitationModal from '../../src/modules/admin/dashboard/modals/ResendInvitationModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../src/index.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
queryClient.setQueryData(['drive-connection'], { connected: false });
const report = { submission_id: 'fictional', title: 'Fictional report', doc_type_name: 'Accomplishment Report' };

export function FilterFixture() {
  const [clicks, setClicks] = useState(0), [busy, setBusy] = useState(false), [dialog, setDialog] = useState('');
  const [open, setOpen] = useState(false), [status, setStatus] = useState('all'), [category, setCategory] = useState('all');
  const [date, setDate] = useState('2026-11-15'), [birth, setBirth] = useState('2004-06-15');
  return <main style={{ padding: 24, maxWidth: 600 }}>
    <h1>Fictional filter checks</h1>
    <section style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBlock: 16 }}>
      <ActionButton id="primary-action" variant="primary" label={busy ? 'Saving…' : 'Save changes'} disabled={busy} aria-busy={busy} onClick={() => setClicks(n => n + 1)} />
      <ActionButton id="secondary-action" variant="secondary" label="Cancel" />
      <ActionButton id="default-action" label="View details" />
      <ActionButton id="destructive-action" variant="destructive" label="Delete entry" />
      <button id="legacy-action" data-ui="primary" className="rounded bg-black text-yellow-300">Submit</button>
      <button id="toggle-busy" onClick={() => setBusy(v => !v)}>Toggle busy</button>
      <button id="open-confirm" onClick={() => setDialog('primary')}>Open confirmation</button>
      <button id="open-delete" onClick={() => setDialog('danger')}>Open deletion</button>
      <button id="open-drive" onClick={() => setDialog('drive')}>Review image order</button>
      <button id="open-invite" onClick={() => setDialog('invite')}>Review invitation</button>
      <output id="action-count">{clicks}</output>
    </section>
    <StatusModal isOpen={['primary', 'danger'].includes(dialog)} onClose={() => setDialog('')} title="Fictional confirmation" confirmVariant={dialog} cancelText="Cancel" message="No API calls or data changes." />
    {dialog === 'invite' && <ResendInvitationModal user={{ email: 'fictional@example.test' }} isSending={busy} onClose={() => setDialog('')} onConfirm={() => {}} />}
    {dialog === 'drive' && <ConfirmDriveSyncModal isOpen onClose={() => setDialog('')} onConfirm={() => {}} submission={report} submissionDetails={report} statusAction="Approved" />}
    <div className="relative" style={{ width: 100, marginTop: 20 }}>
      <button id="filter-trigger" type="button" onClick={() => setOpen(value => !value)}>Filter</button>
      {open && <FilterPopover onClose={() => setOpen(false)} onClear={() => { setStatus('all'); setCategory('all'); setDate(''); }}>
        <FilterPopoverRow label="Status"><FilterSelect value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Status</option><option value="approved">Approved</option><option value="returned">Returned</option></FilterSelect></FilterPopoverRow>
        <FilterPopoverRow label="Category"><FilterSelect value={category} onChange={event => setCategory(event.target.value)}><option value="all">All Categories</option><option value="in">In-Campus</option><option value="off">Off-Campus</option></FilterSelect></FilterPopoverRow>
        <FilterPopoverRow label="From Date"><FilterDateInput value={date} onChange={event => setDate(event.target.value)} /></FilterPopoverRow>
      </FilterPopover>}
    </div>
    <output id="filter-state">{JSON.stringify({ status, category, date })}</output>
    <form style={{ marginTop: 48 }} onSubmit={event => event.preventDefault()}><DateOfBirthField value={birth} onChange={setBirth} /><output id="birth-state">{birth}</output></form>
    <button id="outside" type="button" style={{ marginTop: 20 }}>Outside</button>
  </main>;
}
createRoot(document.getElementById('root')).render(<QueryClientProvider client={queryClient}><FilterFixture /></QueryClientProvider>);
