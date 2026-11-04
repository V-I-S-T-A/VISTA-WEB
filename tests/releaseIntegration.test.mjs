import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('reconciled reply service preserves both existing payload formats and page/cancellation options', async () => {
  const server = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-tests/release-service', server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  try {
    const { default: api } = await server.ssrLoadModule('/src/lib/axios.js');
    const { reviewLogService } = await server.ssrLoadModule('/src/services/reviewLogService.js');
    const sent = [];
    api.post = async (...args) => { sent.push(args); return { data: { reply_id: 'saved' } }; };
    api.get = async (...args) => { sent.push(args); return { data: { results: [] } }; };
    const signal = new AbortController().signal;
    await reviewLogService.createReply('log', { message: 'reply', parent_reply: 'parent', client_request_id: 'same' }, { signal });
    await reviewLogService.createReply('log', { message: 'reply', parentReply: 'parent', clientRequestId: 'same' }, { signal });
    assert.deepEqual(sent[0], sent[1]);
    assert.deepEqual(sent[0][1], { message: 'reply', parent_reply: 'parent', client_request_id: 'same' });
    assert.equal(sent[0][2].signal, signal);
    await reviewLogService.getReplies('log', { page: 3, pageSize: 8, signal });
    assert.deepEqual(sent[2][1], { params: { page: 3, page_size: 8 }, signal });
  } finally { await server.close(); }
});

test('teammate thread UI renders under QueryClient and honors server participation capability', async () => {
  const server = await createServer({ configFile: false, plugins: [react()], cacheDir: 'node_modules/.vite-tests/release-thread', server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  const cache = new QueryClient();
  cache.setQueryData(['current_user'], { user_id: 'account' });
  try {
    const { default: Thread } = await server.ssrLoadModule('/src/modules/shared/ReviewReplyThread.jsx');
    const render = can_reply => renderToStaticMarkup(createElement(QueryClientProvider, { client: cache }, createElement(Thread, {
      log: { log_id: 'log', reply_count: 2, can_reply }, canReply: true,
    })));
    assert.match(render(true), /Write a reply/);
    assert.match(render(true), /2 replies/);
    assert.doesNotMatch(render(false), /textarea/);
  } finally { cache.clear(); await server.close(); }
});
