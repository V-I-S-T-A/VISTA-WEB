import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
}
const targets = ['vite.config.js', 'eslint.config.js', ...['src', 'build', 'scripts', 'tests'].flatMap(files)]
  .filter(file => /\.(js|mjs)$/.test(file));
for (const file of targets) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error(`${file}: ${result.stderr || result.error}`);
}
const production = readFileSync('.env.production', 'utf8').split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
if (production.length !== 1 || !production[0].startsWith('VITE_API_URL=')) throw new Error('.env.production may contain only the public VITE_API_URL default.');
console.log(`Syntax checked ${targets.length} JavaScript modules; JSX is checked by ESLint/Vite. Production defaults contain only public API configuration.`);
