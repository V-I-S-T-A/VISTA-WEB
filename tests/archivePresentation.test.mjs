import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

test('review attachments reflect persisted archive state without hiding files or failures', { timeout: 90000 }, async () => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/archive-presentation', server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  let browser;
  try {
    await server.listen(); browser = await openDesignBrowser();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    for (const scenario of ['archived', 'linkless', 'both', 'current', 'preview', 'empty', 'approved', 'pending', 'failed', 'loading']) {
      await browser.send('Page.navigate', { url: `${origin}/tests/fixtures/archive-presentation.html?scenario=${scenario}` });
      await browser.wait(`!!document.querySelector('.submission-pass__card')`);
      if (scenario === 'loading') await pause(100); else await browser.wait(`!document.querySelector('[aria-label="Loading attached documents"]') && window.__fixtureReads?.some(url=>url.includes('/submissions/'))`);
      await pause(100);
      const state = await browser.evaluate(`({attached:!!document.querySelector('.submission-pass__attachments'),empty:document.body.innerText.includes('No files attached to this submission.'),current:document.body.innerText.includes('Current attachment.pdf'),archive:!!document.querySelector('.drive-archive-card'),failure:document.body.innerText.includes('Could not load the submission files.'),writes:window.__fixtureWrites})`);
      assert.equal(state.attached, !['archived', 'linkless'].includes(scenario), `${scenario}: redundant panel visibility`);
      if(state.attached) assert.equal(await browser.evaluate(`!!document.querySelector('.submission-pass__card .submission-pass__attachments')`), true, `${scenario}: attachments and their states remain inside the saved card`);
      if(state.attached) assert.equal(await browser.evaluate(`!!document.querySelector('.submission-pass__face .submission-pass__attachments') && !document.querySelector('.submission-pass__wordmark')`),true,'saved attachments occupy the card face without a wordmark or separate footer');
      if(scenario==='preview') {
        assert.equal(await browser.evaluate(`getComputedStyle(document.querySelector('.submission-pass__attachment-preview')).color`),'rgb(243, 239, 255)','file link remains readable on purple');
        await browser.evaluate(`document.querySelector('.submission-pass__attachment-preview').focus()`);
        await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
        await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
        await browser.wait(`!!document.querySelector('[role=dialog]')`);
        await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await browser.wait(`!document.querySelector('[role=dialog]')`);
        assert.equal(await browser.evaluate(`document.activeElement.classList.contains('submission-pass__attachment-preview')`),true,'closing preview returns focus to the ticket file');
      }
      if (['empty', 'approved', 'pending'].includes(scenario)) assert.equal(state.empty, true, `${scenario}: approval/URL alone cannot imply archive success`);
      if (['both', 'current'].includes(scenario)) assert.equal(state.current, true, `${scenario}: keep current documents`);
      if (['archived', 'linkless', 'both'].includes(scenario)) assert.equal(state.archive, true, `${scenario}: keep saved archive hierarchy`);
      if (scenario === 'failed') assert.equal(state.failure, true, 'detail errors remain actionable');
      assert.deepEqual(state.writes, [], 'presentation does not mutate records');
      if (['archived','current'].includes(scenario)) {
        const out = path.resolve('node_modules/.cache/vista-design-review/archive', scenario); await fs.mkdir(out, { recursive: true });
        for (const width of [360, 390, 768, 1024, 1366, 1920]) {
          await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }); await pause(100);
          assert.equal(await browser.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false, `archive layout at ${width}px`);
          await browser.screenshot(path.join(out, `${width}.png`), true);
        }
      }
    }
    assert.equal(browser.exceptions.length, 0, 'no runtime exceptions');
  } finally { await browser?.close(); await server.close(); }
});
