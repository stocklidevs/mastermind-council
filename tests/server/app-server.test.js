import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppServer } from '../../scripts/serve-static.js';

const silentLogger = {
  info() {},
  warn() {},
  error() {}
};

test('serves real council API dry-run response', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://localhost:${port}/api/council/real`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What next?', dryRun: true })
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.session.status, 'closed');
    assert.equal(JSON.stringify(payload).includes('op://'), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejects unsupported API paths', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://localhost:${port}/api/nope`, { method: 'POST' });
    assert.equal(response.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('serves live council event stream', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://localhost:${port}/api/council/live?mode=mock&question=What%20next%3F&maxTurns=1`);
    const text = await response.text();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
    assert.match(text, /event: session.started/);
    assert.match(text, /event: mentor.token/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('serves local secret defaults from the public folder when present', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://localhost:${port}/public/local-secret-defaults.example.json`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.equal(payload.vaultName, 'Your Vault');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
