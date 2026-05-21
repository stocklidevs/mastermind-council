import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatSecretReference,
  looksLikePlaintextSecret,
  validateSecretReference
} from '../../src/config/secret-references.js';

test('validates environment variable secret references', () => {
  assert.deepEqual(validateSecretReference({ mode: 'environment', reference: 'OPENAI_API_KEY' }), {
    valid: true,
    warning: null
  });
});

test('validates 1Password op references', () => {
  assert.deepEqual(validateSecretReference({ mode: 'one-password', reference: 'op://Private/OpenAI/api key' }), {
    valid: true,
    warning: null
  });
});

test('warns on plaintext-looking API keys', () => {
  const result = validateSecretReference({
    mode: 'environment',
    reference: 'sk-proj-abcdefghijklmnopqrstuvwxyz123456'
  });

  assert.equal(result.valid, false);
  assert.match(result.warning, /reference/i);
  assert.equal(looksLikePlaintextSecret('sk-ant-api03-abcdefghijklmnopqrstuvwxyz'), true);
});

test('formats safe display labels without resolved values', () => {
  assert.equal(
    formatSecretReference({ mode: 'one-password', reference: 'op://Private/OpenAI/api key' }),
    '1Password: op://Private/.../api key'
  );
});
