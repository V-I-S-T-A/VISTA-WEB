import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { openDesignBrowser, pause } from './helpers/designBrowser.mjs';
import { ANDROID_APK_URL, ANDROID_RELEASES_URL } from '../src/config/appDownload.js';

test('Android entry points use verified production build 29 and a lossless versioned QR', async () => {
  assert.equal(ANDROID_APK_URL, 'https://expo.dev/artifacts/eas/O5VzuxKVI3epJ8o6yJx1k-muFJJ5EhwjfAARLiMjDNM.apk');
  assert.equal(ANDROID_RELEASES_URL, 'https://expo.dev/accounts/purplehouse/projects/vista-app/builds/c4ec8f7c-c120-448e-991c-2b3790db9e0e');
  const bytes = await fs.readFile('src/assets/public/vista_v1.0.8.webp');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.equal(bytes.toString('ascii', 12, 16), 'VP8L');
});

test('promo is stored in src without re-encoding and has a WebP preview', async () => {
  const bytes = await fs.readFile('src/assets/public/vista-promo.webm');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '39245be6b0ac35136ec9dca51d880725eac30bf3f1a20429c83c38655326d900');
  const poster = await fs.readFile('src/assets/public/vista-promo-poster.webp');
  assert.equal(poster.toString('ascii', 8, 12), 'WEBP');
});

test('all enhanced guide references use 2x resolution and lossless WebP', async () => {
  const directory = 'src/assets/public/manual';
  const files = await fs.readdir(directory);
  assert.equal(files.length, 12);
  let total = 0;
  for (const file of files) {
    assert.ok(file.endsWith('.webp'));
    const bytes = await fs.readFile(`${directory}/${file}`);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(bytes.toString('ascii', 12, 16), 'VP8L', 'No further compression loss after standard enhancement');
    assert.equal(bytes[20], 0x2f);
    const dimensions = bytes.readUInt32LE(21);
    const size = [(dimensions & 0x3fff)+1, ((dimensions >>> 14) & 0x3fff)+1];
    assert.deepEqual(size, file === 'submission-ticket-screen.webp' ? [1184,2540] : [1356,2708]);
    total += bytes.length;
  }
  assert.ok(total < 16_000_000, `Enhanced lossless guide assets total ${total} bytes`);
});

