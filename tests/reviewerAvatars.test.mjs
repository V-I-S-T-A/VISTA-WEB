import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser } from './helpers/designBrowser.mjs';

test('reviewer photos use API image URLs and missing/broken photos use the circular default image', { timeout: 120000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/reviewer-avatars', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const selectors = {
    staff: '[data-avatar-review=staff] .submission-review-history .overflow-hidden img',
    student: '[data-avatar-review=student] .submission-history-panel img',
    remarks: '[data-avatar-review=remarks] img[alt="Staff Avatar"]',
    drive: '[data-avatar-review=drive] img',
    reply: '[data-avatar-review=reply] .reply-thread-item img',
  };
  try {
    for (const mode of ['photo', 'missing', 'broken']) await t.test(mode, async () => {
      await send('Page.navigate', { url: `${origin}/tests/fixtures/reviewer-avatars.html?avatar=${mode}` });
      await wait(`!!document.querySelector('[data-avatar-review=reply] button[data-ui=toggle]')`);
      await evaluate(`document.querySelector('[data-avatar-review=reply] button[data-ui=toggle]').click()`);
      for (const [name, selector] of Object.entries(selectors)) {
        const query = JSON.stringify(selector);
        const expected = mode === 'photo' ? 'window.reviewerAvatars.expectedPhoto' : 'window.reviewerAvatars.defaultAvatar';
        await wait(`(()=>{const e=document.querySelector(${query});return e?.complete && e.naturalWidth>0 && e.getAttribute('src')===${expected}})()`);
        const shape = await evaluate(`(()=>{const e=document.querySelector(${query}),r=e.getBoundingClientRect(),s=getComputedStyle(${name === 'staff' ? 'e.parentElement' : 'e'});return{w:r.width,h:r.height,radius:s.borderRadius}})()`);
        assert.equal(shape.w, shape.h, `${name}: square dimensions`);
        assert.ok(shape.radius === '50%' || parseFloat(shape.radius) >= shape.w / 2, `${name}: circular clipping`);
      }
      assert.ok(await evaluate(`window.reviewerAvatars.reads.some(url=>url.startsWith('/review-logs/'))`), 'fresh API history read supplies reviewer image');
      assert.ok(await evaluate(`window.reviewerAvatars.reads.some(url=>url.includes('/replies/'))`), 'fresh reply read supplies author image');
      assert.deepEqual(await evaluate('window.reviewerAvatars.writes'), []);
    });
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
