import test from 'node:test';
import assert from 'node:assert/strict';
import { registerDialog } from '../src/utils/dialogFocus.js';

test('a registered native dialog cycles Tab but leaves Escape to its cancel handler', () => {
  const { doc, trigger, dialog, key } = environment();
  const { root, first, last } = dialog();
  root.tagName = 'DIALOG';
  first.closest = last.closest = selector => selector === 'dialog[open]' ? root : null;
  let dismissed = false;
  const unregister = registerDialog(root, { document: doc, onDismiss: () => { dismissed = true; } });
  try {
    last.focus(); key('Tab'); assert.equal(doc.activeElement, first);
    first.focus(); key('Tab', true); assert.equal(doc.activeElement, last);
    assert.equal(key('Escape').defaultPrevented, undefined);
    assert.equal(dismissed, false);
  } finally { unregister(); }
  assert.equal(doc.activeElement, trigger); assert.equal(doc.body.style.overflow, 'auto');
});

function environment() {
  const listeners = new Set();
  const doc = { body: { style: { overflow: 'auto' } },
    addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn),
    querySelector: () => null,
  };
  const control = () => ({ isConnected: true, closest: () => null, getClientRects: () => [1],
    focus() { doc.activeElement = this; } });
  const trigger = control(); doc.activeElement = trigger;
  const dialog = () => {
    const first = control(), last = control();
    const root = { querySelector: () => null, querySelectorAll: () => [first,last],
      contains: el => el === first || el === last, focus() { doc.activeElement = root; } };
    return { root, first, last };
  };
  const key = (value, shiftKey = false) => {
    const event = { key: value, shiftKey, target: doc.activeElement,
      preventDefault() { this.defaultPrevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
    for (const fn of listeners) { fn(event); if (event.stopped) break; }
    return event;
  };
  return { doc, trigger, dialog, key, listeners };
}

test('dialog traps both tab directions and restores the opener and scroll state', () => {
  const env = environment(), { root, first, last } = env.dialog();
  const release = registerDialog(root, { document: env.doc });
  try {
    assert.equal(env.doc.activeElement, first);
    assert.equal(env.doc.body.style.overflow, 'hidden');
    assert.equal(env.key('Tab', true).defaultPrevented, true);
    assert.equal(env.doc.activeElement, last);
    env.key('Tab'); assert.equal(env.doc.activeElement, first);
  } finally { release(); }
  assert.equal(env.doc.activeElement, env.trigger);
  assert.equal(env.doc.body.style.overflow, 'auto');
  assert.equal(env.listeners.size, 0);
});

test('only the top nested dialog dismisses; closing it keeps the parent scroll lock', () => {
  const env = environment(); let parentCloses = 0, childCloses = 0;
  const parent = env.dialog(), child = env.dialog();
  const closeParent = registerDialog(parent.root, { document: env.doc, onDismiss: () => parentCloses++ });
  const closeChild = registerDialog(child.root, { document: env.doc, onDismiss: () => childCloses++ });
  try {
    env.key('Escape'); assert.equal(childCloses, 1); assert.equal(parentCloses, 0);
    closeChild(); assert.equal(env.doc.activeElement, parent.first);
    assert.equal(env.doc.body.style.overflow, 'hidden');
    env.key('Escape'); assert.equal(parentCloses, 1);
  } finally { closeParent(); }
  assert.equal(env.doc.body.style.overflow, 'auto');
});

test('pending operations block Escape dismissal without releasing the focus trap', () => {
  const env = environment(); let busy = true, closes = 0;
  const release = registerDialog(env.dialog().root, { document: env.doc, canDismiss: () => !busy, onDismiss: () => closes++ });
  try {
    env.key('Escape'); assert.equal(closes, 0);
    busy = false; env.key('Escape'); assert.equal(closes, 1);
  } finally { release(); }
});

test('an open nested select owns Escape before the surrounding dialog', () => {
  const env = environment(); let closes = 0;
  env.doc.querySelector = () => ({});
  const release = registerDialog(env.dialog().root, { document: env.doc, onDismiss: () => closes++ });
  try {
    assert.equal(env.key('Escape').defaultPrevented, undefined);
    assert.equal(closes, 0);
    env.doc.querySelector = () => null;
    env.key('Escape'); assert.equal(closes, 1);
  } finally { release(); }
});

test('removing a parent out of order does not unlock a remaining child dialog', () => {
  const env = environment();
  const parent = registerDialog(env.dialog().root, { document: env.doc });
  const child = registerDialog(env.dialog().root, { document: env.doc });
  parent(); assert.equal(env.doc.body.style.overflow, 'hidden');
  child(); assert.equal(env.doc.body.style.overflow, 'auto');
});

test('field errors remain associated with disabled controls and preserve submitted values', async () => {
  const { createServer } = await import('vite');
  const { default: react } = await import('@vitejs/plugin-react');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const server = await createServer({ configFile: false, plugins: [react()], cacheDir: 'node_modules/.vite-tests/ui-presentation', server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  try {
    const { default: Field } = await server.ssrLoadModule('/src/components/FormField.jsx');
    const html = renderToStaticMarkup(createElement(Field, { label: 'Email', htmlFor: 'email', error: 'Use an institutional email.' }, createElement('input', { defaultValue: 'kept@example.test', disabled: true })));
    assert.match(html, /for="email"/);
    assert.match(html, /id="email"/);
    assert.match(html, /aria-describedby="email-error"/);
    assert.match(html, /aria-invalid="true"/);
    assert.match(html, /id="email-error" role="alert"/);
    assert.match(html, /value="kept@example.test"/);
    assert.match(html, /disabled=""/);
  } finally { await server.close(); }
});

test('student summary keeps all four server counts, including zero and unavailable returned totals', async () => {
  const { createServer } = await import('vite');
  const { default: react } = await import('@vitejs/plugin-react');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
  const server = await createServer({ configFile: false, plugins: [react()], cacheDir: 'node_modules/.vite-tests/summary-presentation', server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  try {
    const { default: Cards } = await server.ssrLoadModule('/src/modules/student/dashboard/components/SubmissionSummaryCards.jsx');
    for (const expected of [[12, 2, 7, 3], [0, 0, 0, 0], [12, 2, 7, null]]) {
      const client = new QueryClient({ defaultOptions: { queries: { retry: false, retryOnMount: false, gcTime: Infinity } } });
      try {
        ['', 'pending', 'approved', 'rejected'].forEach((status, index) => {
          const queryKey = ['submissions', { page: 1, pageSize: 1, search: '', status, dateFrom: '', dateTo: '' }];
          if (expected[index] !== null) client.setQueryData(queryKey, { count: expected[index], results: [] });
          else client.getQueryCache().build(client, { queryKey }).setState({ status: 'error', error: new Error('Fictional unavailable count'), fetchStatus: 'idle' });
        });
        const html = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Cards)));
        assert.equal((html.match(/class="vista-summary-card /g) || []).length, 4);
        for (const label of ['Total Submissions', 'Pending', 'Approved', 'Returned']) assert.ok(html.includes(label));
        assert.deepEqual([...html.matchAll(/data-summary-value[^>]*>([^<]+)<\/p>/g)].map(match => match[1]), expected.map(value => value === null ? '—' : String(value)));
        if (expected.includes(null)) assert.ok(html.includes('Some submission totals could not be refreshed'));
      } finally { client.clear(); }
    }
  } finally { await server.close(); }
});
