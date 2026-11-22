import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

const chromeAvailable = [process.env.CHROME_PATH, process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'), '/usr/bin/google-chrome', '/usr/bin/chromium'].some(file => file && existsSync(file));

test('draft card preserves review details, attachment preview and confirmation guards', { skip: !chromeAvailable && 'Set CHROME_PATH to run browser coverage', timeout: 90000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/registration-preview', server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const directory = 'node_modules/.cache/vista-design-review/button-preview';
  await fs.mkdir(directory, { recursive: true });
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
    assert.ok(point.hit, `${selector} receives the pointer`);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    await pause(60);
  };
  try {
    for (const width of [1366, 768, 360]) await t.test(`${width}px preview and controls`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/tests/fixtures/registration-preview.html` });
      await wait(`!!document.querySelector('.registration-pass-preview')`);
      await evaluate('document.fonts.ready');
      const text = await evaluate(`document.querySelector('.registration-pass-preview').textContent`);
      for (const value of ['Fictional Campus Scholars', 'Fictional Submitter', '2026–2027', 'Student Activity Request Form (SARF)', 'In-Campus', '(Today)', 'Fictional-student-activity-request-form-with-a-long-attachment-name.png', 'Draft preview']) assert.ok(text.includes(value), value);
      assert.ok(!text.includes('Reference ID') && !text.includes('Pending Structured Data'), 'drafts have no invented saved identity');
      assert.equal(await evaluate(`!!document.querySelector('.submission-pass__card .registration-pass-attachment')`), true, 'attachment preview is inside the card');
      const ticket = await evaluate(`(()=>{const e=document.querySelector('.submission-pass__attachments'),s=getComputedStyle(e),cut=getComputedStyle(e,'::before');return{seam:s.borderTopStyle,background:s.backgroundColor,cutout:cut.content,cutoutSize:cut.width,ink:getComputedStyle(e.querySelector('button')).color}})()`);
      assert.deepEqual(ticket,{seam:'none',background:'rgba(0, 0, 0, 0)',cutout:'none',cutoutSize:'auto',ink:'rgb(243, 239, 255)'},'Attachments use the card face without a separate ticket footer');
      assert.ok(await evaluate(`!!document.querySelector('.submission-pass__face .submission-pass__attachments') && !document.querySelector('.submission-pass__wordmark')`), 'file occupies the former wordmark area');
      if(width===1366) {
        const card = await evaluate(`(()=>{const r=document.querySelector('.submission-pass__card').getBoundingClientRect();return{width:r.width,height:r.height}})()`);
        assert.ok(card.width<=720 && card.height<500, `draft card stays compact: ${JSON.stringify(card)}`);
      }
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false, 'long filenames stay inside the viewport');
      const colors = await evaluate(`[...document.querySelectorAll('.filter-btn,.export-btn')].map(e=>({bg:getComputedStyle(e).backgroundColor,ink:getComputedStyle(e).color,icon:getComputedStyle(e.querySelector('svg')).color}))`);
      for (const color of colors) assert.deepEqual(color, { bg: 'rgb(26, 89, 165)', ink: 'rgb(255, 255, 255)', icon: 'rgb(255, 255, 255)' });
      assert.equal(await evaluate(`getComputedStyle(document.querySelector('input[type=search]')).borderTopColor`), 'rgb(137, 155, 177)', 'search border is visible before focus');
      await evaluate(`document.querySelector('.registration-pass-attachment').focus()`);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await wait(`!!document.querySelector('[role=dialog]')`);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await wait(`!document.querySelector('[role=dialog]')`);
      assert.equal(await evaluate(`document.activeElement.classList.contains('registration-pass-attachment')`), true, 'preview returns focus to attachment');
      await evaluate(`window.previewEvents=[];for(const type of ['mousedown','mouseup','click'])document.addEventListener(type,e=>window.previewEvents.push({type,target:e.target.textContent,scrollY}),true)`);
      await click('.responsive-actions button:first-child');
      assert.equal(await evaluate(`JSON.parse(document.querySelector('#callbacks').textContent).redo`), 1, JSON.stringify(await evaluate('window.previewEvents')));
      await click('.responsive-actions button:last-child');
      assert.deepEqual(await evaluate(`JSON.parse(document.querySelector('#callbacks').textContent)`), { approved: 1, redo: 1 }, 'original callbacks stay connected');
      await click('#toggle-busy');
      assert.equal(await evaluate(`[...document.querySelectorAll('.responsive-actions button')].every(e=>e.disabled && e.getAttribute('aria-busy')==='true')`), true, 'pending blocks repeated approval and redo');
      await click('.responsive-actions button:last-child');
      assert.equal(await evaluate(`JSON.parse(document.querySelector('#callbacks').textContent).approved`), 1);
      await click('#toggle-busy');
      await evaluate('scrollTo(0,0)');
      await browser.screenshot(`${directory}/registration-${width}.png`, true);
      await click('#toggle-file');
      assert.equal(await evaluate(`document.querySelector('.registration-pass-attachment').disabled`), true);
      assert.ok(await evaluate(`document.querySelector('.registration-pass-attachment').textContent.includes('No File Attached')`));
      assert.equal(await evaluate(`document.querySelector('.responsive-actions button:last-child').disabled`), false, 'optional attachment does not block confirmation');
    });
    assert.equal(browser.requests.filter(r => !['GET', 'HEAD'].includes(r.method)).length, 0, 'the preview itself never writes data');
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
