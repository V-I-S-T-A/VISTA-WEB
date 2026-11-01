// Shared transport used by useVistaRealtime. REST remains authoritative for writes.
export function websocketUrl(apiUrl, pageUrl) {
  const url = new URL(apiUrl, pageUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid API URL');
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws/notifications/';
  url.search = '';
  url.hash = '';
  return url.href;
}

export function tokenClaims(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(encoded));
  } catch { return {}; }
}

const types = new Set([
  'submission.created', 'submission.updated', 'review_log.created',
  'review_reply.created', 'notification.created', 'notification.read',
  'notification.unread_count_changed', 'notification.changed',
]);

export function createRealtimeClient({
  url, userId, getToken, refreshToken, isCurrent, onBatch, onStatus = () => {},
  Socket = WebSocket, schedule = setTimeout, unschedule = clearTimeout, random = Math.random,
}) {
  let stopped = true;
  let socket;
  let retryTimer;
  let authTimer;
  let heartbeat;
  let pongTimer;
  let batchTimer;
  let attempts = 0;
  let generation = 0;
  let ready = false;
  let supportsHeartbeat = false;
  let recovering = false;
  let flushing = false;
  let pending = [];
  const seen = new Set();
  const current = () => !stopped && isCurrent();
  const clearSocketTimers = () => {
    [authTimer, heartbeat, pongTimer].forEach(unschedule);
  };
  const queue = event => {
    pending.push(event);
    if (!batchTimer && !flushing) batchTimer = schedule(flush, 200);
  };
  async function flush() {
    batchTimer = null;
    if (!current()) return;
    const events = pending;
    pending = [];
    flushing = true;
    try { await onBatch(events); }
    finally {
      flushing = false;
      if (current() && pending.length) batchTimer = schedule(flush, 200);
    }
  }
  const ping = () => {
    if (!current() || !ready) return;
    socket.send(JSON.stringify({ type: 'ping' }));
    pongTimer = schedule(() => {
      if (supportsHeartbeat) socket?.close();
      else heartbeat = schedule(ping, 25_000);
    }, 10_000);
  };
  async function connect() {
    if (!current()) return;
    const ownGeneration = ++generation;
    const valid = () => current() && ownGeneration === generation;
    onStatus('connecting');
    try {
      const token = await getToken();
      if (!valid()) return;
      const ws = socket = new Socket(url);
      authTimer = schedule(() => ws.close(), 12_000);
      ws.onopen = () => { if (valid()) ws.send(JSON.stringify({ token })); };
      ws.onmessage = ({ data }) => {
        if (!valid()) return;
        let event;
        try { event = JSON.parse(data); } catch { return; }
        if (event?.type === 'ready') {
          if (String(event.user_id) !== String(userId)) { stop(); return; }
          if (ready) return;
          ready = true;
          attempts = 0;
          unschedule(authTimer);
          onStatus('connected');
          // Every handshake reconciles via REST; there is no replay/cursor contract.
          queue({ type: 'reconnected' });
          const remaining = tokenClaims(token).exp * 1000 - Date.now();
          if (Number.isFinite(remaining)) authTimer = schedule(() => ws.close(4000), Math.max(1000, remaining - 15_000));
          heartbeat = schedule(ping, 25_000);
          return;
        }
        if (!ready) return;
        if (event?.version === 1 || event?.type === 'pong') supportsHeartbeat = true;
        if (event?.type === 'pong') {
          unschedule(pongTimer);
          unschedule(heartbeat);
          heartbeat = schedule(ping, 25_000);
          return;
        }
        // Legacy frames are supported while Railway is moved to the merged v1 build.
        if (!event || !types.has(event.type) || (event.version != null && event.version !== 1)) return;
        if (event.event_id) {
          if (seen.has(event.event_id)) return;
          seen.add(event.event_id);
          if (seen.size > 1000) seen.delete(seen.values().next().value);
        }
        queue(event);
      };
      ws.onerror = () => ws.close();
      ws.onclose = async ({ code }) => {
        if (!valid()) return;
        ready = false;
        clearSocketTimers();
        onStatus('reconnecting');
        if (code === 4401 || code === 4000) {
          try { await refreshToken(); } catch { if (valid()) retry(); return; }
        }
        if (valid()) retry();
      };
    } catch { if (valid()) retry(); }
  }
  function retry() {
    onStatus('reconnecting');
    retryTimer = schedule(connect, Math.min(30_000, 1000 * 2 ** Math.min(attempts++, 5)) * (0.8 + random() * 0.4));
  }
  function stop() {
    stopped = true;
    generation++;
    clearSocketTimers();
    unschedule(retryTimer);
    unschedule(batchTimer);
    pending = [];
    ready = false;
    socket?.close();
    onStatus('disconnected');
  }
  return {
    start() { if (stopped) { stopped = false; connect(); } },
    stop,
    recover() {
      if (!current() || recovering) return;
      recovering = true;
      queue({ type: 'reconnected' });
      schedule(() => { recovering = false; }, 1000);
      // Replace a socket which may have gone half-open while the browser slept.
      if (socket) socket.close();
      else { unschedule(retryTimer); connect(); }
    },
  };
}
