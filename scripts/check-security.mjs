import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Invoke npm's JS entry directly, including on Windows, without a shell.
if (!process.env.npm_execpath) throw new Error('Run this check through npm run check:security.');
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'audit', '--package-lock-only', '--audit-level=high', '--json'], { encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
if (result.error) throw result.error;
mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/npm-audit.json', result.stdout || '{}');
let report;
try { report = JSON.parse(result.stdout); } catch { throw new Error('npm audit did not produce a valid report.'); }
if (report.error || !report.metadata?.vulnerabilities) throw new Error('npm audit could not query advisories; security checks cannot pass without a report.');
console.log('Dependency findings:', report.metadata.vulnerabilities);
for (const [name, issue] of Object.entries(report.vulnerabilities || {})) console.log(`${issue.severity}: ${name}; fix available: ${Boolean(issue.fixAvailable)}`);
process.exit(result.status ?? 1);
