import test from 'node:test';
import assert from 'node:assert/strict';

import { handleRealCouncilRequest } from '../../src/server/real-council-handler.js';

test('rejects empty real council questions', async () => {
  const response = await handleRealCouncilRequest({ question: '   ' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'question-required');
});

test('returns a safe dry-run real council session', async () => {
  const response = await handleRealCouncilRequest({ question: 'What next?', dryRun: true });

  assert.equal(response.status, 200);
  assert.equal(response.body.session.status, 'closed');
  assert.equal(response.body.session.rounds[0].contributions.length, 4);
});

test('does not return secrets or 1Password references', async () => {
  const response = await handleRealCouncilRequest({ question: 'What next?', dryRun: true });
  const payload = JSON.stringify(response.body);

  assert.equal(payload.includes('dry-run-secret'), false);
  assert.equal(payload.includes('op://'), false);
  assert.equal(payload.includes('credential'), false);
});

test('emits safe runtime lifecycle logs', async () => {
  const records = [];
  await handleRealCouncilRequest(
    { question: 'What next?', dryRun: true },
    {
      logger: {
        info: (event, fields = {}) => records.push({ level: 'info', event, ...fields }),
        warn: (event, fields = {}) => records.push({ level: 'warn', event, ...fields }),
        error: (event, fields = {}) => records.push({ level: 'error', event, ...fields })
      }
    }
  );

  assert.ok(records.some((record) => record.event === 'real_council.request'));
  assert.ok(records.some((record) => record.event === 'provider.start'));
  assert.ok(records.some((record) => record.event === 'provider.done'));
  assert.ok(records.some((record) => record.event === 'real_council.done'));
  assert.equal(JSON.stringify(records).includes('What next?'), false);
  assert.equal(JSON.stringify(records).includes('op://'), false);
});
