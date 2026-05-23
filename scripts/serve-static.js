import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRealCouncilRequest } from '../src/server/real-council-handler.js';
import { handleLiveCouncilRequest } from '../src/server/live-council-handler.js';
import { createRuntimeLogger } from '../src/server/runtime-logger.js';
import { handleOpenAiTtsRequest } from '../src/server/tts-handler.js';
import { createLiveConfigStore } from '../src/server/live-config-store.js';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

export function createAppServer({ root = process.cwd(), logger = createRuntimeLogger(), localAccessToken = createLocalAccessToken() } = {}) {
  const normalizedRoot = normalize(root);
  const liveConfigs = createLiveConfigStore();
  const server = createServer(async (request, response) => {
    if (request.url === '/api/local-access-token' && request.method === 'GET') {
      if (!isLoopbackRequest(request)) {
        writeJson(response, 403, { error: 'local-request-required' });
        return;
      }
      writeJson(response, 200, { token: localAccessToken });
      return;
    }

    if (request.url === '/api/local-secret-defaults' && request.method === 'GET') {
      if (!authorizeLocalRequest(request, response, localAccessToken)) return;
      await handleLocalSecretDefaultsApi(response, normalizedRoot);
      return;
    }

    if (request.url === '/api/council/real' && request.method === 'POST') {
      if (!authorizeLocalRequest(request, response, localAccessToken)) return;
      await handleRealCouncilApi(request, response, logger);
      return;
    }

    if (request.url?.startsWith('/api/council/live') && request.method === 'GET') {
      if (!authorizeLocalRequest(request, response, localAccessToken)) return;
      await handleLiveCouncilApi(request, response, logger, liveConfigs);
      return;
    }

    if (request.url === '/api/council/live-config' && request.method === 'POST') {
      if (!authorizeLocalRequest(request, response, localAccessToken)) return;
      await handleLiveConfigApi(request, response, liveConfigs);
      return;
    }

    if (request.url === '/api/tts/openai' && request.method === 'POST') {
      if (!authorizeLocalRequest(request, response, localAccessToken)) return;
      await handleOpenAiTtsApi(request, response, logger);
      return;
    }

    if (request.url?.startsWith('/api/')) {
      writeJson(response, 404, { error: 'not-found' });
      return;
    }

    const filePath = resolvePath(request.url, normalizedRoot);
    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] ?? 'text/plain; charset=utf-8'
    });
    createReadStream(filePath).pipe(response);
  });
  server.localAccessToken = localAccessToken;
  return server;
}

async function handleLiveCouncilApi(request, response, logger, liveConfigs) {
  const url = new URL(request.url, 'http://localhost');
  const config = liveConfigs.get(url.searchParams.get('configId'));
  const result = await handleLiveCouncilRequest(url, {
    logger,
    secretReferences: config?.secretReferences,
    start: (status, headers) => response.writeHead(status, headers),
    write: (chunk) => response.write(chunk),
    end: () => response.end()
  });

  if (result.status !== 200) {
    writeJson(response, result.status, result.body);
  }
}

function resolvePath(url, root) {
  const parsed = new URL(url, 'http://localhost');
  const pathname = parsed.pathname === '/' ? '/public/index.html' : parsed.pathname;
  const target = normalize(join(root, pathname));

  if (!target.startsWith(root)) return null;
  if (!isAllowedStaticPath(root, target, pathname)) return null;
  return target;
}

function isAllowedStaticPath(root, target, pathname) {
  if (pathname === '/public/local-secret-defaults.json') return false;
  const relativePath = relative(root, target);
  if (!relativePath || relativePath.startsWith('..') || relativePath.includes(`..${sep}`)) return false;
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized.startsWith('public/')) return true;
  if (normalized.startsWith('src/')) {
    if (!normalized.endsWith('.js')) return false;
    return !normalized.startsWith('src/server/') && !normalized.startsWith('src/secrets/');
  }
  return false;
}

async function handleLocalSecretDefaultsApi(response, root) {
  try {
    const payload = await readFile(join(root, 'public', 'local-secret-defaults.json'), 'utf8');
    writeJson(response, 200, JSON.parse(payload));
  } catch {
    writeJson(response, 404, { error: 'local-secret-defaults-not-found' });
  }
}

async function handleRealCouncilApi(request, response, logger) {
  try {
    const body = JSON.parse(await readBody(request));
    const result = await handleRealCouncilRequest(body, { logger });
    writeJson(response, result.status, result.body);
  } catch {
    writeJson(response, 400, { error: 'invalid-json' });
  }
}

async function handleLiveConfigApi(request, response, liveConfigs) {
  try {
    const body = JSON.parse(await readBody(request));
    const configId = liveConfigs.save({
      secretReferences: sanitizeSecretReferences(body.secretReferences)
    });
    writeJson(response, 200, { configId });
  } catch {
    writeJson(response, 400, { error: 'invalid-json' });
  }
}

function sanitizeSecretReferences(secretReferences) {
  if (!secretReferences || typeof secretReferences !== 'object') return {};
  return Object.fromEntries(
    Object.entries(secretReferences).map(([providerId, value]) => [
      providerId,
      {
        mode: value?.mode === 'one-password' ? 'one-password' : 'environment',
        reference: String(value?.reference ?? '')
          .replaceAll(/\bsk-[A-Za-z0-9_-]{4,}\b/g, '')
          .trim(),
        account: String(value?.account ?? '')
          .replaceAll(/\bsk-[A-Za-z0-9_-]{4,}\b/g, '')
          .trim()
      }
    ])
  );
}

async function handleOpenAiTtsApi(request, response, logger) {
  try {
    const body = JSON.parse(await readBody(request));
    const result = await handleOpenAiTtsRequest(body, { logger });
    response.writeHead(result.status, result.headers);
    if (result.body instanceof ArrayBuffer) {
      response.end(Buffer.from(result.body));
      return;
    }
    response.end(JSON.stringify(result.body));
  } catch {
    writeJson(response, 400, { error: 'invalid-json' });
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function writeJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

export function createLocalAccessToken() {
  return randomBytes(32).toString('base64url');
}

function authorizeLocalRequest(request, response, token) {
  if (!isLoopbackRequest(request) || !hasValidLocalAccessToken(request, token)) {
    writeJson(response, 403, { error: 'local-access-token-required' });
    return false;
  }
  return true;
}

function hasValidLocalAccessToken(request, token) {
  const provided = getRequestAccessToken(request);
  if (!provided) return false;
  const expected = Buffer.from(token);
  const actual = Buffer.from(provided);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function getRequestAccessToken(request) {
  const header = request.headers['x-mastermind-local-token'];
  if (Array.isArray(header)) return header[0] ?? '';
  if (header) return header;
  try {
    return new URL(request.url, 'http://localhost').searchParams.get('accessToken') ?? '';
  } catch {
    return '';
  }
}

function isLoopbackRequest(request) {
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress);
}

const isDirectRun =
  typeof process !== 'undefined' && process.argv?.[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const port = Number.parseInt(process.env.PORT ?? '4173', 10);
  createAppServer().listen(port, '127.0.0.1', () => {
    console.log(`Mastermind council UI: http://127.0.0.1:${port}`);
  });
}
