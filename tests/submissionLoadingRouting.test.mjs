import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';
import { getLoginRedirectPath, getPostLoginTarget, getSafeStaffSubmissionTarget } from '../src/utils/redirectTarget.js';

const id = '194f7b2a-ec37-4d7b-8a84-c99e8ac14f2a';
const target = `/staff/review-panel/${id}`;
test('Staff detail sign-in targets stay internal and role-specific', () => {
  assert.equal(getSafeStaffSubmissionTarget(target), target);
  for (const path of ['https://example.test'+target, '//example.test'+target, '/staff/review-panel/no-id', '/student/review-tracker/'+id, target+'/extra']) assert.equal(getSafeStaffSubmissionTarget(path), '');
  assert.equal(getLoginRedirectPath(target), '/login?next='+encodeURIComponent(target));
  assert.equal(getPostLoginTarget({ user: { role: 'staff' }, is_first_login: false }, target), target);
  assert.equal(getPostLoginTarget({ user: { role: 'staff' }, is_first_login: true }, target), '/staff/profile');
  assert.equal(getPostLoginTarget({ user: { role: 'student' } }, target), '/student/dashboard');
});

test('loading layouts, organization/submitter identities and reloadable Staff routes', { timeout: 120000 }, async t => {
  const routeHtml = await fs.readFile('tests/fixtures/staff-review-route.html', 'utf8');
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss(), {
    name: 'isolated-route-fixture', configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (!/^\/(staff|student|admin|login)(\/|\?|$)/.test(req.url)) return next();
        vite.transformIndexHtml(req.url, routeHtml).then(html => { res.setHeader('Content-Type', 'text/html'); res.end(html); }, next);
      });
    },
  }], cacheDir: 'node_modules/.vite-tests/submission-loading-route', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const directory = 'node_modules/.cache/vista-design-review/loading-identities';
  await fs.mkdir(directory, { recursive: true });
  const visit = path => send('Page.navigate', { url: origin+path });
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await pause(80);
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
    assert.ok(point.hit, selector+' receives the pointer');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await pause(60);
  };
  const revealContact = async () => {
    if (await evaluate(`!!document.querySelector('.submission-pass__details-toggle') && getComputedStyle(document.querySelector('.submission-pass__details-toggle')).display !== 'none'`)) await click('.submission-pass__details-toggle');
  };
  const assertIdentities = async () => {
    await wait(`!!document.querySelector('.submission-pass__contact-avatar img') && !document.querySelector('.submission-pass__contact-avatar .vista-skeleton') && !document.querySelector('.submission-pass__brand-mark .vista-skeleton')`);
    const images = await evaluate(`(()=>{const org=document.querySelector('.submission-details-panel .submission-pass__brand-mark img'),person=document.querySelector('.submission-pass__contact .submission-pass__contact-avatar img');return{org:org?.src,person:person?.src,orgAlt:org?.alt,personAlt:person?.alt,overflow:document.documentElement.scrollWidth>innerWidth+1}})()`);
    assert.ok(images.org?.includes('data:image/svg+xml'));
    assert.ok(images.person?.includes('data:image/svg+xml'));
    assert.notEqual(images.org, images.person, 'organization and submitter use different image sources');
    assert.match(images.orgAlt, /logo$/);
    assert.match(images.personAlt, /profile$/);
    assert.equal(images.overflow, false);
  };
  try {
    for (const width of [320, 390, 1366]) await t.test(`Staff staged requests at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await visit('/tests/fixtures/archive-presentation.html?scenario=staged');
      await wait('!!window.__fixtureRelease?.details && !!window.__fixtureRelease?.history');
      assert.equal(await evaluate(`document.querySelector('.submission-pass__card').getAttribute('aria-busy')`), 'true');
      assert.equal(await evaluate(`document.querySelector('.submission-pass__card').querySelectorAll('button,a,img').length`), 0, 'whole card skeleton has no temporary avatars or active file controls');
      assert.equal(await evaluate(`document.querySelector('.submission-review-decision').querySelectorAll('input,textarea,button').length`), 0, 'decision fields wait for their initial data');
      assert.equal(await evaluate(`document.body.innerText.includes('Loading status') || document.body.innerText.includes('0 updates')`), false);
      assert.equal(await evaluate(`!!document.querySelector('.skeleton-list-row--documents')`), false, 'generic three-row document skeleton is gone');
      assert.ok(await evaluate(`document.querySelector('.submission-pass__card').getBoundingClientRect().height < ${width <= 480 ? 280 : 540}`), 'skeleton keeps the card footprint');
      assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'), false);
      await browser.screenshot(`${directory}/staff-loading-${width}.png`, true);
      await evaluate('window.__fixtureRelease.details()');
      await wait('!!window.__fixtureRelease?.submitter && !document.querySelector(".submission-pass__card[aria-busy]")');
      await revealContact();
      assert.equal(await evaluate(`!!document.querySelector('.submission-pass__contact-avatar .vista-skeleton')`), true, 'submitter photo has its own loading state');
      assert.equal(await evaluate(`!!document.querySelector('.skeleton-decision')`), true, 'history must finish before decision controls appear');
      await evaluate('window.__fixtureRelease.history(); window.__fixtureRelease.submitter()');
      await wait('!!document.querySelector(".submission-review-decision textarea")');
      await assertIdentities();
      assert.deepEqual(await evaluate('window.__fixtureWrites'), []);
      await browser.screenshot(`${directory}/staff-ready-${width}.png`, true);
    });
    for (const width of [390, 1366]) await t.test(`Student detail loader and identity at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await visit('/tests/fixtures/student-detail-identity.html?loading');
      await wait('!!window.studentIdentityFixture?.releaseDetails && !!document.querySelector(".submission-pass__card[aria-busy]")');
      assert.ok(await evaluate(`!!document.querySelector('.submission-details-panel[aria-busy=true]') && !document.querySelector('.submission-details-panel input')`), 'Student loader follows the read-only primary panel');
      await browser.screenshot(`${directory}/student-loading-${width}.png`, true);
      await evaluate('window.studentIdentityFixture.releaseDetails()');
      await wait('!!document.querySelector(".student-submission-details .submission-pass__contact")');
      await revealContact();
      await assertIdentities();
      assert.equal(await evaluate('document.querySelectorAll(".submission-pass a").length'), 0);
      assert.equal(await evaluate('window.studentIdentityFixture.reads.some(read=>read.url.includes("/users/"))'), false, 'Student does not request other account profiles');
    });
    await t.test('draft preview reuses both identities', async () => {
      await visit('/tests/fixtures/registration-preview.html');
      await wait('!!document.querySelector(".registration-pass-preview")');
      await assertIdentities();
    });
    for (const scenario of ['broken-avatar', 'missing-avatar']) await t.test(scenario+' settles on neutral fallbacks', async () => {
      await visit('/tests/fixtures/archive-presentation.html?scenario='+scenario);
      await wait(`!document.querySelector('.submission-pass__card[aria-busy]') && !!document.querySelector('.submission-pass__contact-avatar img') && !document.querySelector('.submission-pass__contact-avatar .vista-skeleton') && !document.querySelector('.submission-pass__brand-mark .vista-skeleton')`);
      assert.equal(await evaluate(`!!document.querySelector('.submission-pass__brand-mark svg') && !document.querySelector('.submission-pass__brand-mark img')`), true);
      assert.ok(await evaluate(`document.querySelector('.submission-pass__contact-avatar img').src.includes('default_user')`));
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
    for (const width of [320, 1366]) await t.test(`attachment confirmation preview at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await visit('/tests/fixtures/staff-review-route.html?modal');
      await wait('!!document.querySelector(".process-attachment-current-preview")');
      assert.equal(await evaluate('document.querySelectorAll(".process-attachment-current-preview").length'), 1, 'files without a URL stay plain text');
      await click('input[value="replace"]');
      await evaluate('document.querySelector(".process-attachment-current-preview").focus()');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await wait('document.querySelectorAll("[role=dialog]").length===2');
      assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'), false);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await wait('document.querySelectorAll("[role=dialog]").length===1');
      assert.equal(await evaluate('document.activeElement.classList.contains("process-attachment-current-preview")'), true);
      assert.equal(await evaluate('document.querySelector("input[value=replace]").checked'), true, 'preview preserves the chosen attachment action');
      assert.equal(await evaluate('!!window.staffRouteFixture.closed'), false, 'Escape closes only the nested preview');
      assert.deepEqual(await evaluate('window.staffRouteFixture.writes'), []);
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
    await t.test('direct Staff detail URL survives reload and keeps file history safe', async () => {
      await visit(target);
      await wait('!!document.querySelector(".attachment-history-preview")');
      assert.equal(await evaluate('location.pathname'), target);
      assert.equal(await evaluate(`document.querySelector('.submission-pass__title').textContent`), 'Persisted activity request');
      const history = await evaluate(`[...document.querySelectorAll('.submission-review-history p')].filter(e=>e.textContent.includes('Old attachment.pdf')).map(e=>({text:e.textContent,actions:e.querySelectorAll('button,a').length}))`);
      assert.ok(history.length >= 2);
      assert.ok(history.every(row=>row.actions===0), 'old added/replaced files remain filenames');
      assert.equal(await evaluate(`document.querySelectorAll('.attachment-history-preview').length`), 1, 'only the current replacement can open');
      await click('.attachment-history-preview');
      await wait('!!document.querySelector("[role=dialog]")');
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await wait('!document.querySelector("[role=dialog]")');
      assert.equal(await evaluate('document.activeElement.classList.contains("attachment-history-preview")'), true);
      const boot = await evaluate('window.staffRouteFixture.boot');
      await send('Page.reload');
      await wait(`!!window.staffRouteFixture && window.staffRouteFixture.boot!==${JSON.stringify(boot)} && !!document.querySelector('.attachment-history-preview')`);
      assert.equal(await evaluate('location.pathname'), target);
      assert.ok(await evaluate('window.staffRouteFixture.reads.some(url=>url.includes(window.staffRouteFixture.id))'), 'reload retrieves the saved submission afresh');
      assert.deepEqual(await evaluate('window.staffRouteFixture.writes'), []);
    });
    await t.test('list actions and legacy navigation produce canonical URLs', async () => {
      await visit('/staff/review-panel');
      await wait('!!document.querySelector(".responsive-records button.vista-action-button")');
      await click('.responsive-records button.vista-action-button');
      await wait('!!document.querySelector(".submission-pass__card") && location.pathname.endsWith("'+id+'")');
      await visit('/staff/review-panel?legacy=1');
      await wait('location.pathname.endsWith("'+id+'") && !!document.querySelector(".submission-pass__card") && !document.querySelector(".submission-pass__card[aria-busy]")');
      assert.equal(await evaluate(`document.querySelector('.submission-pass__title').textContent`), 'Persisted activity request', 'fresh data replaces stale route state');
      // Browser Back returns to the list and Forward restores the selected entry.
      await visit('/staff/review-panel');
      await wait('!!document.querySelector(".responsive-records button.vista-action-button")');
      await click('.responsive-records button.vista-action-button');
      await wait('location.pathname.endsWith("'+id+'")');
      const history = await send('Page.getNavigationHistory');
      await send('Page.navigateToHistoryEntry', { entryId: history.entries[history.currentIndex-1].id });
      await wait('location.pathname==="/staff/review-panel" && !!document.querySelector(".responsive-records")');
      await send('Page.navigateToHistoryEntry', { entryId: history.entries[history.currentIndex].id });
      await wait('location.pathname.endsWith("'+id+'") && !!document.querySelector(".submission-pass__card")');
    });
    for (const scenario of ['denied', 'missing']) await t.test('direct route '+scenario+' access', async () => {
      await visit(target+'?'+scenario);
      await wait('document.body.innerText.includes("This submission is unavailable")');
      assert.equal(await evaluate('!!document.querySelector(".submission-pass,.submission-review-decision,.attachment-history-preview")'), false);
      assert.deepEqual(await evaluate('window.staffRouteFixture.writes'), []);
    });
    await t.test('invalid ID and wrong role cannot request Staff detail data', async () => {
      await visit('/staff/review-panel/not-a-uuid');
      await wait('document.body.innerText.includes("This submission link is invalid")');
      assert.equal(await evaluate('window.staffRouteFixture.reads.some(url=>url.includes("/submissions/"))'), false);
      await visit(target+'?role=student');
      await wait('!!window.staffRouteFixture && location.pathname!=="'+target+'"');
      assert.equal(await evaluate('window.staffRouteFixture.reads.some(url=>url.includes(window.staffRouteFixture.id))'), false);
    });
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
