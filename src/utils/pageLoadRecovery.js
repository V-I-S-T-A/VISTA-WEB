const RECOVERY_KEY = "vista-page-load-recovery";
const RECOVERY_WINDOW = 60_000;

export function isPageLoadError(error) {
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading (?:CSS )?chunk .+ failed|Unable to preload CSS|Failed to load module script/i.test(error?.message || "");
}

// A deployment or Vite dependency refresh can invalidate a route's cached URL.
// Recover once; persistent failures must never create a reload loop.
export function recoverPageLoad(error, { storage, reload, pathname, now = Date.now() }) {
  if (!isPageLoadError(error)) return false;
  try {
    const previous = JSON.parse(storage.getItem(RECOVERY_KEY) || "null");
    if (previous?.pathname === pathname && now - previous.time < RECOVERY_WINDOW) return false;
    storage.setItem(RECOVERY_KEY, JSON.stringify({ pathname, time: now }));
  } catch {
    // Without a reliable reload guard, offer manual recovery instead.
    return false;
  }
  reload();
  return true;
}

export function recoverBrowserPageLoad(error) {
  try {
    return recoverPageLoad(error, {
      storage: window.sessionStorage,
      reload: () => window.location.reload(),
      pathname: window.location.pathname,
    });
  } catch {
    return false;
  }
}
