import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { mkdtempSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { exportAnalyticsToXlsx } from '../src/utils/xlsxExport.js';

// SheetJS's ESM entry requires explicit filesystem support in Node. Browser
// exports still use the unmodified download path without filesystem access.
XLSX.set_fs(fs);

test('staff analytics export round-trips all sheets, counts, identities and mapped statuses', () => {
  const original = process.cwd(), directory = mkdtempSync(path.join(tmpdir(), 'vista-export-test-'));
  try {
    process.chdir(directory);
    exportAnalyticsToXlsx({ total: 6, status_counts: { pending: 1, under_review: 2, approved: 1, rejected: 1, resubmission_required: 1 }, approval_rate: 33 }, [{ submission_id: '12345678-test', title: 'Fictional Report', org_name: 'Example Organization', submitted_by_name: 'Sample Student', submitted_by_email: 'student@example.test', status: 'under_review' }], { timeframe: 'Fictional range' });
    const files = readdirSync(directory); assert.equal(files.length, 1); assert.match(files[0], /^VISTA_Staff_Analytics_.*\.xlsx$/);
    const book = XLSX.readFile(path.join(directory, files[0]));
    assert.deepEqual(book.SheetNames, ['Executive Summary', 'Status & Category', 'Organizations', 'Doc Types & Trends', 'Submissions Registry']);
    const rows = XLSX.utils.sheet_to_json(book.Sheets['Executive Summary'], { header: 1 });
    assert.equal(rows.find(row => row[0] === 'Total Submissions')[1], 6);
    assert.equal(rows.find(row => row[0] === 'Process (Pending / Review)')[1], 3);
    assert.equal(rows.find(row => row[0] === 'Returned (Rejected / Resubmit)')[1], 2);
    const registry = XLSX.utils.sheet_to_json(book.Sheets['Submissions Registry']);
    assert.equal(registry[0]['Applicant Email'], 'student@example.test');
    assert.equal(registry[0].Status, 'Process');
    assert.equal(registry[0]['Document Title'], 'Fictional Report');
  } finally {
    process.chdir(original);
    for (const file of readdirSync(directory)) unlinkSync(path.join(directory, file));
    rmdirSync(directory);
  }
});
