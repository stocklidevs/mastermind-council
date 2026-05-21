import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyLocalSecretDefaults,
  buildOnePasswordReferenceFromDefaults,
  normalizeLocalSecretDefaults
} from '../../src/config/local-secret-defaults.js';

const providers = [
  { id: 'openai', name: 'OpenAI', secretLabel: 'OPENAI_API_KEY' },
  { id: 'anthropic', name: 'Anthropic', secretLabel: 'ANTHROPIC_API_KEY' },
  { id: 'local', name: 'Local' }
];

test('normalizes local 1Password defaults without requiring committed metadata', () => {
  const defaults = normalizeLocalSecretDefaults({
    vaultName: 'Team Vault',
    accountName: 'example.1password.com',
    itemNames: {
      openai: 'OpenAI Local API Key'
    }
  });

  assert.deepEqual(defaults, {
    vaultName: 'Team Vault',
    accountName: 'example.1password.com',
    itemNames: {
      openai: 'OpenAI Local API Key'
    }
  });
});

test('builds provider references from local item names before generic fallbacks', () => {
  const reference = buildOnePasswordReferenceFromDefaults(providers[0], {
    vaultName: 'Team Vault',
    itemNames: { openai: 'OpenAI Local API Key' }
  });

  assert.equal(reference, 'op://Team Vault/OpenAI Local API Key/credential');
});

test('applies local defaults over public-safe generic or environment references', () => {
  const updated = applyLocalSecretDefaults(
    {
      openai: {
        providerId: 'openai',
        mode: 'one-password',
        reference: 'op://Your Vault/OpenAI API Key/credential',
        account: ''
      },
      anthropic: {
        providerId: 'anthropic',
        mode: 'environment',
        reference: 'ANTHROPIC_API_KEY',
        account: ''
      }
    },
    providers,
    {
      vaultName: 'Team Vault',
      accountName: 'example.1password.com',
      itemNames: {
        openai: 'OpenAI Local API Key',
        anthropic: 'Claude Local API Key'
      }
    }
  );

  assert.equal(updated.openai.mode, 'one-password');
  assert.equal(updated.openai.reference, 'op://Team Vault/OpenAI Local API Key/credential');
  assert.equal(updated.openai.account, 'example.1password.com');
  assert.equal(updated.anthropic.reference, 'op://Team Vault/Claude Local API Key/credential');
  assert.equal(updated.local, undefined);
});
