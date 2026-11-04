import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('thread renders exact counts with participation limited by the server capability', async () => {
  const server = await createServer({ configFile: false, plugins: [react()], cacheDir: 'node_modules/.vite-tests/review-replies', server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  const client = new QueryClient();
  try {
    const { default: Thread, REPLY_MAX_LENGTH } = await server.ssrLoadModule('/src/components/ReviewReplyThread.jsx');
    assert.equal(REPLY_MAX_LENGTH, 4000);
    const render = can_reply => renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Thread, {
      log: { log_id: 'staff-remark', changed_by_name: 'Actual Staff', can_reply, reply_count: 3 },
    })));
    const viewer = render(false);
    assert.match(viewer, /View 3 replies/);
    assert.match(viewer, /aria-expanded="false"/);
    assert.doesNotMatch(viewer, />Reply<|textarea|Send reply/);
    assert.match(render(true), />Reply<\/button>/);
  } finally {
    client.clear();
    await server.close();
  }
});
