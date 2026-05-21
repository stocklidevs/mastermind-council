import test from 'node:test';
import assert from 'node:assert/strict';

import { createRuntimeLogger, sanitizeLogRecord } from '../../src/server/runtime-logger.js';

test('writes runtime logs as json lines', () => {
  const lines = [];
  const logger = createRuntimeLogger({ write: (line) => lines.push(line) });

  logger.info('real_council.request', { questionLength: 12 });

  assert.equal(lines.length, 1);
  assert.deepEqual(JSON.parse(lines[0]), {
    level: 'info',
    event: 'real_council.request',
    questionLength: 12
  });
});

test('redacts secrets and 1Password references from log records', () => {
  const record = sanitizeLogRecord({
    event: 'provider.error',
    apiKey: 'sk-secret-value',
    reference: 'op://Example Vault/OpenAI API Key/credential',
    message: 'bad key sk-secret-value'
  });
  const payload = JSON.stringify(record);

  assert.equal(payload.includes('sk-secret-value'), false);
  assert.equal(payload.includes('op://'), false);
  assert.equal(payload.includes('credential'), false);
  assert.equal(record.apiKey, '[redacted]');
});
