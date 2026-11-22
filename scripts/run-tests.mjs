import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const group = process.argv[2] || 'all';
if (!['all', 'unit', 'browser'].includes(group)) throw new Error('Expected all, unit or browser.');
const files = ['build', 'scripts', 'tests'].flatMap(directory =>
  readdirSync(directory).filter(name => /\.test\.(mjs|js)$/.test(name)).map(name => `${directory}/${name}`),
).filter(file => {
  const browser = /openDesignBrowser|const chrome =/.test(readFileSync(file, 'utf8'));
  return group === 'all' || (group === 'browser' ? browser : !browser);
}).sort();
if (!files.length) throw new Error(`No ${group} tests found.`);
const chrome = [process.env.CHROME_PATH,
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(file => file && existsSync(file));
if (group !== 'unit' && !chrome) throw new Error('Browser regressions require Chrome. Set CHROME_PATH; CI must not silently skip them.');
console.log(`Running ${files.length} ${group} test files serially.`);
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...files], {
  stdio: 'inherit', windowsHide: true,
  // Even a fixture missing its mock must never target the shared Railway API.
  env: { ...process.env, VITE_API_URL: 'http://127.0.0.1:9/__ci_blocked_api', DEV_API_PROXY_TARGET: '', ...(chrome ? { CHROME_PATH: chrome } : {}) },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
