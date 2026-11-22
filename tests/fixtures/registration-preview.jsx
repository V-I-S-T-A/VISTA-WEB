import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import OCRResults from '../../src/modules/staff/registration/components/OCRResults';
import FilterButton from '../../src/components/FilterButton';
import ExportButton from '../../src/components/ExportButton';
import TableSearchBar from '../../src/components/TableSearchBar';
import { organizationAvatar, submitterAvatar } from './avatar-images';
import '../../src/index.css';
import '../../src/workspace.css';
import '../../src/components/Controls.css';

const file = new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jT1kAAAAASUVORK5CYII='), c => c.charCodeAt(0))], 'Fictional-student-activity-request-form-with-a-long-attachment-name.png', { type: 'image/png' });
const summary = { org_name: 'Fictional Campus Scholars', submitted_by_name: 'Fictional Submitter', academic_year: '2026–2027', doc_type_name: 'Student Activity Request Form (SARF)', category_name: 'In-Campus', title: 'Student Activity Request Form (SARF)', file_name: file.name };
export function Fixture() {
  const [busy, setBusy] = useState(false), [hasFile, setHasFile] = useState(true);
  const [hasEmail, setHasEmail] = useState(true);
  const [approved, setApproved] = useState(0), [redo, setRedo] = useState(0), [search, setSearch] = useState('');
  return <main style={{ padding: 20, maxWidth: 1200, margin: 'auto' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
      <TableSearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions..." />
      <FilterButton onClick={() => {}} /><ExportButton onClick={() => {}} />
      <button id="toggle-busy" onClick={() => setBusy(v => !v)}>Toggle pending</button>
      <button id="toggle-file" onClick={() => setHasFile(v => !v)}>Toggle attachment</button>
      <button id="toggle-email" onClick={() => setHasEmail(v => !v)}>Toggle submitter email</button>
    </div>
    <OCRResults file={hasFile ? file : null} summaryData={{ ...summary, submitted_by_email: hasEmail ? 'student@example.test' : undefined, org_image_url: organizationAvatar, submitted_by_image_url: submitterAvatar, file_name: hasFile ? file.name : 'No File Attached' }} onApprove={() => setApproved(n => n + 1)} onRedo={() => setRedo(n => n + 1)} isSubmitting={busy} />
    <output id="callbacks">{JSON.stringify({ approved, redo })}</output>
  </main>;
}
createRoot(document.getElementById('root')).render(<Fixture />);
