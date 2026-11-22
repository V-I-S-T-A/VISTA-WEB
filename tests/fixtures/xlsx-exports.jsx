import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RecentSubmissionsTable from '../../src/modules/staff/dashboard/components/RecentSubmissionsTable';
import { submissionService } from '../../src/services/submissionService';
import { exportAnalyticsToXlsx } from '../../src/utils/xlsxExport';
import api from '../../src/lib/axios';

// Fictional records only. Unexpected requests fail without reaching a backend.
api.defaults.adapter = async () => { throw new Error('Export fixture rejects network requests'); };
const statuses = ['pending', 'under_review', 'approved', 'rejected', 'resubmission_required', 'custom_status'];
const rows = statuses.map((status, index) => ({
  submission_id: `1234567${index}-fictional`, status,
  ...(index ? {} : { title: 'Example <Report> & “Résumé”', submitted_by_name: 'Sample Student', submitted_by_email: 'student@example.test', org_name: 'Example Organization', category_name: 'In-Campus', doc_type_name: 'Activity Report', academic_year: '2026–2027', submitted_at: '2026-11-15T12:00:00Z' }),
}));
submissionService.getSubmissions = async () => ({ results: rows, count: rows.length });
const statistics = { total: 6, status_counts: { pending: 1, under_review: 2, approved: 1, rejected: 1, resubmission_required: 1 }, approval_rate: 33,
  category_data: [{ category: 'In-Campus', count: 4 }], organization_data: [{ org_name: 'Example Organization', org_acronym: 'EO', count: 3 }], doc_type_data: [{ doc_type: 'Activity Report', count: 2 }], monthly_trends: [{ month: 'November 2026', count: 6 }],
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><MemoryRouter>
  <button id="analytics-export" onClick={() => exportAnalyticsToXlsx(statistics, rows, { timeframe: 'Fictional range' })}>Export analytics fixture</button>
  <button id="empty-analytics-export" onClick={() => exportAnalyticsToXlsx()}>Export empty analytics fixture</button>
  <RecentSubmissionsTable />
</MemoryRouter></QueryClientProvider>);
