import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { createServer } from 'vite';

test('REST and socket refresh share rotation, isolate switched accounts and preserve offline sessions', async () => {
  const originalAdapter = axios.defaults.adapter;
  const previousStorage = globalThis.localStorage, previousWindow = globalThis.window;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  globalThis.window = new EventTarget();
  window.location = { pathname: '/login', search: '', href: '/login' };
  const server = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-tests/realtime-auth', server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  try {
    const auth = await server.ssrLoadModule('/src/lib/axios.js');
    let calls = 0, finish;
    values.set('refresh_token', 'old-refresh'); values.set('access_token', 'old-access');
    axios.defaults.adapter = config => { calls++; return new Promise(resolve => { finish = data => resolve({ data, status: 200, headers: {}, config }); }); };
    const one = auth.refreshAccessToken(), two = auth.refreshAccessToken();
    assert.equal(one, two); assert.equal(calls, 1);
    finish({ access: 'new-access', refresh: 'rotated-refresh' });
    assert.deepEqual(await Promise.all([one, two]), ['new-access', 'new-access']);
    assert.equal(values.get('refresh_token'), 'rotated-refresh');
    const stale = auth.refreshAccessToken();
    values.set('access_token', 'other-account-access'); values.set('refresh_token', 'other-account-refresh');
    finish({ access: 'must-not-save', refresh: 'must-not-save' });
    await assert.rejects(stale, /Session changed/);
    assert.equal(values.get('access_token'), 'other-account-access');
    assert.equal(values.get('refresh_token'), 'other-account-refresh');
    axios.defaults.adapter = () => Promise.reject(new Error('Network unavailable'));
    await assert.rejects(auth.refreshAccessToken(), /Network unavailable/);
    assert.equal(values.get('refresh_token'), 'other-account-refresh');
    let ended = 0;
    window.addEventListener('vista:session-changed', () => ended++);
    axios.defaults.adapter = () => Promise.reject(Object.assign(new Error('Invalid refresh'), { response: { status: 401 } }));
    await assert.rejects(auth.refreshAccessToken(), /Invalid refresh/);
    assert.equal(values.size, 0); assert.equal(ended, 1);
  } finally {
    axios.defaults.adapter = originalAdapter;
    globalThis.localStorage = previousStorage; globalThis.window = previousWindow;
    await server.close();
  }
});
