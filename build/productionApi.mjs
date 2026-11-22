import { isIP } from 'node:net';

// Production is served separately from Django; Vite's development proxy is absent.
export function productionApiUrl(value) {
  const message = 'Production VITE_API_URL must be a public HTTPS backend URL ending in /api. Local addresses and the development /api proxy are not valid for deployment.';
  if (typeof value !== 'string' || !value.trim()) throw new Error(message);
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error(message); }
  const host = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
      || !host.includes('.') || isIP(host) || host === 'localhost'
      || /\.(localhost|local|internal|test|invalid)$/.test(host)
      || !url.pathname.replace(/\/+$/, '').endsWith('/api')) throw new Error(message);
  return url.href.replace(/\/+$/, '');
}
