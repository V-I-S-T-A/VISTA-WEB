// Isolated, owned Chrome process. Callers supply only fictional local fixtures.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function openDesignBrowser() {
  const executable = [process.env.CHROME_PATH, process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'), '/usr/bin/google-chrome', '/usr/bin/chromium'].find(file => file && existsSync(file));
  if (!executable) throw new Error('Chrome is required for rendered design verification');
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'vista-design-review-'));
  const child = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await pause(100); }
  }
  if (!port) { child.kill(); throw new Error('Chrome debug endpoint unavailable'); }
  const endpoint = `http://127.0.0.1:${port}`;
  const pages = await (await fetch(`${endpoint}/json`)).json();
  const page = pages.find(page => page.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let next = 0; const pending = new Map(); const exceptions = []; const requests = [];
  ws.onmessage = event => {
    const result = JSON.parse(event.data);
    if (result.id) {
      const request = pending.get(result.id); pending.delete(result.id);
      if (result.error) request?.reject(new Error(JSON.stringify(result.error))); else request?.resolve(result.result);
    }
    if (result.method === 'Runtime.exceptionThrown') exceptions.push(result.params.exceptionDetails);
    if (result.method === 'Network.requestWillBeSent') requests.push(result.params.request);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait = async expression => {
    for (let i = 0; i < 180; i++) { if (await evaluate(expression)) return; await pause(100); }
    throw new Error(`Timed out: ${expression}`);
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['https://*', 'http://localhost:*', 'http://127.0.0.1:8000/*'] });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  return { send, evaluate, wait, exceptions, requests, endpoint, targetId: page.id,
    async screenshot(file, fullPage = false) {
      const options = fullPage ? { captureBeyondViewport: true, clip: { x: 0, y: 0, width: await evaluate('innerWidth'), height: await evaluate('document.documentElement.scrollHeight'), scale: 1 } } : {};
      const shot = await send('Page.captureScreenshot', { format: 'png', ...options });
      await fs.writeFile(file, Buffer.from(shot.data, 'base64'));
    },
    async close() { try { await send('Browser.close'); } catch { /* Browser may close its pipe first. */ } ws.close(); child.kill(); },
  };
}
