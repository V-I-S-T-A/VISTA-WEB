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

test('comment reply editor follows the selected row without losing drafts, targets or permissions', { skip: !chromeAvailable && 'Set CHROME_PATH for browser coverage', timeout: 90000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/inline-replies', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { evaluate, send, wait } = browser;
  const directory = 'node_modules/.cache/vista-design-review/inline-replies';
  await fs.mkdir(directory, { recursive: true });
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await pause(50);
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
    assert.ok(point.hit, `${selector} receives the pointer`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await pause(50);
  };
  const row = index => `.reply-thread-list>.reply-thread-item:nth-child(${index})`;
  try {
    for (const role of ['student', 'staff']) for (const width of [320, 390, 1366]) await t.test(`${role} at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      const url = `${origin}/tests/fixtures/inline-review-replies.html?role=${role}`;
      await send('Page.navigate', { url });
      await wait('!!document.querySelector(".review-reply-thread")');
      await evaluate('localStorage.clear()');
      await send('Page.navigate', { url });
      await wait('!!document.querySelector(".review-reply-thread button[data-ui=toggle]")');
      await click('.review-reply-thread button[data-ui=toggle]');
      await wait('document.querySelectorAll(".reply-thread-item").length===4');
      await click(`${row(1)} .reply-thread-action`);
      assert.ok(await evaluate(`document.activeElement===document.querySelector('${row(1)} textarea')`), 'selected comment editor receives focus');
      assert.equal(await evaluate('document.querySelectorAll("textarea").length'), 1, 'only one editor exists');
      await send('Input.insertText', { text: 'Keep this draft' });
      if (role === 'student') {
        await click('.reply-link-add');
        await click('.reply-link-input');
        await send('Input.insertText', { text: 'https://example.test/reference' });
      }
      await click(`${row(3)} .reply-thread-action`);
      assert.equal(await evaluate(`document.querySelector('${row(3)} textarea').value`), 'Keep this draft', 'switching comments keeps text');
      if (role === 'student') assert.equal(await evaluate('document.querySelector(".reply-link-input").value'), 'https://example.test/reference', 'switching keeps the optional link');
      await click('.reply-compose-context button');
      assert.ok(await evaluate(`document.activeElement===document.querySelector('${row(3)} .reply-thread-action')`), 'Cancel returns focus');
      assert.equal(await evaluate('document.querySelector("textarea").closest(".reply-thread-item")'), null, 'Cancel returns the composer to the thread footer');
      assert.equal(await evaluate('document.querySelector("textarea").value'), 'Keep this draft');
      await click(`${row(2)} .reply-thread-action`);
      assert.ok(await evaluate(`document.activeElement===document.querySelector('${row(2)} textarea')`));
      assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'), false);
      await browser.screenshot(`${directory}/${role}-${width}.png`, true);
      await evaluate('window.inlineReplyFixture.loseNextResponse=true');
      await click('.reply-send-button');
      assert.ok(await evaluate('document.querySelector("textarea").disabled && [...document.querySelectorAll(".reply-thread-action")].every(e=>e.disabled)'), 'pending send prevents editing or switching its target');
      await wait('!!document.querySelector(".reply-compose [role=alert]")');
      assert.equal(await evaluate(`document.querySelector('${row(2)} textarea').value`), 'Keep this draft', 'a failed response keeps the inline draft');
      await click('.reply-send-button');
      await wait('document.querySelectorAll(".reply-thread-item").length===5 && !document.querySelector("textarea").disabled');
      const state = await evaluate('({posts:window.inlineReplyFixture.posts,reads:window.inlineReplyFixture.reads,count:window.inlineReplyFixture.saved.length})');
      assert.equal(state.posts.length, 2);
      assert.equal(state.posts[0].parent_reply, 'second', 'submitted reply belongs to the selected comment');
      assert.equal(state.posts[0].client_request_id, state.posts[1].client_request_id, 'retry preserves request identity');
      assert.equal(state.count, 5, 'retry does not duplicate the saved reply');
      assert.ok(state.reads >= 2, 'success performs a fresh reply read');
      assert.equal(await evaluate('document.querySelector("textarea").value'), '');
      await send('Page.navigate', { url });
      await wait('!!document.querySelector(".review-reply-thread button[data-ui=toggle]")');
      await click('.review-reply-thread button[data-ui=toggle]');
      await wait('document.querySelectorAll(".reply-thread-item").length===5');
      assert.ok(await evaluate('document.querySelector(".reply-thread-list").textContent.includes("Keep this draft")'), 'saved reply is retrieved after reload');
    });
    await send('Page.navigate', { url: `${origin}/tests/fixtures/inline-review-replies.html?role=viewer` });
    await wait('!!document.querySelector(".review-reply-thread button[data-ui=toggle]")');
    await click('.review-reply-thread button[data-ui=toggle]');
    await wait('document.querySelectorAll(".reply-thread-item").length===4');
    assert.equal(await evaluate('document.querySelectorAll("textarea,.reply-thread-action").length'), 0, 'view-only users cannot open a composer');
    assert.deepEqual(browser.exceptions, []);
    assert.deepEqual(browser.requests.filter(request => !['GET', 'HEAD', 'OPTIONS'].includes(request.method)), [], 'all simulated writes stay inside the isolated fixture');
  } finally { await browser.close(); await server.close(); }
});
