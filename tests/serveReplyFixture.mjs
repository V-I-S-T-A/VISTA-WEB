// Optional local-only browser QA: node tests/serveReplyFixture.mjs
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const server = await createServer({
  configFile: false,
  plugins: [react(), tailwindcss()],
  cacheDir: 'node_modules/.vite-tests/reply-browser',
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime', '@tanstack/react-query', 'axios'] },
  server: { host: '127.0.0.1', port: 5179, strictPort: true, hmr: false },
});
await server.listen();
console.log('Mocked reply UI: http://127.0.0.1:5179/tests/fixtures/review-replies.html');
