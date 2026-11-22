import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

test('hook fixes preserve Admin drafts/resets, sessions, Drive callbacks and account-isolated toasts', { timeout: 90000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/ci-hardening', server: { host: '127.0.0.1', port: 0, hmr: false }, define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, logLevel: 'error' });
  let browser;
  try {
    await server.listen(); browser = await openDesignBrowser();
    await browser.send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/tests/fixtures/ci-hardening.html` });
    await browser.wait('!!window.hardening');
    const { evaluate, wait } = browser;
    const render = async (screen, props = {}, route = '/') => { await evaluate(`hardening.render(${JSON.stringify(screen)},${JSON.stringify(props)},${JSON.stringify(route)})`); await pause(100); };
    const input = async (selector, value) => { await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`); await pause(50); };
    await t.test('Add organization preserves drafts until close, then starts clean', async () => {
      await render('add'); await wait('!!document.querySelector("input[placeholder*=Society]")');
      await input('input[placeholder*=Society]', 'Unsaved fictional draft');
      await render('add'); assert.equal(await evaluate('document.querySelector("input[placeholder*=Society]").value'), 'Unsaved fictional draft');
      await render('add', { isOpen: false }); await render('add');
      assert.equal(await evaluate('document.querySelector("input[placeholder*=Society]").value'), '');
    });
    await t.test('Edit organization resets to the selected organization, never the previous draft', async () => {
      await render('edit', { org: { name: 'Fictional First', acronym: 'FF', is_active: false } });
      await wait('!!document.querySelector("input[placeholder*=Society]")');
      assert.equal(await evaluate('document.querySelector("input[placeholder*=Society]").value'), 'Fictional First');
      await render('edit', { org: { name: 'Fictional Second', acronym: 'FS', is_active: true } });
      assert.equal(await evaluate('document.querySelector("input[placeholder*=Society]").value'), 'Fictional Second');
    });
    await t.test('Configuration entry initializes and resets on mode/record changes', async () => {
      await render('config', { activeTab: 'document_types', initialData: { name: 'Fictional Type' } });
      await wait('!!document.querySelector("#config-entry-name")');
      assert.equal(await evaluate('document.querySelector("#config-entry-name").value'), 'Fictional Type');
      await input('#config-entry-name', 'Unsaved');
      await render('config', { isOpen: false, activeTab: 'document_types' });
      await render('config', { activeTab: 'document_types' });
      assert.equal(await evaluate('document.querySelector("#config-entry-name").value'), '');
    });
    await t.test('Failed Admin deletion retains the error, then clears it on reopen', async () => {
      const props = { activeTab: 'document_types', itemToDelete: { id: 'fictional', name: 'Protected fictional type' } };
      await render('delete', props);
      await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Yes, Delete')).click()`);
      await wait('document.body.innerText.includes("Fictional protected entry")');
      await render('delete', { ...props, isOpen: false }); await render('delete', props);
      assert.equal(await evaluate('document.body.innerText.includes("Fictional protected entry")'), false);
      assert.equal(await evaluate('hardening.events.deletes'), 1);
    });
    await t.test('Password section opens when the asynchronous force flag arrives', async () => {
      await render('password', { forceOpen: false });
      assert.equal(await evaluate('document.querySelectorAll("input[type=password]").length'), 0);
      await render('password', { forceOpen: true });
      assert.equal(await evaluate('document.querySelectorAll("input[type=password]").length'), 3);
    });
    await t.test('Login initializes the existing remembered-account behavior', async () => {
      await evaluate(`localStorage.setItem('vista_remembered_accounts',JSON.stringify({'fixture@example.test':btoa('Fictional-only-123')}));localStorage.setItem('vista_last_remembered_email','fixture@example.test')`);
      await render('login');
      assert.equal(await evaluate('document.querySelector("input[type=email]").value'), 'fixture@example.test');
      assert.equal(await evaluate('document.querySelector("input[type=password]").value'), 'Fictional-only-123');
    });
    await t.test('Drive backend success and error paths do not exchange the code again', async () => {
      await render('drive', {}, '/callback?status=success');
      await wait('document.body.innerText.includes("Connected!")');
      assert.equal(await evaluate('hardening.events.exchanges.length'), 0);
      await render('password'); await render('drive', {}, '/callback?status=error&detail=Fictional%20denial');
      await wait('document.body.innerText.includes("Fictional denial")');
      assert.equal(await evaluate('hardening.events.exchanges.length'), 0);
    });
    await t.test('Drive legacy callback exchanges once and rejects missing authorization', async () => {
      await render('password'); await render('drive', {}, '/callback?code=fictional-code&state=fictional-state');
      await wait('document.body.innerText.includes("Connected!")');
      assert.equal(await evaluate('hardening.events.exchanges.length'), 1);
      await render('password'); await render('drive', {}, '/callback?code=fictional-code&state=fictional-state');
      await pause(150);
      assert.equal(await evaluate('hardening.events.exchanges.length'), 1, 'consumed codes are not replayed');
      await render('password'); await render('drive');
      await wait('document.body.innerText.includes("Missing authorization details")');
      assert.equal(await evaluate('hardening.events.exchanges.length'), 1);
    });
    await t.test('Staff toast deduplicates and rejects clicks after an account switch', async () => {
      await evaluate(`hardening.account('staff-one')`); await render('notifications'); await pause(150);
      await evaluate(`hardening.notify('fictional-alert')`); await wait('hardening.events.toasts.length===1');
      await evaluate(`hardening.notify('fictional-alert')`); await pause(150);
      assert.equal(await evaluate('hardening.events.toasts.length'), 1);
      await evaluate(`hardening.account('staff-two')`); await pause(150);
      await evaluate('hardening.events.toasts[0][3].onClick()');
      assert.equal(await evaluate('document.querySelector("#route").textContent'), '/');
      assert.equal(await evaluate('hardening.events.reads.filter(id=>id==="fictional-alert").length'), 0);
    });
    assert.deepEqual(await evaluate('hardening.events.blocked'), []);
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser?.close(); await server.close(); }
});
