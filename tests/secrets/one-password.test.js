import test from 'node:test';
import assert from 'node:assert/strict';

import {
  findOnePasswordCli,
  maskSecret,
  resolveOnePasswordReference,
  validateOnePasswordReference
} from '../../src/secrets/one-password.js';

test('validates op secret references', () => {
  assert.equal(validateOnePasswordReference('op://Example Vault/OpenAI API Key/credential').valid, true);
  assert.equal(validateOnePasswordReference('Example Vault/OpenAI API Key/credential').valid, false);
});

test('masks secrets without exposing the original value', () => {
  const masked = maskSecret('sk-test-secret-value');

  assert.equal(masked.includes('sk-test-secret-value'), false);
  assert.match(masked, /^sk-/);
  assert.match(masked, /alue$/);
});

test('resolves 1Password reference through an injectable runner without returning the value', async () => {
  const result = await resolveOnePasswordReference('op://Example Vault/OpenAI API Key/credential', {
    opPath: 'op',
    runner: async ({ args }) => {
      assert.deepEqual(args, ['read', 'op://Example Vault/OpenAI API Key/credential']);
      return { exitCode: 0, stdout: 'sk-live-secret\n', stderr: '' };
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.reference, 'op://Example Vault/OpenAI API Key/credential');
  assert.equal(result.secret, undefined);
  assert.equal(result.value, undefined);
  assert.equal(result.masked, 'sk-...cret');
});

test('finds bundled 1Password CLI candidate when PATH lookup fails', async () => {
  const result = await findOnePasswordCli({
    env: {
      LOCALAPPDATA: 'C:\\Users\\pstoc\\AppData\\Local'
    },
    pathExists: (candidate) => candidate.includes('AgileBits.1Password.CLI')
  });

  assert.match(result.path, /op\.exe$/);
});
