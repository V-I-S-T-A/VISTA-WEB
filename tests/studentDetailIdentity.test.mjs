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

test('Student ticket, actual history replies and saved navigation identity', { skip: !chromeAvailable && 'Set CHROME_PATH for browser coverage', timeout: 90000 }, async t => {
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss()], cacheDir: 'node_modules/.vite-tests/student-detail-identity', define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/__blocked_api') }, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { evaluate, send, wait } = browser;
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const fixture = `${origin}/tests/fixtures/student-detail-identity.html`;
  const directory = 'node_modules/.cache/vista-design-review/student-detail-identity';
  await fs.mkdir(directory, { recursive: true });
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await pause(60);
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
    assert.ok(point.hit, `${selector} receives the pointer`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await pause(60);
  };
  const reset = async url => {
    await send('Page.navigate', { url });
    await wait('!!window.studentIdentityFixture');
    await evaluate('localStorage.clear()');
    await send('Page.navigate', { url });
  };
  const replaceInput = async (selector, text) => {
    await click(selector);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 2, windowsVirtualKeyCode: 65 });
    await send('Input.insertText', { text });
  };
  const profileName = `document.querySelector('aside button[aria-label="View profile"]')?.textContent.trim()`;
  const row = '.reply-thread-list > .reply-thread-item:nth-child(1)';
  try {
    for (const width of [360, 768, 1366]) await t.test(`Student ticket and comment integration at ${width}px`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await reset(fixture);
      await wait('!!document.querySelector(".student-submission-details") && !!document.querySelector(".review-reply-thread")');
      const card = await evaluate(`(()=>{const e=document.querySelector('.student-detail-layout'),footer=e.querySelector('.submission-pass__attachments');return{text:e.innerText,seam:getComputedStyle(footer).borderTopStyle,links:[...e.querySelectorAll('a')].map(a=>a.href),overflow:document.documentElement.scrollWidth>innerWidth+1,header:getComputedStyle(document.querySelector('.submission-history-panel .detail-panel-heading')).backgroundColor,title:getComputedStyle(document.querySelector('.submission-history-panel h4')).color}})()`);
      for (const text of ['My Submission', 'Fictional activity request', 'Example Student Organization', 'ABCDEF12-FICTIONAL', 'In-Campus', 'On Process', 'Student Activity Request Form (SARF)', 'Sample Student', 'student@example.test', 'Digital documents are restricted to OSA staff.']) assert.ok(card.text.includes(text), text);
      const contact = await evaluate(`(()=>{const n=document.querySelector('.student-submission-details .submission-pass__contact-name'),e=document.querySelector('.student-submission-details .submission-pass__contact-email');return {name:n.textContent,email:e.textContent,below:e.getBoundingClientRect().top>=n.getBoundingClientRect().bottom-1}})()`);
      assert.deepEqual(contact, { name: 'Sample Student', email: 'student@example.test', below: true });
      assert.equal(card.seam, 'none');
      assert.ok(await evaluate(`!!document.querySelector('.submission-details-panel .submission-pass__attachments')`));
      assert.deepEqual(card.links, [], 'no staff-only file or Drive link is exposed');
      assert.equal(card.overflow, false);
      assert.equal(card.header, 'rgb(26, 89, 165)');
      assert.equal(card.title, 'rgb(255, 255, 255)');
      await browser.screenshot(`${directory}/student-ticket-${width}.png`, true);
      await click('.review-reply-thread button[data-ui=toggle]');
      await wait('document.querySelectorAll(".reply-thread-item").length===2');
      assert.equal(await evaluate('!!document.querySelector(".lucide-thumbs-up,.lucide-thumbs-down")'), false, 'only Reply remains');
      await click(`${row} .reply-thread-action`);
      assert.ok(await evaluate(`document.activeElement === document.querySelector('${row} textarea')`));
      assert.ok(await evaluate('!!document.querySelector(".reply-thread-item--nested .reply-thread-connector")'), 'saved replies show their indentation arrow');
      await send('Input.insertText', { text: 'Student integration reply' });
      await browser.screenshot(`${directory}/student-inline-reply-${width}.png`, true);
      await click('.reply-send-button');
      await wait('document.querySelectorAll(".reply-thread-item").length===3');
      const telemetry = await evaluate('window.studentIdentityFixture');
      const posts = telemetry.writes.filter(write => write.url.includes('/replies/'));
      assert.equal(posts.length, 1);
      assert.equal(JSON.parse(posts[0].data).parent_reply, 'first');
      assert.ok(telemetry.reads.filter(read => read.url.includes('/replies/')).length >= 2, 'reply success performs a fresh API read');
      assert.equal(telemetry.writes.filter(write => !write.url.includes('/replies/')).length, 0, 'no submission or status mutations');
      await send('Page.navigate', { url: fixture });
      await wait('!!document.querySelector(".review-reply-thread button[data-ui=toggle]")');
      await click('.review-reply-thread button[data-ui=toggle]');
      await wait('document.querySelectorAll(".reply-thread-item").length===3');
      assert.ok(await evaluate('document.querySelector(".review-reply-thread").textContent.includes("Student integration reply")'), 'fresh page retrieves the saved reply');
    });

    for (const role of ['staff', 'student', 'admin']) await t.test(`${role} profile name updates in navigation and survives a fresh read and reload`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
      const url = `${fixture}?profile&role=${role}`;
      await reset(url);
      await wait(`!!document.querySelector('input[aria-label="First name"]')`);
      assert.match(await evaluate(profileName), /^Sample /, 'the API first and last names replace role placeholders');
      await replaceInput('input[aria-label="First name"]', 'Revised');
      await replaceInput('input[aria-label="Last name"]', 'Reviewer');
      await click('form[aria-label="Account details"] button[type=submit]');
      await wait(`${profileName} === 'Revised Reviewer'`);
      const fresh = await evaluate('window.studentIdentityFixture.freshProfile()');
      assert.equal(fresh.first_name, 'Revised');
      assert.equal(fresh.last_name, 'Reviewer');
      assert.equal(fresh.full_name, undefined, 'fixture matches the real account serializer');
      assert.equal(await evaluate('window.studentIdentityFixture.writes.length'), 1);
      await send('Page.navigate', { url });
      await wait(`${profileName} === 'Revised Reviewer'`);
      await wait(`!!document.querySelector('input[aria-label="First name"]')`);
      assert.equal(await evaluate(`document.querySelector('input[aria-label="First name"]').value`), 'Revised');
      await browser.screenshot(`${directory}/${role}-saved-profile.png`, true);
    });

    await t.test('organization viewer keeps read-only ticket and conversation access', async () => {
      await reset(`${fixture}?viewer`);
      await wait('!!document.querySelector(".student-detail-layout") && !!document.querySelector(".review-reply-thread button[data-ui=toggle]")');
      assert.ok(await evaluate('document.querySelector(".student-detail-layout").innerText.includes("Organization Submission · View only")'));
      assert.ok(await evaluate('document.querySelector(".student-detail-layout").innerText.includes("Actions remain limited to the original submitter")'));
      await click('.review-reply-thread button[data-ui=toggle]');
      await wait('document.querySelectorAll(".reply-thread-item").length >= 2');
      assert.equal(await evaluate('!!document.querySelector(".reply-thread-action,textarea,.submission-pass a")'), false);
      assert.equal(await evaluate('window.studentIdentityFixture.writes.length'), 0);
    });
    await t.test('denied submission and wrong role cannot render the ticket or comments', async () => {
      await reset(`${fixture}?forbidden`);
      await wait('document.body.innerText.includes("Unable to load submission")');
      assert.equal(await evaluate('!!document.querySelector(".submission-pass,.review-reply-thread")'), false);
      await reset(`${fixture}?role=staff`);
      await wait('document.body.innerText.includes("Student account required")');
      assert.equal(await evaluate('!!document.querySelector(".submission-pass,.review-reply-thread")'), false);
      assert.equal(await evaluate('window.studentIdentityFixture.reads.some(read=>read.url.includes("/submissions/"))'), false);
    });
    assert.deepEqual(browser.exceptions, []);
    assert.equal(browser.requests.filter(request => request.url?.includes('example.test')).length, 0, 'fictional private file links are never requested');
  } finally {
    await browser.close();
    await server.close();
  }
});
