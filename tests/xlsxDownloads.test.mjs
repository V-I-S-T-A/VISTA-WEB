import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

const XLSX = createRequire(import.meta.url)('xlsx');
function workbookContents(file) {
  const book = XLSX.readFile(file, { cellStyles: true });
  return book.SheetNames.map(name => {
    const sheet = book.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (name === 'Executive Summary') {
      assert.equal(typeof rows[4][1], 'string');
      assert.ok(rows[4][1].length > 5);
      rows[4][1] = '<export timestamp>';
    }
    return { name, rows, widths: sheet['!cols'].map(column => column.wch) };
  });
}

test('actual browser downloads preserve both spreadsheet export contracts', { timeout: 90000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'vista-xlsx-downloads-'));
  const server = await createServer({ configFile: false, plugins: [react()], cacheDir: 'node_modules/.vite-tests/xlsx-exports', server: { host: '127.0.0.1', port: 0, hmr: false }, define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, logLevel: 'error' });
  let browser;
  try {
    await server.listen(); browser = await openDesignBrowser();
    await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: directory });
    await browser.send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/tests/fixtures/xlsx-exports.html` });
    await browser.wait('document.body.innerText.includes("Example <Report>")');
    const today = await browser.evaluate('new Date().toISOString().split("T")[0]');
    const download = async (click, filename) => {
      await browser.evaluate(click);
      for (let attempt = 0; attempt < 150; attempt++) {
        if ((await readdir(directory)).includes(filename)) return path.join(directory, filename);
        await pause(100);
      }
      throw new Error(`No completed browser download: ${filename}`);
    };
    const analyticsName = `VISTA_Staff_Analytics_${today}.xlsx`;
    const analytics = await download('document.querySelector("#analytics-export").click()', analyticsName);
    const expected = JSON.parse(await readFile(new URL('./fixtures/xlsx-export-contract.json', import.meta.url), 'utf8'));
    assert.deepEqual(workbookContents(analytics), expected.analytics, 'all analytics cells, sheet order, headers and column widths match the pre-upgrade workbook');
    await browser.evaluate(`[...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Export').click()`);
    const recent = await download(`[...document.querySelectorAll('button')].find(button => button.textContent.includes('Excel')).click()`, `recent_submissions_${today}.xlsx`);
    assert.deepEqual(workbookContents(recent), expected.recent, 'recent export preserves all filtered rows (including the next page), mappings, fallbacks and widths');
    await rm(analytics);
    const empty = await download('document.querySelector("#empty-analytics-export").click()', analyticsName);
    assert.deepEqual(workbookContents(empty), expected.empty, 'empty analytics keeps four sheets, zero counts and no registry');
    assert.deepEqual(browser.exceptions, []);
    assert.equal(browser.requests.some(request => request.url.startsWith('https://')), false);
  } finally {
    await browser?.close(); await server.close();
    // directory is created and owned by this test under the system temp directory.
    await rm(directory, { recursive: true, force: true });
  }
});
