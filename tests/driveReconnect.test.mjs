import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser } from './helpers/designBrowser.mjs';

test('Staff Drive reconnect preserves existing OAuth/folder workflows', { timeout: 120000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/drive-reconnect', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const visit = async scenario => {
    await send('Page.navigate', { url: `${origin}/tests/fixtures/drive-reconnect.html?scenario=${scenario}` });
    await wait(`!!window.driveReconnectFixture && !!document.querySelector('.drive-connection-panel')`);
  };
  const click = async (label, scope = 'document') => {
    await evaluate(`(()=>{const b=[...${scope}.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)throw new Error('Missing button: '+${JSON.stringify(label)});b.focus();b.click()})()`);
  };
  const key = async value => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code: value, windowsVirtualKeyCode: value === 'Escape' ? 27 : 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code: value, windowsVirtualKeyCode: value === 'Escape' ? 27 : 9 });
  };
  const openReconnect = async () => {
    await wait(`!!document.querySelector('[role=alert]')`);
    await click('Reconnect');
    await wait(`!!document.querySelector('[role=dialog]')`);
  };
  try {
    await t.test('plain confirmation, modal keyboard behavior and responsive fit', async () => {
      await visit('expired');
      await click('Change');
      await openReconnect();
      assert.equal(await evaluate(`document.querySelector('[role=dialog]').getAttribute('aria-label')`), 'Reconnect your account');
      assert.equal(await evaluate(`document.querySelector('[role=dialog]').textContent.includes('previous-drive@example.test')`), false);
      assert.equal(await evaluate(`document.querySelector('[role=dialog]').textContent.includes('Saved Mobile Archive')`), false);
      assert.equal(await evaluate(`document.querySelector('[role=dialog]').textContent.includes('vista-login@example.test')`), false);
      assert.equal(await evaluate(`window.driveReconnectFixture.calls.some(c=>c.url==='/drive/auth/start/' || c.method!=='get')`), false);
      assert.equal(await evaluate(`document.body.style.overflow`), 'hidden');
      for (const width of [1440, 360]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false });
        assert.ok(await evaluate(`(()=>{const r=document.querySelector('.vista-status-modal').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1})()`));
        for (let i = 0; i < 5; i++) { await key('Tab'); assert.ok(await evaluate(`document.querySelector('[role=dialog]').contains(document.activeElement)`)); }
      }
      await fs.mkdir('output/drive-reconnect', { recursive: true });
      await browser.screenshot('output/drive-reconnect/mobile-modal.png');
      await key('Escape');
      await wait(`!document.querySelector('[role=dialog]')`);
      assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Reconnect');
      assert.notEqual(await evaluate('document.body.style.overflow'), 'hidden');
      await openReconnect(); await click('Cancel', "document.querySelector('[role=dialog]')");
      await wait(`!document.querySelector('[role=dialog]')`);
      await openReconnect();
      await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
      await browser.screenshot('output/drive-reconnect/desktop-modal.png');
      const before = await evaluate(`window.driveReconnectFixture.calls.filter(c=>c.url==='/drive/folders/').length`);
      await click('Reconnect', "document.querySelector('[role=dialog]')");
      await wait(`document.activeElement?.textContent.trim()==='Sign in with Google'`);
      assert.ok(await evaluate(`document.body.innerText.includes('Internal Staff Login')`));
      assert.equal(await evaluate(`window.driveReconnectFixture.calls.filter(c=>c.url==='/drive/folders/').length`), before);
      assert.equal(await evaluate(`window.driveReconnectFixture.calls.some(c=>c.url==='/drive/auth/start/')`), false, 'confirmation opens existing sign-in card first');
    });
    await t.test('OAuth failure is retryable, pending guarded and uses unchanged auth endpoint', async () => {
      await click('Sign in with Google');
      await wait(`!!document.querySelector('button[aria-busy=true]:disabled')`);
      await wait(`document.body.innerText.includes("Couldn't start Google sign-in")`);
      assert.deepEqual(await evaluate(`window.driveReconnectFixture.calls.find(c=>c.url==='/drive/auth/start/').params`), { mode: 'existing', client_type: 'web' });
      assert.equal(await evaluate(`window.driveReconnectFixture.calls.some(c=>c.method!=='get')`), false);
      await evaluate(`window.driveReconnectFixture.authFails=false`);
      await click('Sign in with Google');
      await wait(`location.pathname==='/mock-google-auth'`);
    });
    await t.test('no metadata required and disconnected users keep sign-in', async () => {
      await visit('missing'); await openReconnect();
      assert.equal(await evaluate(`document.querySelector('[role=dialog]').getAttribute('aria-label')`), 'Reconnect your account');
      await visit('disconnected');
      assert.ok(await evaluate(`document.body.innerText.includes('Sign in with Google')`));
      assert.equal(await evaluate(`!!document.querySelector('[role=dialog]')`), false);
    });
    await t.test('existing-folder selection still saves and refetches connection', async () => {
      await visit('healthy');
      await wait(`document.body.innerText.includes('Existing Archive')`);
      await click('Existing Archive');
      await wait(`document.body.innerText.includes('Google Drive Connected')`);
      assert.ok(await evaluate(`document.body.innerText.includes('Existing Archive')`));
      assert.ok(await evaluate(`window.driveReconnectFixture.calls.filter(c=>c.url==='/drive/connection/').length>=2`));
      assert.deepEqual(await evaluate(`JSON.parse(window.driveReconnectFixture.calls.find(c=>c.url==='/drive/folders/select/').data)`), { folder_id: 'existing-folder', folder_name: 'Existing Archive' });
    });
    await t.test('new-folder creation still saves and refetches connection', async () => {
      await visit('healthy'); await click('New Folder');
      await evaluate(`(()=>{const input=document.querySelector('input[placeholder="New folder name"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'New Staff Archive');input.dispatchEvent(new Event('input',{bubbles:true}))})()`);
      await click('Create & Use Folder');
      await wait(`document.body.innerText.includes('Google Drive Connected')`);
      assert.ok(await evaluate(`document.body.innerText.includes('New Staff Archive')`));
      assert.deepEqual(await evaluate(`JSON.parse(window.driveReconnectFixture.calls.find(c=>c.url==='/drive/folders/create/').data)`), { folder_name: 'New Staff Archive' });
    });
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
