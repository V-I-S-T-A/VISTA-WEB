import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveConfig } from 'vite';
import { productionApiUrl } from './productionApi.mjs';
import { websocketUrl } from '../src/services/realtimeService.js';

test('public production API defaults to the deployed backend, independently of the development proxy', () => {
  const defaults = readFileSync(new URL('../.env.production', import.meta.url), 'utf8');
  const api = productionApiUrl(defaults.match(/^VITE_API_URL=(.+)$/m)?.[1]);
  assert.equal(api, 'https://vista-backend-production-10d7.up.railway.app/api');
  assert.equal(websocketUrl(api, 'https://vista-ustp.up.railway.app/staff/dashboard'), 'wss://vista-backend-production-10d7.up.railway.app/ws/notifications/');
});

test('production rejects development addresses, credentials and malformed API bases', () => {
  for (const value of [undefined, '', '/api', 'http://api.example.com/api', 'http://localhost:8000/api',
    'https://localhost/api', 'https://sub.localhost/api', 'https://127.0.0.1/api', 'https://192.168.1.2/api',
    'https://10.0.0.1/api', 'https://172.16.0.1/api', 'https://0.0.0.0/api', 'https://2130706433/api',
    'https://[::1]/api', 'https://[fd00::1]/api', 'https://[fe80::1]/api',
    'https://backend.railway.internal/api', 'https://api.example.com',
    'https://user:password@api.example.com/api', 'https://api.example.com/api?token=example', 'https://api.example.com/api#part']) {
    assert.throws(() => productionApiUrl(value), /Production VITE_API_URL/);
  }
});

test('public production override remains configurable and is normalized', () => {
  assert.equal(productionApiUrl(' https://api.example.com/api/ '), 'https://api.example.com/api');
});

test('Vite enforces production configuration while leaving local development unchanged', async () => {
  const previous = process.env.VITE_API_URL;
  const previousProxy = process.env.DEV_API_PROXY_TARGET;
  try {
    process.env.VITE_API_URL = '/api';
    process.env.DEV_API_PROXY_TARGET = 'https://backend.example.com';
    const dev = await resolveConfig({ mode: 'development', logLevel: 'silent' }, 'serve');
    assert.equal(dev.define['import.meta.env.VITE_API_URL'], undefined);
    assert.equal(dev.server.proxy['/api'].target, 'https://backend.example.com');
    assert.equal(dev.server.proxy['/ws'].target, 'https://backend.example.com');
    assert.equal(dev.server.proxy['/ws'].ws, true);
    for (const value of ['/api', 'http://localhost:8000/api', 'https://127.0.0.1/api', 'https://10.0.0.1/api',
      'https://172.16.0.1/api', 'https://192.168.1.1/api', 'https://[::1]/api', 'http://api.example.com/api']) {
      process.env.VITE_API_URL = value;
      await assert.rejects(resolveConfig({ mode: 'production', logLevel: 'silent' }, 'build'), /Production VITE_API_URL/);
    }
    process.env.VITE_API_URL = '/api';
    await assert.rejects(resolveConfig({ mode: 'staging', logLevel: 'silent' }, 'build'), /Production VITE_API_URL/);
    process.env.VITE_API_URL = 'https://api.example.com/api/';
    const production = await resolveConfig({ mode: 'production', logLevel: 'silent' }, 'build');
    assert.equal(production.define['import.meta.env.VITE_API_URL'], JSON.stringify('https://api.example.com/api'));
    assert.equal(websocketUrl(JSON.parse(production.define['import.meta.env.VITE_API_URL']), 'https://web.example.com/'), 'wss://api.example.com/ws/notifications/');
  } finally {
    if (previous === undefined) delete process.env.VITE_API_URL;
    else process.env.VITE_API_URL = previous;
    if (previousProxy === undefined) delete process.env.DEV_API_PROXY_TARGET;
    else process.env.DEV_API_PROXY_TARGET = previousProxy;
  }
});
