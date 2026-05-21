import test from 'node:test';
import assert from 'node:assert/strict';
import { createStreamingSmokeTargets, runStreamingSmokeTarget } from '../../src/providers/streaming-smoke.js';

test('selects OpenAI and Anthropic streaming smoke targets by default', () => {
  const targets = createStreamingSmokeTargets();

  assert.deepEqual(
    targets.map((target) => target.id).sort(),
    ['anthropic', 'openai']
  );
});

test('dry-run reports target readiness without resolving secrets', async () => {
  const [target] = createStreamingSmokeTargets({ only: 'openai' });
  let resolved = false;
  const result = await runStreamingSmokeTarget(target, {
    dryRun: true,
    resolveSecret: async () => {
      resolved = true;
      return { ok: false };
    }
  });

  assert.equal(resolved, false);
  assert.equal(result.ok, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.providerName, 'OpenAI');
});

test('live smoke returns safe token count and preview', async () => {
  const [target] = createStreamingSmokeTargets({ only: 'openai' });
  const result = await runStreamingSmokeTarget(target, {
    resolveSecret: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
    streamText: async function* () {
      yield { type: 'token', text: 'O' };
      yield { type: 'token', text: 'K' };
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.tokenCount, 2);
  assert.equal(result.preview, 'OK');
  assert.equal(JSON.stringify(result).includes('sk-secret-value'), false);
});

test('live smoke redacts secret reference failures', async () => {
  const [target] = createStreamingSmokeTargets({ only: 'openai' });
  const result = await runStreamingSmokeTarget(target, {
    resolveSecret: async () => ({ ok: false, error: 'op://Vault/OpenAI/credential failed' })
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.includes('op://'), false);
});
