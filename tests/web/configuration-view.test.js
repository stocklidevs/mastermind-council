import test from 'node:test';
import assert from 'node:assert/strict';

import { getModel } from '../../src/config/provider-metadata.js';
import {
  addCustomProvider,
  createProviderCatalogState,
  getEffectiveProviders
} from '../../src/config/provider-catalog.js';
import { createDefaultMentors, updateMentorModel } from '../../src/config/mentor-config.js';
import {
  buildCacheCapabilityViewModel,
  buildMentorConfigurationViewModel,
  buildPromptProfilePreview,
  buildCouncilPresetSettingsViewModel,
  buildSecretSettingsViewModel,
  buildSessionHistoryViewModel,
  buildSessionSettingsViewModel,
  buildSettingsDrawerViewModel
} from '../../src/web/configuration-view.js';

test('builds provider secret settings view model with safe display', () => {
  const view = buildSecretSettingsViewModel({
    providerId: 'openai',
    mode: 'environment',
    reference: 'OPENAI_API_KEY'
  });

  assert.equal(view.safeDisplay, 'Environment: OPENAI_API_KEY');
  assert.equal(view.valid, true);
});

test('builds capability display for selected mentor model', () => {
  const [mentor] = createDefaultMentors();
  const view = buildMentorConfigurationViewModel(mentor);

  assert.equal(view.providerName, 'OpenAI');
  assert.equal(view.modelName, 'GPT-4.1');
  assert.equal(view.cache.state, 'automatic');
});

test('builds settings drawer tabs with active tab state', () => {
  const view = buildSettingsDrawerViewModel({ activeTab: 'providers' });

  assert.deepEqual(view.tabs.map((tab) => tab.id), ['mentors', 'providers', 'models', 'prompt', 'session']);
  assert.equal(view.tabs.find((tab) => tab.id === 'providers').active, true);
});

test('builds session settings with clamped max turns', () => {
  assert.equal(buildSessionSettingsViewModel({ maxTurns: 0 }).maxTurns, 1);
  assert.equal(buildSessionSettingsViewModel({ maxTurns: 3 }).maxTurns, 3);
  assert.equal(buildSessionSettingsViewModel({ maxTurns: 99 }).maxTurns, 5);
  assert.equal(buildSessionSettingsViewModel({ maxTurns: 'nope' }).maxTurns, 3);
  assert.equal(buildSessionSettingsViewModel({}).preambleEnabled, true);
  assert.equal(buildSessionSettingsViewModel({ preambleEnabled: false }).preambleEnabled, false);
  assert.equal(buildSessionSettingsViewModel({}).synthesisProviderId, 'openai');
  assert.equal(buildSessionSettingsViewModel({ synthesisProviderId: 'anthropic' }).synthesisProviderId, 'anthropic');
  assert.equal(buildSessionSettingsViewModel({}).synthesisModelId, 'gpt-4.1');
});

test('builds council preset settings view model', () => {
  const view = buildCouncilPresetSettingsViewModel({
    activePresetId: 'user-my-room',
    userPresets: [{ id: 'user-my-room', name: 'My Room', description: 'Saved locally.', mentors: [{ id: 'a' }] }]
  });

  assert.ok(view.presets.length >= 6);
  assert.equal(view.activePresetId, 'user-my-room');
  assert.equal(view.presets.find((preset) => preset.id === 'science').source, 'built-in');
  assert.equal(view.userPresets[0].active, true);
  assert.equal(view.userPresets[0].mentorCount, 1);
});

test('builds session history view model newest first', () => {
  const view = buildSessionHistoryViewModel([
    { id: 'old', question: 'Old?', mode: 'mock', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'new', question: 'New?', mode: 'live-real', createdAt: '2026-01-02T00:00:00.000Z' }
  ]);

  assert.equal(view.count, 2);
  assert.deepEqual(
    view.sessions.map((session) => session.question),
    ['New?', 'Old?']
  );
});

test('builds mentor view model from an effective custom provider catalog', () => {
  const catalogState = addCustomProvider(createProviderCatalogState(), {
    id: 'groq-custom',
    name: 'Groq Lab',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelId: 'llama-3.3-70b-versatile'
  });
  const [mentor] = createDefaultMentors();
  const updated = updateMentorModel(
    mentor,
    { providerId: 'groq-custom', modelId: 'llama-3.3-70b-versatile' },
    getEffectiveProviders(catalogState)
  );

  const view = buildMentorConfigurationViewModel(updated, getEffectiveProviders(catalogState));

  assert.equal(view.providerName, 'Groq Lab');
  assert.equal(view.modelName, 'llama-3.3-70b-versatile');
  assert.equal(view.cache.state, 'unknown');
});

test('builds prompt profile preview without secrets', () => {
  const [mentor] = createDefaultMentors();
  const preview = buildPromptProfilePreview(mentor);

  assert.ok(preview.stableSections.some((section) => section.label === 'Role'));
  assert.ok(preview.stableSections.some((section) => section.label === 'Biography'));
  assert.ok(preview.stableSections.some((section) => section.label === 'Blind spots'));
  assert.ok(preview.dynamicSections.some((section) => /User question/.test(section)));
  assert.equal(JSON.stringify(preview).includes('API_KEY'), false);
});

test('builds cache candidate preview for explicit caching', () => {
  const model = getModel('anthropic', 'claude-sonnet-4-20250514');
  const view = buildCacheCapabilityViewModel(model.cacheCapability);

  assert.equal(view.state, 'explicit');
  assert.ok(view.cacheCandidateSections.includes('mentor identity'));
  assert.equal(view.disabled, false);
});

test('disables unsupported and unknown caching states', () => {
  assert.equal(
    buildCacheCapabilityViewModel(getModel('local', 'mock-local-mentor').cacheCapability).disabled,
    true
  );
  assert.equal(
    buildCacheCapabilityViewModel(
      getModel('openrouter', 'openrouter-provider-dependent').cacheCapability
    ).disabled,
    true
  );
});
