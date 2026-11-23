import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';

test('Admin user activity filters include every page while summary retains account access totals', { timeout: 120000 }, async () => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/admin-user-activity', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api'), __APP_UPDATED_AT__: JSON.stringify('2026-11-23T00:00:00Z') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const visit = async query => {
    await send('Page.navigate', { url: `${origin}/tests/fixtures/admin-ui.html?route=/admin/dashboard&scenario=activity${query}` });
    await wait(`!!document.querySelector('td[data-label=Status]')`);
  };
  const values = () => evaluate(`[...document.querySelectorAll('[data-summary-value]')].map(e=>e.textContent)`);
  const selectStatus = async status => {
    await evaluate(`document.querySelector('.filter-btn').click()`);
    await wait(`!!document.querySelector('[aria-label="Table filters"]')`);
    await evaluate(`document.querySelector('[aria-label="Table filters"] [aria-haspopup=listbox]').click()`);
    await wait(`!!document.querySelector('[role=option]')`);
    await evaluate(`[...document.querySelectorAll('[role=option]')].find(e=>e.textContent.trim()===${JSON.stringify(status)}).click()`);
    await evaluate(`[...document.querySelectorAll('[aria-label="Table filters"] button')].find(e=>e.textContent.trim()==='Done').click()`);
  };
  const search = text => evaluate(`(()=>{const e=document.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(text)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  try {
    for (const width of [1440, 360]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await visit('');
      await wait(`document.querySelector('[data-tone=inactive] [data-summary-value]')?.textContent==='2'`);
      assert.deepEqual(await values(), ['18', '6', '12', '2']);
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('td[data-label=Status]')].map(e=>e.textContent.trim())`), Array(8).fill('Inactive'));
      assert.ok(await evaluate(`!window.adminUIFixture.requests.some(r=>r.url==='/users/'&&Number(r.params?.page_size)===100)`), 'summary uses its recorded API count without scanning account activity');
      assert.ok(await evaluate(`!!document.querySelector('button[aria-label="Resend invitation to member1@example.test"]')`), 'never-signed-in account stays eligible for its invitation');
      await selectStatus('Inactive');
      await wait(`document.body.innerText.includes('Showing 8 of 14 users')&&document.querySelectorAll('td[data-label=Status]').length===8`);
      assert.ok(await evaluate(`window.adminUIFixture.requests.some(r=>r.url==='/users/'&&Number(r.params?.page_size)===100&&Number(r.params?.page)===3)`), 'activity filter reads every API page, including a capped page size');
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('td[data-label=Status]')].map(e=>e.textContent.trim())`), Array(8).fill('Inactive'));
      await evaluate(`document.querySelector('button[aria-label="Next page"]').click()`);
      await wait(`document.body.innerText.includes('Showing 6 of 14 users')&&document.querySelectorAll('td[data-label=Status]').length===6`);
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('td[data-label=Status]')].map(e=>e.textContent.trim())`), Array(6).fill('Inactive'), 'filter includes never-signed-in and disabled accounts across every API page');
      await selectStatus('Active');
      await wait(`document.body.innerText.includes('Showing 4 of 4 users')&&document.querySelectorAll('td[data-label=Status]').length===4`);
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('td[data-label=Status]')].map(e=>e.textContent.trim())`), Array(4).fill('Active'));
      assert.equal(await evaluate(`!!document.querySelector('button[aria-label="Next page"]')`), false, 'changing filters resets pagination');
      await selectStatus('Inactive');
      await search('member1');
      await wait(`document.body.innerText.includes('Showing 6 of 6 users')&&document.querySelectorAll('td[data-label=Status]').length===6`);
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('td[data-label=User] p:first-child')].map(e=>e.textContent.trim())`), ['Sample Member 1', 'Sample Member 10', 'Sample Member 11', 'Sample Member 12', 'Sample Member 17', 'Sample Member 18'], 'search and activity filter compose');
      await search('no-match');
      await wait(`document.body.innerText.includes('No users found.')&&document.body.innerText.includes('Showing 0 of 0 users')`);
      assert.ok(await evaluate(`window.adminUIFixture.requests.filter(r=>r.url==='/users/').every(r=>r.params?.is_active==null)`), 'activity filtering does not request disabled-only backend results');
      await evaluate(`document.querySelector('.filter-btn').click()`);
      await evaluate(`[...document.querySelectorAll('[aria-label="Table filters"] button')].find(e=>e.textContent.trim()==='Clear filters').click()`);
      await wait(`document.body.innerText.includes('Showing 8 of 18 users')&&document.querySelectorAll('td[data-label=Status]').length===8`);
      assert.equal(await evaluate(`document.querySelector('input[type=search]').value`), '');
      assert.deepEqual(await values(), ['18', '6', '12', '2'], 'filters do not alter overall summary totals');
      await evaluate(`document.querySelector('button[aria-label="Next page"]').click()`);
      await wait(`document.querySelector('td[data-label=User]')?.textContent.includes('Member 9')`);
      assert.deepEqual(await values(), ['18', '6', '12', '2'], 'summary is independent of the visible table page');
      await evaluate(`document.querySelector('button[aria-label="Next page"]').click()`);
      await wait(`document.querySelector('td[data-label=User]')?.textContent.includes('Member 17')`);
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('td[data-label=Status]')].map(e=>e.textContent.trim())`), ['Inactive', 'Inactive'], 'disabled accounts stay inactive regardless of history');
      await evaluate(`window.adminUIFixture.recordLogin('sample-user-0')`);
      await evaluate(`document.querySelector('button[aria-label="Previous page"]').click()`);
      await wait(`document.querySelector('td[data-label=User]')?.textContent.includes('Member 9')`);
      await evaluate(`document.querySelector('button[aria-label="Previous page"]').click()`);
      await wait(`document.querySelector('td[data-label=User]')?.textContent.includes('Member 1')&&document.querySelector('td[data-label=Status]')?.textContent.trim()==='Active'`);
      assert.deepEqual(await values(), ['18', '6', '12', '2'], 'first sign-in does not alter the access-status summary');
      assert.ok(await evaluate(`window.adminUIFixture.requests.filter(r=>r.url==='/users/summary/').length>=2`), 'changed history is reflected after a fresh API read');
      assert.deepEqual(await evaluate('window.adminUIFixture.writes'), [], 'display never changes permissions or sends invitations');
      assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'), false);
    }
    await visit('&failSummary=1');
    await wait(`document.body.innerText.includes('Could not load user totals')`);
    assert.equal(await evaluate(`document.querySelector('[data-tone=inactive] [data-summary-value]').textContent`), '—', 'incomplete counts are never presented as zero or as the first page total');
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});

test('Admin audit account photos and Back navigation match role details', { timeout: 120000 }, async () => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/admin-audit-account', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api'), __APP_UPDATED_AT__: JSON.stringify('2026-11-23T00:00:00Z') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  try {
    for (const width of [1440, 360]) for (const photo of ['photo', 'missing', 'broken']) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `${origin}/tests/fixtures/admin-ui.html?route=/admin/audit-logs&auditPhoto=${photo}` });
      await wait(`document.querySelectorAll('td[data-label=Details] button').length===6`);
      await evaluate(`document.querySelector('td[data-label=Details] button').click()`);
      await wait(`!!document.querySelector('.admin-audit-entity img')`);
      const selector = '.admin-audit-entity img';
      await wait(`(()=>{const e=document.querySelector('${selector}');return e.complete&&e.naturalWidth>0&&${photo === 'photo' ? "e.src.startsWith('data:image/svg+xml')" : "e.src.includes('default_user')"}})()`);
      const state = await evaluate(`(()=>{const img=document.querySelector('${selector}'),r=img.getBoundingClientRect(),root=document.querySelector('.admin-audit-details'),heading=root.querySelector('.page-header-row').getBoundingClientRect(),back=root.querySelector('.vista-back-button').getBoundingClientRect();return {width:r.width,height:r.height,radius:getComputedStyle(img).borderRadius,below:back.top>=heading.bottom,leftAligned:Math.abs(back.left-heading.left)<1,overflow:document.documentElement.scrollWidth>innerWidth+1,technicalOpen:!!root.querySelector('[data-audit-technical][open]')}})()`);
      assert.equal(state.width, 40); assert.equal(state.height, 40);
      assert.ok(state.radius === '50%' || parseFloat(state.radius) >= 20, 'account photo is circular');
      assert.ok(state.below && state.leftAligned, 'Back is beneath the heading at its left edge');
      assert.equal(state.overflow, false); assert.equal(state.technicalOpen, false);
      assert.ok(await evaluate(`window.adminUIFixture.requests.some(r=>r.url==='/audit-logs/audit-login/')`), 'photo comes from the fetched audit detail');
      await evaluate(`document.querySelector('.admin-audit-details .vista-back-button').click()`);
      await wait(`!document.querySelector('.admin-audit-details')&&document.querySelectorAll('td[data-label=Details] button').length===6`);
      assert.deepEqual(await evaluate('window.adminUIFixture.writes'), []);
    }
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});

test('Admin routes, dialogs and audit evidence use the VISTA system without changing workflows', { timeout: 300000 }, async t => {
  const fixtureHtml = await fs.readFile('tests/fixtures/admin-ui.html', 'utf8');
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss(), {
    name: 'isolated-admin-routes', configureServer(vite) {
      vite.middlewares.use((request, response, next) => {
        if (!/^\/admin\//.test(request.url)) return next();
        vite.transformIndexHtml(request.url, fixtureHtml).then(html => { response.setHeader('Content-Type', 'text/html'); response.end(html); }, next);
      });
    },
  }], cacheDir: 'node_modules/.vite-tests/admin-ui-regression', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api'), __APP_UPDATED_AT__: JSON.stringify('2026-11-23T00:00:00Z') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const directory = 'node_modules/.cache/vista-design-review/admin-consistency';
  await fs.mkdir(directory, { recursive: true });
  const navigate = async (route, scenario = 'populated') => {
    await send('Page.navigate', { url: `${origin}/tests/fixtures/admin-ui.html?route=${encodeURIComponent(route)}&scenario=${scenario}` });
    for (let i = 0; i < 600; i++) { if (await evaluate(`!!document.querySelector('.admin-workspace')`)) break; await pause(100); }
    if (!await evaluate(`!!document.querySelector('.admin-workspace')`)) {
      await fs.writeFile(`${directory}/render-failure.json`, JSON.stringify({ route, exceptions: browser.exceptions, body: await evaluate('document.body.innerText') }, null, 2));
      assert.fail(`route did not render: ${route}; see ${directory}/render-failure.json`);
    }
    await evaluate('document.fonts.ready');
    await pause(250);
  };
  const button = async (label, scope = 'document') => {
    await evaluate(`(()=>{const root=${scope === 'dialog' ? "document.querySelector('[role=dialog]')" : 'document'};const button=[...root.querySelectorAll('button')].find(e=>e.textContent.trim().toLowerCase()===${JSON.stringify(label.toLowerCase())});if(!button)throw new Error('Button not found: '+${JSON.stringify(label)});button.focus();button.click()})()`);
    await pause(100);
  };
  const escape = async () => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await wait(`!document.querySelector('[role=dialog],dialog[open]')`);
  };
  const checkDialog = async () => {
    await wait(`!!document.querySelector('[role=dialog]')`);
    const result = await evaluate(`(()=>{const d=document.querySelector('[role=dialog]'),p=d.querySelector('.vista-surface')||d.firstElementChild,r=p.getBoundingClientRect(),s=getComputedStyle(p);return{fit:r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1,radius:s.borderRadius,focus:d.contains(document.activeElement),modal:d.getAttribute('aria-modal')}})()`);
    assert.ok(result.fit, JSON.stringify(result)); assert.ok(result.focus, 'focus enters dialog'); assert.equal(result.modal, 'true');
    assert.ok(['20px', '28px'].includes(result.radius));
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.ok(await evaluate(`document.querySelector('[role=dialog]').contains(document.activeElement)`), 'Tab remains in dialog');
  };
  try {
    for (const width of [1440, 1280, 768, 360]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      for (const route of ['/admin/dashboard', '/admin/dashboard/registeredorg', '/admin/registration-config', '/admin/audit-logs', '/admin/profile']) await t.test(`${route} at ${width}px`, async () => {
        await navigate(route);
        assert.ok(await evaluate(`!!document.querySelector('.admin-workspace')`));
        assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false, 'no viewport overflow');
        if (route === '/admin/dashboard') {
          await wait(`document.querySelector('[data-summary-value]')?.textContent==='36'`);
          assert.deepEqual(await evaluate(`[...document.querySelectorAll('[data-summary-value]')].map(e=>e.textContent)`), ['36', '4', '30', '2']);
          assert.equal(await evaluate(`document.querySelectorAll('.admin-summary-art').length`), 4, 'four role-specific decorative illustrations');
          assert.ok(await evaluate(`[...document.querySelectorAll('[data-summary-value]')].every(e=>{const r=document.createRange();r.selectNodeContents(e);return new Set([...r.getClientRects()].map(q=>q.y)).size===1})`), 'multi-digit totals stay on one line beside the artwork');
        }
        if (width !== 768) await browser.screenshot(`${directory}/${route.slice(1).replaceAll('/', '-')}-${width}.png`, true);
      });
    }
    for (const width of [1280, 360]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await t.test(`user create/edit/delete and invitation dialogs at ${width}px`, async () => {
        await navigate('/admin/dashboard'); await button('Add User'); await checkDialog();
        await button('Add User', 'dialog');
        assert.ok(await evaluate(`document.querySelector('[role=dialog]').textContent.includes('First name is required')`), 'existing validation blocks incomplete create');
        assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0);
        await browser.screenshot(`${directory}/add-user-${width}.png`, true);
        await escape();
        assert.ok(await evaluate(`document.activeElement.textContent.includes('Add User')`), 'focus returns to the opener');
        await button('EDIT'); await checkDialog();
        assert.ok(await evaluate(`document.querySelector('[role=dialog]').textContent.includes('member1@example.test')`), 'the existing read-only email identity is preserved');
        await browser.screenshot(`${directory}/edit-user-${width}.png`, true); await escape();
        await button('DELETE'); await checkDialog(); await escape();
        await evaluate(`document.querySelector('button[aria-label^="Resend invitation"]').click()`);
        await wait(`!!document.querySelector('dialog[open]')`);
        assert.ok(await evaluate(`document.querySelector('dialog').textContent.includes('member1@example.test')`));
        await browser.screenshot(`${directory}/invitation-${width}.png`, true); await escape();
        assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0, 'opening and dismissing controls never mutates accounts or sends email');
      });
      await t.test(`organization add/edit/delete at ${width}px`, async () => {
        await navigate('/admin/dashboard/registeredorg'); await button('Add Org'); await checkDialog();
        await browser.screenshot(`${directory}/add-org-${width}.png`, true); await escape();
        await button('EDIT'); await checkDialog(); await browser.screenshot(`${directory}/edit-org-${width}.png`, true); await escape();
        await button('DELETE'); await checkDialog(); await browser.screenshot(`${directory}/delete-org-${width}.png`, true); await escape();
        assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0);
      });
      await t.test(`table search, pagination and filter keyboard controls at ${width}px`, async () => {
        await navigate('/admin/dashboard');
        await wait(`!!document.querySelector('td[data-label=User]')`);
        await evaluate(`document.querySelector('button[aria-label="Next page"]').click()`);
        await wait(`window.adminUIFixture.requests.some(r=>r.url==='/users/'&&Number(r.params?.page)===2)`);
        await evaluate(`(()=>{const e=document.querySelector('input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'member1');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
        await wait(`window.adminUIFixture.requests.some(r=>r.url==='/users/'&&r.params?.search==='member1')`);
        await button('Filter');
        await wait(`!!document.querySelector('[aria-label="Table filters"]')`);
        await button('All Status');
        await wait(`!!document.querySelector('[role=option]')`);
        await evaluate(`[...document.querySelectorAll('[role=option]')].find(e=>e.textContent.trim()==='Inactive').click()`);
        await wait(`document.body.innerText.includes('Showing 1 of 1 users')&&document.querySelector('td[data-label=Status]')?.textContent.trim()==='Inactive'`);
        assert.ok(await evaluate(`window.adminUIFixture.requests.some(r=>r.url==='/users/'&&r.params?.search==='member1'&&Number(r.params?.page_size)===100&&r.params?.is_active==null)`), 'activity filtering retains search without a permission-status API filter');
        await browser.screenshot(`${directory}/filters-${width}.png`, true);
        await button('Done');
        assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0);
      });
      for (const tab of ['Organizations', 'Academic Years', 'Document Types', 'Categories']) await t.test(`${tab} configuration controls at ${width}px`, async () => {
        await navigate('/admin/registration-config'); await button(tab);
        await wait(`!!document.querySelector('td[data-label=Actions] button')`);
        await button('Add New Entry'); await checkDialog(); await browser.screenshot(`${directory}/config-${tab.replaceAll(' ', '-')}-${width}.png`, true); await escape();
        await button('EDIT'); await checkDialog(); await escape();
        await button('DELETE'); await checkDialog(); await escape();
        assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0);
      });
      await t.test(`all audit event details at ${width}px`, async () => {
        for (const [index, title] of ['Signed in', 'User account updated', 'Organization deleted', 'Submission status changed', 'Submission created', 'Organization updated'].entries()) {
          await navigate('/admin/audit-logs'); await wait(`document.querySelectorAll('td[data-label=Details] button').length===6`);
          await evaluate(`document.querySelectorAll('td[data-label=Details] button')[${index}].click()`);
          await wait(`!!document.querySelector('.admin-audit-details')`);
          const text = await evaluate(`document.querySelector('.admin-audit-details').textContent`);
          assert.ok(text.includes(title), title); assert.ok(!text.includes('Validation Passed')); assert.ok(!text.includes('Unknown Record'));
          assert.equal(await evaluate(`document.querySelectorAll('.admin-audit-technical[open]').length`), 0, 'technical evidence is collapsed by default');
          assert.equal(await evaluate(`document.querySelector('.admin-audit-details').innerText.includes('audit-')`), false, 'audit identifiers stay out of the primary content');
          assert.ok(!text.includes('Context timeline') && !text.includes('Only this event is included'), 'no duplicated single-event timeline or response commentary');
          if (index === 0) {
            assert.ok(text.includes('admin@example.test')); assert.ok(text.includes('Account involved'));
            assert.equal(await evaluate(`document.querySelectorAll('.admin-audit-changes').length`), 0, 'simple login has no empty before/after section');
            assert.equal(await evaluate(`document.querySelectorAll('.admin-audit-card').length`), 3, 'login has summary and account bento cards plus the collapsed disclosure');
            assert.equal(await evaluate(`document.querySelector('.admin-audit-details').innerText.includes('sample-admin')`), false);
          }
          if (index === 1) assert.ok(text.includes('Preferences') && text.includes('dark') && text.includes('light'), 'nested before/after values retained');
          if (index === 2) assert.ok(text.includes('Former Campus Society'), 'deleted snapshot retained');
          if (index === 3) assert.ok(text.includes('On Process') && text.includes('Approved'), 'canonical statuses rendered');
          if (index === 2 || index === 4) assert.equal(await evaluate(`document.querySelectorAll('.admin-audit-changes thead th').length`), 2, 'create/delete show a snapshot rather than an empty comparison column');
          if (index === 5) assert.equal(await evaluate(`document.querySelectorAll('.admin-audit-changes').length`), 0, 'unrecorded changes do not create an empty section');
          if (index === 0 || index === 1) await browser.screenshot(`${directory}/audit-compact-${index}-${width}.png`, true);
          await evaluate(`document.querySelector('[data-audit-technical] > summary').focus()`);
          await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
          await wait(`document.querySelector('[data-audit-technical]').open`);
          assert.ok(await evaluate(`document.querySelector('[data-audit-technical]').innerText.includes('audit-')`), 'full technical identifiers become readable on keyboard expansion');
          assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false);
          if (index === 0 || index === 1) await browser.screenshot(`${directory}/audit-${index}-${width}.png`, true);
          assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0, 'audit inspection remains read-only');
        }
      });
    }
    await t.test('user delete confirmation preserves pending, failure and successful request behavior', async () => {
      await navigate('/admin/dashboard', 'pending'); await button('DELETE'); await checkDialog();
      assert.ok(await evaluate(`document.querySelector('[role=dialog]').textContent.includes('member1@example.test')`));
      await evaluate(`(()=>{const button=[...document.querySelectorAll('[role=dialog] button')].find(e=>e.textContent==='Delete user');button.click();button.click()})()`);
      await wait('window.adminUIFixture.writes.length===1');
      assert.equal(await evaluate(`document.querySelectorAll('[role=dialog] button:not(:disabled)').length`), 0, 'pending protects the confirm, cancel and close controls');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      assert.ok(await evaluate(`!!document.querySelector('[role=dialog]')`), 'pending Escape cannot dismiss confirmation');
      await wait(`document.querySelector('[role=dialog]').textContent.includes('temporarily unavailable')`);
      assert.deepEqual(await evaluate('window.adminUIFixture.writes.map(r=>({url:r.url,method:r.method}))'), [{ url: '/users/sample-user-0/', method: 'delete' }]);
      await browser.screenshot(`${directory}/delete-user-failure.png`, true); await escape();
      await navigate('/admin/dashboard', 'success'); await button('DELETE'); await checkDialog(); await button('Delete user', 'dialog');
      await wait(`!document.querySelector('[role=dialog]') && !!document.querySelector('td[data-label=User]') && !document.querySelector('td[data-label=User]').textContent.includes('member1@example.test')`);
      assert.equal(await evaluate('window.adminUIFixture.writes.length'), 1);
      assert.ok(await evaluate(`window.adminUIFixture.reads.filter(url=>url==='/users/').length>1`), 'success refreshes the list through a fresh fixture API read');
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
    for (const scenario of ['empty', 'error', 'loading']) for (const route of ['/admin/dashboard', '/admin/dashboard/registeredorg', '/admin/registration-config', '/admin/audit-logs']) await t.test(`${scenario} state on ${route}`, async () => {
      await navigate(route, scenario);
      if (scenario === 'error') await wait(`!!document.querySelector('.dashboard-main [role=alert]')`);
      if (scenario === 'loading') assert.ok(await evaluate(`!!document.querySelector('.dashboard-main .vista-skeleton')`), 'loading placeholders visible');
      if (scenario === 'empty') await wait(`!!document.querySelector('.vista-table') && !document.querySelector('.vista-table .vista-skeleton')`);
      await browser.screenshot(`${directory}/${scenario}-${route.slice(1).replaceAll('/', '-')}.png`, true);
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 1'), false);
      assert.equal(await evaluate('window.adminUIFixture.writes.length'), 0);
    });
    assert.deepEqual(browser.exceptions, []);
    assert.equal(browser.requests.filter(request => !request.url.startsWith(origin) && /^https?:/.test(request.url)).length, 0, 'no production or external API requests');
  } finally { await browser.close(); await server.close(); }
});
