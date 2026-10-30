import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('stored staff attachment renders a filename button immediately, without effects or a render callback', async () => {
  const server = await createServer({ cacheDir: 'node_modules/.vite-tests/attachment-preview', server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] }, logLevel: 'error' });
  try {
    const { default: Preview } = await server.ssrLoadModule('/src/components/AttachmentImagePreview.jsx');
    const markup = renderToStaticMarkup(createElement(Preview, {
      fileUrl: 'https://example.test/scan.webp', fileName: 'Activity request.webp',
      mimeType: 'image/webp', triggerLabel: 'Activity request.webp',
    }));
    assert.match(markup, /<button/);
    assert.match(markup, /Activity request\.webp/);
    assert.match(markup, /title="Preview Activity request.webp"/);
    assert.doesNotMatch(markup, /role="dialog"/);
  } finally {
    await server.close();
  }
});
