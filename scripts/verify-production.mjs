import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';
import { loadEnv } from 'vite';
import { productionApiUrl } from '../build/productionApi.mjs';
import { websocketUrl } from '../src/services/realtimeService.js';
import { openDesignBrowser } from '../tests/helpers/designBrowser.mjs';

const api = productionApiUrl(loadEnv('production', process.cwd(), 'VITE_API_').VITE_API_URL);
const socket = websocketUrl(api, 'https://vista-ustp.up.railway.app/');
if (!socket.startsWith('wss://') || new URL(socket).host !== new URL(api).host) throw new Error('Production socket must use the secure API host.');
const bundles = readdirSync('dist/assets').filter(file => file.endsWith('.js')).map(file => readFileSync(`dist/assets/${file}`, 'utf8'));
const configured = bundles.flatMap(code => [...code.matchAll(/BASE_URL:\s*["'`]([^"'`]+)["'`]/g)].map(match => match[1]));
if (!configured.length || configured.some(url => url !== api)) throw new Error('Built API configuration does not match the validated production environment.');
const localEndpoint = /(?:https?|wss?):\/\/(?:localhost|127(?:\.\d+){3}|0\.0\.0\.0|10(?:\.\d+){3}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d+){2}|169\.254(?:\.\d+){2}|192\.168(?:\.\d+){2}|\[(?:::1|f[cd][0-9a-f:]+|fe[89ab][0-9a-f:]+)\])(?::\d+)?\/(?:api|ws)(?:[/"'`\s]|$)/i;
if (bundles.some(code => localEndpoint.test(code))) throw new Error('A local API/WebSocket endpoint remains in the production bundle.');
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
if (manifest.scripts.start !== 'serve -s dist -l $PORT') throw new Error('Review the Railway start command and update the dynamic-port smoke test together.');

const reservation = createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
// Ubuntu CI executes npm start with the real Railway-style PORT expansion.
// Windows cmd does not expand $PORT, so local Windows uses serve's equivalent CLI.
const windows = process.platform === 'win32';
const command = windows ? ['node_modules/serve/build/main.js', '-s', 'dist', '-l', `tcp://127.0.0.1:${port}`, '--no-clipboard']
  : [process.env.npm_execpath, 'start'];
if (command.some(value => !value)) throw new Error('Run through npm run check:production.');
const child = spawn(process.execPath, command, { env: { ...process.env, PORT: String(port) }, detached: !windows, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';child.stdout.on('data', data => { logs += data; });child.stderr.on('data', data => { logs += data; });
let browser;
try {
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* Wait for this owned server only. */ }
    await pause(100);
  }
  if (!ready) throw new Error(`Production server did not bind its assigned port: ${logs}`);
  const index = readFileSync('dist/index.html', 'utf8');
  const routes = ['/', '/get-app', '/login', '/privacy-policy', '/terms-of-service', '/staff/review-panel/194f7b2a-ec37-4d7b-8a84-c99e8ac14f2a', '/student/review-tracker/194f7b2a-ec37-4d7b-8a84-c99e8ac14f2a', '/staff/gdrive-sync/callback'];
  for (const route of routes) {
    const response = await fetch(origin + route);
    if (response.status !== 200 || (await response.text()).trim() !== index.trim()) throw new Error(`SPA hard-refresh fallback failed: ${route}`);
  }
  for (const match of index.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)) {
    const response = await fetch(origin + match[1]);
    if (!response.ok || (response.headers.get('content-type') || '').includes('text/html')) throw new Error(`Missing built asset: ${match[1]}`);
  }
  browser = await openDesignBrowser();
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await browser.send('Page.navigate', { url: origin + '/get-app' });
  await browser.wait('!!document.querySelector(".ga-guide") && !!document.querySelector(".ga-promo video")');
  await browser.evaluate('document.fonts.ready');
  if (browser.exceptions.length) throw new Error('Built Get App page raised a browser exception.');
  mkdirSync('artifacts', { recursive: true });
  await browser.screenshot('artifacts/production-get-app.png');
  writeFileSync('artifacts/production-smoke.json', JSON.stringify({ api, socket, port, routes, startup: windows ? 'Windows serve CLI equivalent' : 'npm start with dynamic PORT', externalRequestsBlocked: true }, null, 2));
  console.log(`Verified built API ${api}, socket ${socket}, dynamic port, ${routes.length} SPA routes and built Get App browser rendering.`);
} finally {
  await browser?.close();
  if (child.pid) {
    if (windows) child.kill();
    else { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Owned process already exited. */ } }
  }
}
