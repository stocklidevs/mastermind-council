import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getModel,
  getModelsForProvider,
  getProvider,
  providers
} from '../../src/config/provider-metadata.js';

test('defines curated providers with unique model ids', () => {
  assert.ok(providers.length >= 4);

  for (const provider of providers) {
    const ids = new Set(provider.models.map((model) => model.id));
    assert.equal(ids.size, provider.models.length);
  }
});

test('returns model list scoped by provider', () => {
  const openaiModels = getModelsForProvider('openai');

  assert.ok(openaiModels.length > 0);
  assert.ok(openaiModels.every((model) => model.providerId === 'openai'));
});

test('returns cache capability states for representative models', () => {
  assert.equal(getModel('openai', 'gpt-4.1').cacheCapability.state, 'automatic');
  assert.equal(getModel('anthropic', 'claude-sonnet-4-20250514').cacheCapability.state, 'explicit');
  assert.equal(getModel('local', 'mock-local-mentor').cacheCapability.state, 'unsupported');
  assert.equal(getModel('openrouter', 'openrouter-provider-dependent').cacheCapability.state, 'unknown');
});

test('includes requested frontier models in built-in provider catalogs', () => {
  assert.equal(getModel('openai', 'gpt-5.5').displayName, 'GPT-5.5');
  assert.equal(getModel('anthropic', 'claude-sonnet-4-6').displayName, 'Claude Sonnet 4.6');
  assert.equal(getModel('xai', 'grok-4').displayName, 'Grok 4');
});

test('returns provider metadata by id', () => {
  assert.equal(getProvider('anthropic').name, 'Anthropic');
});
