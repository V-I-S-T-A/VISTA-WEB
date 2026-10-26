import { execFileSync } from 'node:child_process';

// Git is present locally. Railway source archives can omit it, so a fresh
// deployment falls back to its build time rather than shipping a stale date.
export function getUpdateTimestamp({
  override,
  readCommitDate = () => execFileSync('git', ['log', '-1', '--format=%cI'], {
    cwd: new URL('../', import.meta.url), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim(),
  now = () => new Date(),
} = {}) {
  if (override) {
    const date = new Date(override);
    if (Number.isNaN(date.getTime())) throw new Error('VITE_APP_UPDATED_AT must be a valid ISO date.');
    return date.toISOString();
  }
  try {
    const date = new Date(readCommitDate());
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  } catch { /* Build archives do not always contain .git. */ }
  return now().toISOString();
}
