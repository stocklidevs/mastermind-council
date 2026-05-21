import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addCustomModel,
  addCustomProvider,
  builtInProviders,
  createProviderCatalogState,
  getEffectiveProviders,
  validateCustomProviderDraft
} from '../../src/config/provider-catalog.js';

test('built-in catalog includes xAI and Groq presets', () => {
  assert.ok(builtInProviders.some((provider) => provider.id === 'xai'));
  assert.ok(builtInProviders.some((provider) => provider.id === 'groq'));
});

test('adds a custom OpenAI-compatible provider with a default unknown cache model', () => {
  const state = createProviderCatalogState();
  const updated = addCustomProvider(state, {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    secretLabel: 'TOGETHER_API_KEY',
    modelId: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8'
  });

  const provider = getEffectiveProviders(updated).find((item) => item.id === 'together');
  assert.equal(provider.kind, 'custom');
  assert.equal(provider.apiStyle, 'openai-compatible');
  assert.equal(provider.models[0].cacheCapability.state, 'unknown');
});

test('rejects duplicate custom provider ids', () => {
  const state = createProviderCatalogState();
  const result = validateCustomProviderDraft(state, {
    id: 'openai',
    name: 'Other OpenAI',
    baseUrl: 'https://example.test/v1',
    modelId: 'model'
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.id, /already exists/i);
});

test('adds custom models uniquely within a provider', () => {
  const state = addCustomProvider(createProviderCatalogState(), {
    id: 'local-gateway',
    name: 'Local Gateway',
    baseUrl: 'http://localhost:8080/v1',
    modelId: 'first-model'
  });
  const updated = addCustomModel(state, 'local-gateway', {
    id: 'second-model',
    displayName: 'Second Model',
    cacheState: 'unsupported'
  });

  const provider = getEffectiveProviders(updated).find((item) => item.id === 'local-gateway');
  assert.deepEqual(provider.models.map((model) => model.id), ['first-model', 'second-model']);
});
