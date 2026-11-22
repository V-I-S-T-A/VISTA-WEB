import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const chrome = [process.env.CHROME_PATH, process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'), '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(file => file && existsSync(file));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

test('nested filter options and calendars remain visible, clickable and preserve date contracts', { skip: !chrome && 'Set CHROME_PATH to run browser interaction coverage', timeout: 90000 }, async t => {
  // A standalone local component fixture: no API, accounts or production config.
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()],
    cacheDir: 'node_modules/.vite-tests/filter-interactions', server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
    logLevel: 'error', optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime', 'lucide-react', '@tanstack/react-query', 'axios'] } });
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'vista-ui-filter-'));
  let child, ws, send;
  try {
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let debugPort;
    for (let i = 0; i < 100; i++) { try { debugPort = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await pause(100); } }
    assert.ok(debugPort, 'Chrome exposes its temporary debug endpoint');
    const pages = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
    ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let id = 0; const pending = new Map();
    ws.onmessage = event => { const result = JSON.parse(event.data); if (result.id) { const request = pending.get(result.id); pending.delete(result.id); result.error ? request.reject(result.error) : request.resolve(result.result); } };
    send = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); ws.send(JSON.stringify({ id: next, method, params })); });
    const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true }); assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails)); return result.result.value; };
    const wait = async expression => { for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await pause(100); } assert.fail(`Timed out: ${expression}`); };
    const click = async selector => {
      const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:e.contains(document.elementFromPoint(x,y))};})()`);
      assert.ok(point.hit, `${selector} receives the click instead of an overlapping parent`);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
      await pause(50);
    };
    const key = async (value, code = value, modifiers = 0) => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code, modifiers, text: value === 'Enter' ? '\r' : undefined, windowsVirtualKeyCode: value === 'Escape' ? 27 : value === 'Enter' ? 13 : value === 'ArrowRight' ? 39 : value === 'a' ? 65 : 0 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code, modifiers }); await pause(30); };
    const option = async label => { const id = await evaluate(`[...document.querySelectorAll('[role="option"]')].find(e=>e.textContent.trim()===${JSON.stringify(label)})?.id`); assert.ok(id, `Option ${label} exists`); await click(`[id="${id}"]`); };
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    await send('Network.setBlockedURLs', { urls: ['https://*'] });

    for (const width of [1366, 360]) await t.test(`nested controls at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `${origin}/tests/fixtures/filter-interactions.html` });
      await wait(`!!document.querySelector('#filter-trigger')`);
      await evaluate(`document.fonts.ready`);
      const palette = await evaluate(`(()=>Object.fromEntries(['primary-action','secondary-action','destructive-action','legacy-action','default-action'].map(id=>{const e=document.getElementById(id),s=getComputedStyle(e);return [id,{background:s.backgroundColor,color:s.color,radius:s.borderRadius}]})))()`);
      assert.equal(palette['primary-action'].background, 'rgb(26, 89, 165)');
      assert.equal(palette['primary-action'].color, 'rgb(255, 255, 255)');
      assert.equal(palette['default-action'].background, palette['primary-action'].background, 'table viewing actions default to navbar blue');
      assert.equal(palette['default-action'].color, palette['primary-action'].color);
      assert.equal(palette['legacy-action'].background, palette['primary-action'].background, 'legacy utility colors cannot override a semantic primary');
      assert.equal(palette['secondary-action'].background, 'rgb(255, 255, 255)');
      assert.equal(palette['destructive-action'].background, 'rgb(185, 28, 28)');
      await evaluate(`document.querySelector('#primary-action').focus()`); await key('Enter');
      assert.equal(await evaluate(`document.querySelector('#action-count').textContent`), '1', 'keyboard activation retains the original handler');
      await click('#toggle-busy'); await click('#primary-action');
      assert.equal(await evaluate(`document.querySelector('#action-count').textContent`), '1', 'pending controls cannot submit again');
      assert.equal(await evaluate(`document.querySelector('#primary-action').getAttribute('aria-busy')`), 'true');
      await click('#toggle-busy');
      await click('#open-confirm');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.vista-status-modal button[data-ui="primary"]')).backgroundColor`), 'rgb(26, 89, 165)');
      await key('Escape'); await click('#open-delete');
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.vista-status-modal button[data-ui="destructive"]')).backgroundColor`), 'rgb(185, 28, 28)', 'destructive confirmation stays red');
      await key('Escape');
      await click('#open-drive');
      await evaluate(`(()=>{for(const input of [...document.querySelectorAll('.drive-sync-modal-panel input[type="file"][multiple]')]){const transfer=new DataTransfer();for(const name of ['first.png','second.png'])transfer.items.add(new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFskAAAAASUVORK5CYII='),c=>c.charCodeAt(0))],name,{type:'image/png',lastModified:1}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));}})()`);
      await wait(`document.querySelectorAll('.drive-sync-image-grid').length===2`);
      for (const group of [0, 1]) {
        await evaluate(`document.querySelectorAll('.drive-sync-image-grid')[${group}].querySelector('button[draggable]').focus()`); await key('ArrowRight');
        assert.deepEqual(await evaluate(`[...document.querySelectorAll('.drive-sync-image-grid')[${group}].querySelectorAll('span[title]')].map(e=>e.title)`), ['second.png', 'first.png'], 'keyboard ordering changes only the selected image group');
        await key('ArrowLeft');
        assert.deepEqual(await evaluate(`[...document.querySelectorAll('.drive-sync-image-grid')[${group}].querySelectorAll('span[title]')].map(e=>e.title)`), ['first.png', 'second.png']);
      }
      assert.equal(await evaluate(`[...document.querySelectorAll('.drive-sync-modal-panel button')].find(e=>e.textContent.includes('CONFIRM & SUBMIT TO DRIVE')).disabled`), true, 'unconverted images still prevent submission');
      await key('Escape');
      await click('#open-invite');
      await wait(`!!document.querySelector('dialog[open]')`);
      assert.equal(await evaluate(`document.body.style.overflow`), 'hidden', 'native invitation dialog locks background scrolling');
      for (let index = 0; index < 5; index++) {
        await key('Tab');
        assert.ok(await evaluate(`document.querySelector('dialog[open]').contains(document.activeElement)`), 'native dialog retains keyboard focus');
      }
      await key('Escape');
      assert.equal(await evaluate(`document.activeElement.id`), 'open-invite', 'native dialog restores the opener after unmount');
      assert.notEqual(await evaluate(`document.body.style.overflow`), 'hidden', 'native dialog releases its scroll lock');
      await click('#toggle-busy'); await click('#open-invite'); await key('Escape');
      assert.ok(await evaluate(`!!document.querySelector('dialog[open]')`), 'pending invitation cannot be dismissed');
      assert.equal(await evaluate(`document.querySelector('.resend-invitation-confirm').disabled`), true, 'pending invitations cannot submit again');
      await evaluate(`document.querySelector('#toggle-busy').click()`); await key('Escape');
      assert.equal(await evaluate(`document.activeElement.id`), 'open-invite');
      await click('#filter-trigger');
      const donePoint = await evaluate(`(()=>{const e=document.querySelector('.vista-filter-footer button[data-ui="primary"]');e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...donePoint }); await pause(180);
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.vista-filter-footer button[data-ui="primary"]')).backgroundColor`), 'rgb(23, 78, 145)');
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 }); await pause(180);
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('.vista-filter-footer button[data-ui="primary"]')).backgroundColor`), 'rgb(26, 89, 165)', 'hover handlers cannot leave a legacy color behind');
      await click('[role="combobox"][aria-label="Status"]'); await wait(`!!document.querySelector('.vista-select-panel')`); await option('Approved');
      assert.equal(await evaluate(`JSON.parse(document.querySelector('#filter-state').textContent).status`), 'approved');
      assert.ok(await evaluate(`!!document.querySelector('.vista-filter-popover')`), 'selecting does not close the parent');
      await click('[role="combobox"][aria-label="Category"]'); await option('Off-Campus');
      assert.equal(await evaluate(`JSON.parse(document.querySelector('#filter-state').textContent).category`), 'off');
      await click('[aria-label="Choose from date from calendar"]'); await wait(`!!document.querySelector('.vista-calendar-popover')`);
      await click('[role="combobox"][aria-label="Month"]'); await option('June');
      await click('[role="combobox"][aria-label="Year"]'); await option('2026');
      await click('[data-date="2026-06-15"]');
      assert.equal(await evaluate(`JSON.parse(document.querySelector('#filter-state').textContent).date`), '2026-06-15');
      assert.ok(await evaluate(`!!document.querySelector('.vista-filter-popover') && !document.querySelector('.vista-calendar-popover')`));
      await click('[aria-label="Choose from date from calendar"]'); await click('.vista-calendar-footer button:first-child');
      assert.equal(await evaluate(`JSON.parse(document.querySelector('#filter-state').textContent).date`), '');
      await click('[aria-label="Choose from date from calendar"]'); await key('Escape');
      assert.ok(await evaluate(`!!document.querySelector('.vista-filter-popover') && !document.querySelector('.vista-calendar-popover')`), 'Escape closes only the calendar');
      await click('#filter-trigger'); assert.equal(await evaluate(`!!document.querySelector('.vista-filter-popover')`), false, 'filter trigger closes its own panel');
      await click('[aria-label="Choose birth date from calendar"]');
      await evaluate(`document.querySelector('[data-date="2004-06-15"]').focus()`); await key('ArrowRight');
      assert.equal(await evaluate(`document.activeElement.dataset.date`), '2004-06-16');
      await key('Enter'); assert.equal(await evaluate(`document.querySelector('#birth-state').textContent`), '2004-06-16');
      await click('[aria-label="Birth date"]'); await key('a', 'KeyA', 2); await send('Input.insertText', { text: '02/30/2004' }); await click('#outside');
      assert.equal(await evaluate(`document.querySelector('[aria-label="Birth date"]').validity.valid`), false, 'invalid birth dates still block validation');
      await click('[aria-label="Birth date"]'); await key('a', 'KeyA', 2); await send('Input.insertText', { text: '02/29/2004' }); await click('#outside');
      assert.equal(await evaluate(`document.querySelector('#birth-state').textContent`), '2004-02-29', 'typed leap dates retain the ISO contract');
      await click('[aria-label="Birth date"]'); await key('a', 'KeyA', 2); await send('Input.insertText', { text: '12/31/2999' }); await click('#outside');
      assert.equal(await evaluate(`document.querySelector('[aria-label="Birth date"]').validity.valid`), false, 'future birth dates remain invalid');
      assert.equal(await evaluate(`document.querySelector('#birth-state').textContent`), '2004-02-29', 'invalid edits do not replace the saved field value');
      assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth+1`), false);
    });
  } finally {
    try { await send?.('Browser.close'); } catch { /* Browser may already be closed after an assertion. */ }
    ws?.close(); child?.kill(); await server.close();
    // Remove only the exact per-test directory returned by mkdtemp.
    assert.ok(path.resolve(profile).startsWith(path.join(path.resolve(os.tmpdir()), 'vista-ui-filter-')));
    await fs.rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
