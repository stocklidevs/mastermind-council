import { getModel, getProvider, getModelsForProvider } from '../config/provider-metadata.js';
import { builtInProviders } from '../config/provider-catalog.js';
import { getCouncilPresets } from '../config/council-presets.js';
import { formatSecretReference, validateSecretReference } from '../config/secret-references.js';
import { getRecentSessionHistory } from './session-history.js';

const DRAWER_TABS = [
  { id: 'mentors', label: 'Mentors' },
  { id: 'providers', label: 'Providers' },
  { id: 'models', label: 'Models' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'session', label: 'Session' }
];

export function buildSecretSettingsViewModel(secretReference) {
  const validation = validateSecretReference(secretReference);
  return {
    providerId: secretReference.providerId,
    mode: secretReference.mode,
    safeDisplay: validation.valid ? formatSecretReference(secretReference) : 'Invalid reference',
    valid: validation.valid,
    warning: validation.warning
  };
}

export function buildCacheCapabilityViewModel(cacheCapability) {
  const disabled = ['unsupported', 'unknown'].includes(cacheCapability.state);
  return {
    state: cacheCapability.state,
    label: cacheCapability.userLabel,
    verificationPath: cacheCapability.verificationPath,
    cacheCandidateSections: cacheCapability.cacheCandidateSections,
    dynamicSections: cacheCapability.dynamicSections,
    disabled
  };
}

export function buildSettingsDrawerViewModel({ activeTab = 'mentors' } = {}) {
  const normalizedActiveTab = DRAWER_TABS.some((tab) => tab.id === activeTab) ? activeTab : 'mentors';
  return {
    tabs: DRAWER_TABS.map((tab) => ({
      ...tab,
      active: tab.id === normalizedActiveTab
    }))
  };
}

export function buildSessionSettingsViewModel(settings = {}) {
  const parsed = Number.parseInt(settings.maxTurns, 10);
  const normalized = Number.isFinite(parsed) ? parsed : 3;
  return {
    maxTurns: Math.max(1, Math.min(normalized, 5)),
    minTurns: 1,
    maxAllowedTurns: 5,
    preambleEnabled: settings.preambleEnabled !== false,
    synthesisProviderId: String(settings.synthesisProviderId ?? 'openai'),
    synthesisModelId: String(settings.synthesisModelId ?? 'gpt-4.1')
  };
}

export function buildSessionHistoryViewModel(records = []) {
  const sessions = getRecentSessionHistory(records, 5).map((record) => ({
    id: record.id,
    question: record.question,
    mode: record.mode,
    createdAt: record.createdAt,
    synthesis: record.synthesis?.mainAnswer ?? ''
  }));
  return {
    count: records.length,
    sessions
  };
}

export function buildCouncilPresetSettingsViewModel({ activePresetId = 'custom', userPresets = [] } = {}) {
  return {
    activePresetId,
    presets: getCouncilPresets().map((preset) => ({
      id: preset.id,
      name: preset.name,
      category: preset.category,
      description: preset.description,
      mentorCount: preset.mentors.length,
      source: 'built-in',
      active: preset.id === activePresetId
    })),
    userPresets: userPresets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      category: preset.category ?? 'saved',
      description: preset.description ?? 'Saved local council.',
      mentorCount: preset.mentors?.length ?? 0,
      source: 'user',
      active: preset.id === activePresetId
    }))
  };
}

export function buildMentorConfigurationViewModel(mentor, catalog = builtInProviders) {
  const provider = getProvider(mentor.providerId, catalog);
  const model = getModel(mentor.providerId, mentor.modelId, catalog);
  return {
    ...mentor,
    providerName: provider?.name ?? 'Unknown provider',
    modelName: model?.displayName ?? 'Unknown model',
    availableModels: getModelsForProvider(mentor.providerId, catalog),
    cache: buildCacheCapabilityViewModel(model?.cacheCapability ?? unknownCacheCapability()),
    voiceReadiness: model?.voiceReadiness ?? 'unknown'
  };
}

export function buildPromptProfilePreview(mentor, catalog = builtInProviders) {
  const model = getModel(mentor.providerId, mentor.modelId, catalog);
  return {
    stableSections: [
      { label: 'Name', value: mentor.name },
      { label: 'Role', value: mentor.role },
      { label: 'Personality', value: mentor.personality },
      { label: 'Speaking style', value: mentor.speakingStyle },
      { label: 'Participation behavior', value: mentor.participationBehavior },
      ...buildIdentitySections(mentor.identity)
    ].filter((section) => section.value),
    dynamicSections: ['User question', 'Current round', 'Prior contributions', 'Closure request'],
    cacheNotes: buildCacheCapabilityViewModel(model?.cacheCapability ?? unknownCacheCapability())
  };
}

function buildIdentitySections(identity = {}) {
  return [
    { label: 'Biography', value: identity.biography },
    { label: 'Operating principles', value: formatList(identity.operatingPrinciples) },
    { label: 'Strengths', value: formatList(identity.strengths) },
    { label: 'Blind spots', value: formatList(identity.blindSpots) },
    { label: 'Debate style', value: identity.debateStyle },
    { label: 'Preferred questions', value: formatList(identity.preferredQuestions) },
    { label: 'Ritual presence', value: identity.ritualPresence }
  ];
}

function formatList(value) {
  return Array.isArray(value) ? value.join('; ') : value;
}

function unknownCacheCapability() {
  return {
    state: 'unknown',
    userLabel: 'Caching unknown',
    verificationPath: 'Select a known provider/model or verify provider usage reporting.',
    cacheCandidateSections: [],
    dynamicSections: ['user question', 'current round', 'prior contributions']
  };
}
