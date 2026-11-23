import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

test('submission summaries lead stacked detail layouts and preserve authorized context', { timeout: 120000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/landscape-card', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const directory = 'node_modules/.cache/vista-design-review/submission-details';
  await fs.mkdir(directory, { recursive: true });
  try {
    for (const page of ['registration-preview', 'archive-presentation', 'student-detail-identity']) for (const width of [320, 360, 390, 768, 1024, 1440]) await t.test(`${page} at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `${origin}/tests/fixtures/${page}.html?scenario=preview` });
      await wait(`!!document.querySelector('.submission-details-panel__fields') && !!document.querySelector('.submission-pass__card--compact')`);
      await evaluate('document.fonts.ready'); await pause(100);
      const state = await evaluate(`(()=>{
        const panel=document.querySelector('.submission-details-panel'),card=document.querySelector('.submission-pass__card--compact'),p=panel.getBoundingClientRect(),c=card.getBoundingClientRect();
        const history=document.querySelector('.submission-review-history,.submission-history-panel'),h=history?.getBoundingClientRect();
        return { overflow:document.documentElement.scrollWidth>innerWidth+1,editable:panel.querySelectorAll('input,select,textarea,form,[contenteditable=true]').length,fields:[...panel.querySelectorAll('.submission-details-panel__label')].map(e=>e.textContent),white:getComputedStyle(panel).backgroundColor,sideBySide:c.left>=p.right-1,primaryFirst:p.top<=c.top+1,summaryFirst:c.bottom<=p.top+1,historyAfter:!h||c.bottom<=h.top+1,compact:c.width<=441&&c.height<450,art:!!card.querySelector('.submission-pass__banner img')&&!!card.querySelector('.submission-pass__waves'),historyAligned:!h||Math.abs(h.width-p.width)<2,decisionAfter:!document.querySelector('.submission-review-decision')||c.bottom<=document.querySelector('.submission-review-decision').getBoundingClientRect().top+1};
      })()`);
      assert.equal(state.editable, 0, 'no form controls or editing behavior in extracted details');
      assert.equal(state.overflow, false, JSON.stringify(state));
      assert.equal(state.white, 'rgb(255, 255, 255)');
      for (const label of ['Organization', 'Submitted by', 'Academic year', 'Document type', 'Category', 'Document title']) assert.ok(state.fields.includes(label), label);
      assert.ok(state.compact && state.art, 'secondary card remains compact with its artwork and waves');
      const summaryLeads = page !== 'registration-preview' && width <= (page === 'archive-presentation' ? 1199 : 1100);
      assert.ok(summaryLeads ? state.summaryFirst && state.historyAfter && state.decisionAfter : state.primaryFirst, summaryLeads ? 'summary card precedes details, history and Staff actions on smaller screens' : 'desktop and registration preview order stay unchanged');
      if (width === 1440) assert.ok(state.sideBySide && state.historyAligned && state.decisionAfter, 'desktop column alignment and Staff action order');
      if (page === 'student-detail-identity') {
        assert.equal(await evaluate(`document.querySelectorAll('.submission-detail-layout a').length`), 0, 'staff-only files and Drive links are never exposed, even if supplied in the fixture');
        assert.deepEqual(await evaluate('window.studentIdentityFixture.writes'), []);
      }
      if (page === 'archive-presentation') assert.deepEqual(await evaluate('window.__fixtureWrites'), []);
      if (page === 'registration-preview') assert.deepEqual(await evaluate(`JSON.parse(document.querySelector('#callbacks').textContent)`), { approved: 0, redo: 0 }, 'rendering never approves or redoes a draft');
      await browser.screenshot(`${directory}/${page}-${width}.png`, true);
    });
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
