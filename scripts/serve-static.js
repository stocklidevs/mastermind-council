import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRealCouncilRequest } from '../src/server/real-council-handler.js';
import { handleLiveCouncilRequest } from '../src/server/live-council-handler.js';
import { createRuntimeLogger } from '../src/server/runtime-logger.js';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

export function createAppServer({ root = process.cwd(), logger = createRuntimeLogger() } = {}) {
  const normalizedRoot = normalize(root);
  return createServer(async (request, response) => {
    if (request.url === '/api/council/real' && request.method === 'POST') {
      await handleRealCouncilApi(request, response, logger);
      return;
    }

    if (request.url?.startsWith('/api/council/live') && request.method === 'GET') {
      await handleLiveCouncilApi(request, response, logger);
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
}

async function handleLiveCouncilApi(request, response, logger) {
  const url = new URL(request.url, 'http://localhost');
  const result = await handleLiveCouncilRequest(url, {
    logger,
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
  return target;
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

const isDirectRun =
  typeof process !== 'undefined' && process.argv?.[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const port = Number.parseInt(process.env.PORT ?? '4173', 10);
  createAppServer().listen(port, () => {
    console.log(`Mastermind council UI: http://localhost:${port}`);
  });
}
