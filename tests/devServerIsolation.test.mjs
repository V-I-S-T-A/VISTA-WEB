import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createServer as reservePort } from 'node:net';

test('a second web server refuses the occupied port instead of sharing the live dependency cache', async () => {
  // Vite treats 0 as its default port; do not collide with a developer's server.
  const reservation = reservePort();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const options = {
    // Never touch the developer's running Vite dependency cache.
    cacheDir: 'node_modules/.vite-tests/port-isolation',
    server: { host: '127.0.0.1', port, hmr: false },
    optimizeDeps: { noDiscovery: true, entries: [], include: [] },
    logLevel: 'silent',
  };
  const first = await createServer(options);
  let second;
  try {
    await first.listen();
    const address = first.httpServer.address();
    second = await createServer({ ...options, server: { ...options.server, port: address.port } });
    await assert.rejects(second.listen(), /Port \d+ is already in use/);
    const response = await fetch(`http://127.0.0.1:${address.port}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /src\/main\.jsx/);
  } finally {
    await second?.close();
    await first.close();
  }
});
