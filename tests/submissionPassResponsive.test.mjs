import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

test('shared submission card keeps a landscape footprint and accessible full details', { timeout: 90000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/landscape-card', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const directory = 'node_modules/.cache/vista-design-review/landscape-card';
  await fs.mkdir(directory, { recursive: true });
  const measure = () => evaluate(`(()=>{
    const card=document.querySelector('.submission-pass__card'),r=card.getBoundingClientRect(),files=card.querySelector('.submission-pass__attachments');
    const visible=[...card.querySelectorAll('button,a')].filter(e=>e.getBoundingClientRect().height>0);
    return{ratio:r.width/r.height,height:r.height,width:r.width,overflow:document.documentElement.scrollWidth>innerWidth+1,filesInside:!files||files.getBoundingClientRect().bottom<=r.bottom+1,controlsInside:visible.every(e=>{const q=e.getBoundingClientRect();return q.left>=r.left&&q.right<=r.right+1&&q.bottom<=r.bottom+1}),secondaryVisible:card.querySelector('.submission-pass__contact').getBoundingClientRect().height>0,toggleVisible:getComputedStyle(card.querySelector('.submission-pass__details-toggle')).display!=='none'};
  })()`);
  const toggle = async () => {
    await evaluate(`document.querySelector('.submission-pass__details-toggle').focus()`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await pause(50);
  };
  try {
    for (const page of ['registration-preview', 'archive-presentation', 'student-detail-identity']) for (const width of [320, 360, 390, 480, 768, 1366]) await t.test(`${page} at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `${origin}/tests/fixtures/${page}.html?scenario=preview` });
      await wait(`!!document.querySelector('.submission-pass__attachments') && !document.querySelector('[aria-label="Loading attached documents"]')`);
      await evaluate('document.fonts.ready');
      await pause(100);
      const collapsed = await measure();
      assert.equal(collapsed.overflow, false);
      assert.equal(collapsed.filesInside, true, 'file controls and Student notice stay inside the card');
      assert.equal(collapsed.controlsInside, true, 'controls are never clipped by the rounded card');
      if (width <= 480) {
        assert.ok(collapsed.ratio >= 1.35 && collapsed.ratio <= 1.65, `landscape phone card ratio is ${collapsed.ratio}`);
        assert.equal(collapsed.secondaryVisible, false);
        assert.equal(collapsed.toggleVisible, true);
        await browser.screenshot(`${directory}/${page}-${width}.png`, true);
        await toggle();
        assert.equal(await evaluate(`document.querySelector('.submission-pass__details-toggle').getAttribute('aria-expanded')`), 'true');
        const expanded = await measure();
        assert.equal(expanded.secondaryVisible, true, 'full contact and document type remain available with the keyboard');
        assert.ok(expanded.height > collapsed.height, 'opening full details grows the card');
        assert.equal(expanded.overflow, false);
        assert.equal(expanded.filesInside, true);
        assert.equal(expanded.controlsInside, true);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('.submission-pass__organization')).display !== 'none'`), true);
        await browser.screenshot(`${directory}/${page}-${width}-expanded.png`, true);
        await toggle();
        assert.ok(Math.abs((await measure()).height - collapsed.height) < 1, 'closing returns the original footprint');
        if (page === 'student-detail-identity') assert.equal(await evaluate('document.querySelectorAll(".submission-pass a").length'), 0, 'Student access never exposes staff-only files');
        // Breakpoints follow the card's available width, including narrow desktop columns.
        await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
        await evaluate(`document.querySelector('.submission-pass').style.width='300px'`);
        await pause(100);
        assert.equal((await measure()).toggleVisible, true);
      } else {
        assert.equal(collapsed.secondaryVisible, true, 'desktop metadata stays visible');
        assert.equal(collapsed.toggleVisible, false, 'desktop needs no extra interaction');
      }
    });
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
