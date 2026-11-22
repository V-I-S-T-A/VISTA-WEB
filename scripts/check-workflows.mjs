import { mkdtempSync, writeFileSync, chmodSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const version = '1.7.12';
const platform = {
  'linux-x64': ['linux_amd64.tar.gz', '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8', 'actionlint'],
  'win32-x64': ['windows_amd64.zip', '6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9', 'actionlint.exe'],
}[`${process.platform}-${process.arch}`];
if (!platform) throw new Error('This pinned actionlint installer supports Windows/Linux x64. Run actionlint 1.7.12 directly on other platforms.');
const [suffix, checksum, executable] = platform;
const directory = mkdtempSync(path.join(tmpdir(), 'vista-actionlint-'));
const archive = path.join(directory, `actionlint_${version}_${suffix}`);
const response = await fetch(`https://github.com/rhysd/actionlint/releases/download/v${version}/actionlint_${version}_${suffix}`);
if (!response.ok) throw new Error(`actionlint download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash('sha256').update(bytes).digest('hex') !== checksum) throw new Error('actionlint checksum mismatch.');
writeFileSync(archive, bytes);
execFileSync('tar', ['-xf', archive, '-C', directory, executable], { stdio: 'inherit', windowsHide: true });
const binary = path.join(directory, executable);chmodSync(binary, 0o755);
const workflows = readdirSync('.github/workflows').filter(file => /\.ya?ml$/.test(file)).map(file => `.github/workflows/${file}`);
if (!workflows.length) throw new Error('No workflows found.');
// These workflows invoke Node scripts, not embedded shell programs.
execFileSync(binary, ['-color', '-shellcheck=', ...workflows], { stdio: 'inherit', windowsHide: true });
console.log(`Validated ${workflows.length} workflow(s) with checksum-verified actionlint ${version}.`);