test('Staff/Student manuals, ticket hero, screenshot preview and download controls', { timeout: 120000 }, async t => {
  const html = await fs.readFile('tests/fixtures/get-app-manual.html', 'utf8');
  const server = await createServer({ configFile: false, plugins: [react(), tailwindcss(), {
    name: 'isolated-get-app-route', configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/get-app')) return next();
        vite.transformIndexHtml(req.url, html).then(result => { res.setHeader('Content-Type', 'text/html'); res.end(result); }, next);
      });
    },
  }], define: { __APP_UPDATED_AT__: JSON.stringify('2026-11-21T00:00:00Z') }, cacheDir: 'node_modules/.vite-tests/get-app-manual', server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'error' });
  await server.listen();
  const browser = await openDesignBrowser();
  const { send, evaluate, wait } = browser;
  const directory = 'node_modules/.cache/vista-design-review/get-app-manual';
  await fs.mkdir(directory, { recursive: true });
  const key = async (value, code) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code: value, windowsVirtualKeyCode: code, ...(value === 'Enter' ? { text: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code: value, windowsVirtualKeyCode: code });
  };
  const click = async selector => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await pause(70);
    const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
    assert.ok(point.hit, selector+' receives the pointer');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  };
  try {
    for (const width of [320, 390, 768, 1366, 1920]) await t.test(`${width}px role guides and all reference screens`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 2, mobile: false });
      await send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/get-app` });
      await wait('!!document.querySelector(".ga-hand.is-ready .ga-hand-ticket") && !!document.querySelector(".ga-guide")');
      await evaluate('document.fonts.ready');
      assert.ok(await evaluate('document.querySelector(".ga-hand-ticket").src.includes("submission-ticket-screen")'));
      if (width === 390 || width === 1366) await browser.screenshot(`${directory}/hero-${width}.png`);
      const promo = await evaluate(`(()=>{const section=document.querySelector('.ga-promo'),video=section.querySelector('video'),frame=video.getBoundingClientRect();return{before:!!(section.compareDocumentPosition(document.querySelector('.ga-highlights')) & Node.DOCUMENT_POSITION_FOLLOWING),controls:video.controls,inline:video.playsInline,autoplay:video.autoplay,paused:video.paused,src:video.src,poster:video.poster,ratio:frame.width/frame.height,overflow:document.documentElement.scrollWidth>innerWidth+1}})()`);
      assert.equal(promo.before, true, 'Promo precedes Less friction. More flow.');
      assert.equal(promo.controls, true);
      assert.equal(promo.inline, true);
      assert.equal(promo.autoplay, false);
      assert.equal(promo.paused, true);
      assert.equal(await evaluate('!!document.querySelector(".ga-promo-heading,.ga-promo-popout")'), false, 'Remove the video title and separate pop-out row');
      assert.equal(await evaluate('document.querySelector(".ga-promo").getAttribute("aria-label")'), 'VISTA promotional video');
      assert.ok(await evaluate('[...document.querySelectorAll(".ga-feature-pill")].every(card=>getComputedStyle(card).borderRadius==="120px" && getComputedStyle(card).backgroundImage.startsWith("radial-gradient"))'), 'Restore original light pill-shaped feature cards');
      assert.ok(await evaluate('[...document.querySelectorAll(".ga-pill-icon")].every(icon=>getComputedStyle(icon).borderRadius==="50%" && !["none","normal"].includes(getComputedStyle(icon,"::after").content))'), 'Restore original circular icons and decorative dots');
      assert.ok(await evaluate('[...document.querySelectorAll(".ga-feature-pill h3")].every(title=>getComputedStyle(title).color==="rgb(16, 43, 73)")'), 'Original feature titles use navy');
      assert.deepEqual(await evaluate('[...document.querySelectorAll(".ga-pill-icon")].map(icon=>getComputedStyle(icon).color)'), ['rgb(255, 255, 255)','rgb(16, 43, 73)','rgb(255, 255, 255)','rgb(255, 255, 255)'], 'Restore the original icon foreground colors');
      assert.deepEqual(await evaluate('[...document.querySelectorAll(".ga-step-number")].map(badge=>{const style=getComputedStyle(badge);return{label:badge.textContent,color:style.color,background:style.backgroundColor,width:style.width,height:style.height,radius:style.borderRadius}})'), ['rgb(255, 207, 97)','rgb(188, 223, 197)','rgb(199, 223, 250)'].map((background,index)=>({label:'0'+(index+1),color:'rgb(16, 43, 73)',background,width:'40px',height:'40px',radius:'50%'})), 'Restore original pastel circular installation numbers');
      assert.match(promo.src, /vista-promo\.webm/);
      assert.match(promo.poster, /vista-promo-poster\.webp/);
      assert.ok(Math.abs(promo.ratio - 16/9) < 0.01);
      assert.equal(promo.overflow, false);
      if (width === 390 || width === 1366) {
        await evaluate('document.querySelector(".ga-promo").scrollIntoView({block:"center",behavior:"instant"})');
        await browser.screenshot(`${directory}/promo-${width}.png`);
        await evaluate('document.querySelector(".ga-highlights").scrollIntoView({block:"center",behavior:"instant"})');
        await browser.screenshot(`${directory}/features-${width}.png`);
        await evaluate('document.querySelector(".ga-install-steps").scrollIntoView({block:"center",behavior:"instant"})');
        await browser.screenshot(`${directory}/install-badges-${width}.png`);
      }
      const pageQr = await evaluate('document.querySelector(".ga-download-qr img").src');
      assert.match(pageQr, /vista_v1\.0\.8\.webp/);
      assert.match(await evaluate('document.querySelector(".ga-download-copy>.ga-button").href'), /\.apk$/);
      await click('.get-app-qr-button');
      await wait('!!document.querySelector(".app-download-qr") && document.querySelector(".app-download-qr").complete && document.querySelector(".app-download-qr").naturalWidth===540');
      assert.equal(await evaluate('document.querySelector(".app-download-qr").src'), pageQr);
      assert.equal(await evaluate('document.querySelector("#app-download-title").textContent'), 'Scan to Get VISTA');
      assert.equal(await evaluate('document.querySelector(".app-download-dialog>a").href'), ANDROID_APK_URL);
      assert.equal(await evaluate('document.querySelector(".app-download-dialog>a").hasAttribute("download")'), false);
      assert.ok(await evaluate('(()=>{const r=document.querySelector(".app-download-dialog").getBoundingClientRect();return r.x>=0 && r.y>=0 && r.right<=innerWidth && r.bottom<=innerHeight})()'));
      await wait('document.activeElement.classList.contains("app-download-close")');
      await key('Tab', 9);
      assert.equal(await evaluate('document.activeElement===document.querySelector(".app-download-dialog>a")'), true);
      await key('Tab', 9);
      assert.equal(await evaluate('document.activeElement.classList.contains("app-download-close")'), true);
      if (width === 390 || width === 1366) await browser.screenshot(`${directory}/download-modal-${width}.png`);
      await key('Escape', 27);
      await wait('!document.querySelector(".app-download-dialog")');
      assert.equal(await evaluate('document.activeElement.classList.contains("get-app-qr-button")'), true);
      await click('.get-app-qr-button');
      await wait('!!document.querySelector(".app-download-dialog")');
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 5, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 5, button: 'left', clickCount: 1 });
      await wait('!document.querySelector(".app-download-dialog")');
      for (const [role, count] of [['staff', 6], ['student', 5]]) {
        await click('#guide-tab-'+role);
        await wait(`document.querySelector('#guide-panel').getAttribute('aria-labelledby')==='guide-tab-${role}'`);
        assert.equal(await evaluate('document.querySelectorAll(".ga-guide-role-tabs [role=tab]").length'), 2);
        assert.equal(await evaluate('document.querySelectorAll(".ga-guide-navigation").length'), 0, 'The original preview/text layout has no sidebar');
        assert.equal(await evaluate('document.querySelector(".ga-guide-previous").disabled'), true);
        for (let index = 0; index < count; index++) {
          await wait(`!!document.querySelector('.ga-guide-screen-art>img') && document.querySelector('.ga-guide-screen-art>img').complete && document.querySelector('.ga-guide-screen-art>img').naturalWidth===1356`);
          const info = await evaluate(`(()=>{const image=document.querySelector('.ga-guide-screen-art>img'),screen=document.querySelector('.ga-guide-screen').getBoundingClientRect(),copy=document.querySelector('.ga-guide-copy').getBoundingClientRect();return{src:image.src,alt:image.alt,retina:image.naturalWidth>=image.getBoundingClientRect().width*devicePixelRatio,ratio:image.getBoundingClientRect().width/image.getBoundingClientRect().height,instructions:document.querySelectorAll('.ga-guide-instructions li').length,overflow:document.documentElement.scrollWidth>innerWidth+1,screen:{bottom:screen.bottom,right:screen.right},copy:{x:copy.x,y:copy.y}}})()`);
          const expectedScreens = role === 'staff' ? ['staff-dashboard', 'staff-add-document', 'staff-document-entry', 'staff-extracted-details', 'staff-confirm-submission', 'staff-submissions'] : ['student-dashboard', 'student-review-tracker', 'student-submission-ticket', 'student-conversation', 'student-notifications'];
          assert.ok(info.src.includes(expectedScreens[index]+'.webp'), 'Show the actual screenshot for this guide step');
          assert.ok(info.alt.length > 30);
          assert.equal(info.retina, true, 'Screenshots are not enlarged beyond their native 2x resolution');
          assert.ok(Math.abs(info.ratio - 678/1354) < 0.001, 'Keep the entire original screenshot aspect ratio');
          assert.equal(await evaluate('document.querySelectorAll(".ga-guide-screen .mp-phone").length'), 0, 'Do not substitute recreated screen details');
          assert.equal(info.instructions, 3);
          assert.equal(info.overflow, false);
          if (width > 760) assert.ok(info.screen.right < info.copy.x, 'Original desktop layout puts phone left and text right');
          else assert.ok(info.screen.bottom <= info.copy.y + 1, 'Phone precedes instructions when stacked');
          if (index < count - 1) {
            await click('.ga-guide-controls button:last-child');
            await wait(`document.querySelector('.ga-guide-controls>span').textContent==='${index+2} / ${count}'`);
          }
        }
        assert.equal(await evaluate('document.querySelector(".ga-guide-controls button:last-child").disabled'), true);
        await click('.ga-guide-previous');
        await wait(`document.querySelector('.ga-guide-controls>span').textContent==='${count-1} / ${count}'`);
        if (width === 390 || width === 1366) {
          await evaluate('document.querySelector(".ga-features").scrollIntoView({block:"start",behavior:"instant"})');
          await browser.screenshot(`${directory}/${role}-${width}.png`);
          await click('.ga-guide-enlarge');
          await wait('!!document.querySelector("[role=dialog]")');
          assert.ok(await evaluate('document.querySelector("[role=dialog] img").src.includes(".webp")'));
          await key('Escape', 27);
          await wait('!document.querySelector("[role=dialog]")');
          assert.equal(await evaluate('document.activeElement.classList.contains("ga-guide-enlarge")'), true);
        }
      }
      await evaluate('document.querySelector("#guide-tab-student").focus()');
      await key('Home', 36);
      await wait('document.activeElement.id==="guide-tab-staff"');
      assert.equal(await evaluate('document.querySelector(".ga-guide-controls>span").textContent'), '1 / 6');
      await key('ArrowRight', 39);
      await wait('document.activeElement.id==="guide-tab-student"');
      assert.equal(await evaluate('document.querySelector(".ga-guide-controls>span").textContent'), '1 / 5');
      assert.equal(await evaluate('document.querySelector(".ga-download-copy>.ga-button").href'), ANDROID_APK_URL);
      assert.equal(await evaluate('document.querySelector(".ga-download-meta a").href'), ANDROID_RELEASES_URL);
      await click('.ga-faq summary');
      assert.equal(await evaluate('document.querySelector(".ga-faq details").open'), true);
      assert.deepEqual(await evaluate('window.getAppManualFixture.writes'), []);
    });
    await t.test('QR failure retains Expo download; reopening restores the QR', async () => {
      await click('.get-app-qr-button');
      await wait('!!document.querySelector(".app-download-qr")');
      await evaluate('document.querySelector(".app-download-qr").dispatchEvent(new Event("error"))');
      await wait('!!document.querySelector(".app-download-fallback")');
      assert.equal(await evaluate('document.querySelector(".app-download-dialog>a").href'), ANDROID_APK_URL);
      await click('.app-download-close');
      await wait('!document.querySelector(".app-download-dialog")');
      await click('.get-app-qr-button');
      await wait('!!document.querySelector(".app-download-qr")');
      await key('Escape', 27);
      await wait('!document.querySelector(".app-download-dialog")');
    });
    await t.test('original promo decodes, plays, pauses, seeks, and requests native pop-out', async () => {
      await wait('document.querySelector(".ga-promo video").readyState>=2');
      const metadata = await evaluate('(()=>{const v=document.querySelector(".ga-promo video");return{width:v.videoWidth,height:v.videoHeight,duration:v.duration}})()');
      assert.deepEqual([metadata.width, metadata.height], [1920,1080]);
      assert.ok(metadata.duration>29 && metadata.duration<31);
      await evaluate('(async()=>{const v=document.querySelector(".ga-promo video");v.muted=true;await v.play()})()');
      await wait('document.querySelector(".ga-promo video").currentTime>0.1');
      await evaluate('(()=>{const v=document.querySelector(".ga-promo video");v.pause();v.currentTime=8})()');
      await wait('!document.querySelector(".ga-promo video").seeking && document.querySelector(".ga-promo video").readyState>=2');
      assert.equal(await evaluate('document.querySelector(".ga-promo video").paused'), true);
      if (await evaluate('document.pictureInPictureEnabled && typeof document.querySelector(".ga-promo video").requestPictureInPicture==="function"')) {
        // Exercise the native API with a user gesture; the removed custom button is no longer involved.
        const result = await send('Runtime.evaluate', { expression: 'document.querySelector(".ga-promo video").requestPictureInPicture().then(()=>true)', userGesture: true, awaitPromise: true, returnByValue: true });
        assert.equal(result.exceptionDetails, undefined);
        await wait('!!document.querySelector(".ga-promo-popped")');
        assert.equal(await evaluate('document.pictureInPictureElement===document.querySelector(".ga-promo video")'), true);
        await evaluate('document.exitPictureInPicture()');
        await wait('!document.querySelector(".ga-promo-popped")');
        t.diagnostic('Native picture-in-picture remains available without the separate heading row.');
      }
    });
    await t.test('native pop-out events preserve the inline player without a separate toolbar', async () => {
      await send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/get-app?pip-fixture` });
      await wait('location.search==="?pip-fixture" && !!document.querySelector(".ga-promo video")');
      await wait('document.querySelector(".ga-promo video").readyState>=1');
      await evaluate('document.querySelector(".ga-promo video").dispatchEvent(new Event("enterpictureinpicture"))');
      await wait('!!document.querySelector(".ga-promo-popped")');
      assert.match(await evaluate('document.querySelector(".ga-promo-popped").textContent'), /Playing in video pop-out/);
      await evaluate('document.querySelector(".ga-promo video").dispatchEvent(new Event("leavepictureinpicture"))');
      await wait('!document.querySelector(".ga-promo-popped")');
      assert.equal(await evaluate('document.querySelector(".ga-promo video").controls'), true);
      assert.equal(await evaluate('!!document.querySelector(".ga-promo-heading,.ga-promo-popout")'), false);
    });
    await t.test('failed media keeps a direct video link and native controls', async () => {
      await evaluate('document.querySelector(".ga-promo video").src="/missing-promo.webm"');
      await wait('!!document.querySelector(".ga-promo-error")');
      assert.match(await evaluate('document.querySelector(".ga-promo-error a").href'), /vista-promo\.webm/);
      assert.equal(await evaluate('document.querySelector(".ga-promo video").controls'), true);
    });
    await t.test('unsupported pop-out leaves normal video controls available', async () => {
      const { identifier } = await send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(document,'pictureInPictureEnabled',{configurable:true,value:false});Object.defineProperty(HTMLVideoElement.prototype,'webkitSetPresentationMode',{configurable:true,value:undefined});` });
      await send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/get-app?no-pip` });
      await wait('location.search==="?no-pip" && !!document.querySelector(".ga-promo video") && !!document.querySelector(".ga-guide")');
      assert.equal(await evaluate('!!document.querySelector(".ga-promo-popout")'), false);
      assert.equal(await evaluate('document.querySelector(".ga-promo video").controls'), true);
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
    });
    await t.test('missing handset photo preserves the actual ticket and download', async () => {
      await evaluate('document.querySelector(".ga-hand-photo").dispatchEvent(new Event("error"))');
      await wait('!!document.querySelector(".ga-hand.is-unavailable")');
      assert.equal(await evaluate('!!document.querySelector(".ga-hand.is-ready .ga-hand-ticket") && !document.querySelector(".ga-hand-loading")'), true);
      assert.equal(await evaluate('document.querySelector(".ga-download-copy>.ga-button").href'), ANDROID_APK_URL);
    });
    await t.test('missing guide screenshot preserves instructions and next-step navigation', async () => {
      await evaluate('document.querySelector(".ga-guide-screen-art>img").dispatchEvent(new Event("error"))');
      await wait('!!document.querySelector(".ga-guide-image-error")');
      assert.equal(await evaluate('document.querySelectorAll(".ga-guide-instructions li").length'), 3);
      await click('.ga-guide-controls button:last-child');
      await wait('!!document.querySelector(".ga-guide-screen-art>img") && !document.querySelector(".ga-guide-image-error")');
    });
    await t.test('missing hero ticket settles on its fallback', async () => {
      await evaluate('document.querySelector(".ga-hand-ticket").dispatchEvent(new Event("error"))');
      await wait('!!document.querySelector(".ga-hand-screen-fallback")');
      assert.equal(await evaluate('!!document.querySelector(".ga-hand.is-ready") && !document.querySelector(".ga-hand-loading")'), true);
    });
    for (const width of [320, 1366]) await t.test(`${width}px manual loading layout`, async () => {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `http://127.0.0.1:${server.httpServer.address().port}/get-app?skeleton` });
      await wait('!!document.querySelector(".get-app-skeleton-manual")');
      assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+1'), false);
      assert.equal(await evaluate('document.querySelectorAll(".get-app-skeleton-role-tabs > span").length'), 2);
      assert.equal(await evaluate('document.querySelectorAll(".get-app-skeleton-manual-nav").length'), 0);
      assert.ok(await evaluate('(()=>{const r=document.querySelector(".get-app-skeleton-video").getBoundingClientRect();return Math.abs(r.width/r.height-16/9)<0.01})()'));
      assert.equal(await evaluate('document.querySelectorAll("button,a,input").length'), 0);
    });
    assert.deepEqual(browser.exceptions, []);
  } finally { await browser.close(); await server.close(); }
});
