import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { createAppServer, createLocalAccessToken } from '../../scripts/serve-static.js';

const silentLogger = {
  info() {},
  warn() {},
  error() {}
};

test('serves real council API dry-run response with the local access token', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/council/real`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mastermind-Local-Token': server.localAccessToken
      },
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

test('rejects secret-backed APIs without the local access token', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/tts/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'hello' })
    });
    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.equal(payload.error, 'local-access-token-required');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejects unsupported API paths', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/nope`, { method: 'POST' });
    assert.equal(response.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('serves live council event stream with the local access token', async () => {
  const server = createAppServer({ root: process.cwd(), logger: silentLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const url = `http://127.0.0.1:${port}/api/council/live?mode=mock&question=What%20next%3F&maxTurns=1&accessToken=${server.localAccessToken}`;
    const response = await fetch(url);
    const text = await response.text();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
    assert.match(text, /event: session.started/);
    assert.match(text, /event: mentor.token/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('serves local secret defaults only through the token-protected API', async () => {
  const root = await createServerRoot();
  await writeFile(join(root, 'public', 'local-secret-defaults.json'), '{"vaultName":"Private Vault"}');
  const server = createAppServer({ root, logger: silentLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const publicResponse = await fetch(`http://127.0.0.1:${port}/public/local-secret-defaults.json`);
    assert.equal(publicResponse.status, 404);

    const response = await fetch(`http://127.0.0.1:${port}/api/local-secret-defaults`, {
      headers: { 'X-Mastermind-Local-Token': server.localAccessToken }
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.equal(payload.vaultName, 'Private Vault');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('does not serve private repo files as static assets', async () => {
  const root = await createServerRoot();
  await writeFile(join(root, 'package.json'), '{"private":true}');
  await mkdir(join(root, 'src', 'secrets'), { recursive: true });
  await writeFile(join(root, 'src', 'secrets', 'one-password.js'), 'secret code');
  await mkdir(join(root, 'docs'), { recursive: true });
  await writeFile(join(root, 'docs', 'local-storage.md'), 'storage notes');
  const server = createAppServer({ root, logger: silentLogger });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    for (const path of ['/package.json', '/src/secrets/one-password.js', '/docs/local-storage.md']) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(response.status, 404, `${path} should not be publicly served`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('creates strong local access tokens', () => {
  const token = createLocalAccessToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(token, createLocalAccessToken());
});

async function createServerRoot() {
  const root = await mkdtemp(join(tmpdir(), 'mastermind-server-'));
  await mkdir(join(root, 'public'), { recursive: true });
  await writeFile(join(root, 'public', 'index.html'), '<!doctype html><title>Mastermind</title>');
  return root;
}
