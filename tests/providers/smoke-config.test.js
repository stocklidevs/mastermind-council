import test from 'node:test';
import assert from 'node:assert/strict';

import { defaultProviderSmokeTargets, getProviderSmokeTargets } from '../../src/providers/smoke-config.js';

test('defines smoke targets for configured 1Password API keys', () => {
  const ids = defaultProviderSmokeTargets.map((target) => target.id);

  assert.deepEqual(ids, ['anthropic', 'xai', 'openai', 'novita']);
  assert.ok(
    defaultProviderSmokeTargets.every((target) => target.secretReference.startsWith('op://Example Vault/'))
  );
});

test('uses provider-specific adapters and base URLs', () => {
  const targets = getProviderSmokeTargets();

  assert.equal(targets.find((target) => target.id === 'anthropic').adapter, 'anthropic-messages');
  assert.equal(targets.find((target) => target.id === 'openai').adapter, 'openai-responses');
  assert.equal(targets.find((target) => target.id === 'xai').baseUrl, 'https://api.x.ai/v1');
  assert.equal(targets.find((target) => target.id === 'novita').baseUrl, 'https://api.novita.ai/openai/v1');
});
