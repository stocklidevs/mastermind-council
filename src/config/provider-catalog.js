const DYNAMIC_PROMPT_SECTIONS = ['user question', 'current round', 'prior contributions'];
const STABLE_MENTOR_SECTIONS = ['mentor identity', 'role', 'personality', 'speaking style'];
const CACHE_STATES = new Set(['automatic', 'explicit', 'unsupported', 'unknown']);

function cacheCapability(state, userLabel, verificationPath, cacheCandidateSections = STABLE_MENTOR_SECTIONS) {
  return {
    state,
    userLabel,
    verificationPath,
    cacheCandidateSections: state === 'unsupported' || state === 'unknown' ? [] : cacheCandidateSections,
    dynamicSections: DYNAMIC_PROMPT_SECTIONS
  };
}

export const builtInProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'built-in',
    apiStyle: 'native',
    baseUrl: 'https://api.openai.com/v1',
    secretLabel: 'OPENAI_API_KEY',
    notes: 'Built-in OpenAI preset.',
    models: [
      {
        id: 'gpt-4.1',
        providerId: 'openai',
        displayName: 'GPT-4.1',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'automatic',
          'Automatic input caching',
          'Check cached input tokens in provider usage reporting.'
        )
      },
      {
        id: 'gpt-5.5',
        providerId: 'openai',
        displayName: 'GPT-5.5',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'automatic',
          'Automatic input caching',
          'Check cached input tokens in provider usage reporting.'
        )
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    kind: 'built-in',
    apiStyle: 'native',
    baseUrl: 'https://api.anthropic.com',
    secretLabel: 'ANTHROPIC_API_KEY',
    notes: 'Built-in Anthropic preset.',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        providerId: 'anthropic',
        displayName: 'Claude Sonnet 4',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'explicit',
          'Explicit prompt caching',
          'Check cache creation and read token usage later.'
        )
      },
      {
        id: 'claude-sonnet-4-6',
        providerId: 'anthropic',
        displayName: 'Claude Sonnet 4.6',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'explicit',
          'Explicit prompt caching',
          'Check cache creation and read token usage later.'
        )
      }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    kind: 'built-in',
    apiStyle: 'native',
    baseUrl: 'https://generativelanguage.googleapis.com',
    secretLabel: 'GEMINI_API_KEY',
    notes: 'Built-in Google Gemini preset.',
    models: [
      {
        id: 'gemini-2.5-pro',
        providerId: 'gemini',
        displayName: 'Gemini 2.5 Pro',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'explicit',
          'Explicit context caching',
          'Check cached content usage in provider reporting later.'
        )
      }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    kind: 'built-in',
    apiStyle: 'openai-compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    secretLabel: 'OPENROUTER_API_KEY',
    notes: 'Provider and model capabilities depend on the route selected by OpenRouter.',
    models: [
      {
        id: 'openrouter-provider-dependent',
        providerId: 'openrouter',
        displayName: 'Provider-dependent model',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'unknown',
          'Provider-dependent caching',
          'Check routed provider and OpenRouter generation usage later.'
        )
      }
    ]
  },
  {
    id: 'xai',
    name: 'xAI',
    kind: 'built-in',
    apiStyle: 'openai-compatible',
    baseUrl: 'https://api.x.ai/v1',
    secretLabel: 'XAI_API_KEY',
    notes: 'OpenAI-compatible xAI preset.',
    models: [
      {
        id: 'grok-3',
        providerId: 'xai',
        displayName: 'Grok 3',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'unknown',
          'Caching unknown',
          'Verify xAI cache behavior against current provider usage reporting.'
        )
      },
      {
        id: 'grok-4',
        providerId: 'xai',
        displayName: 'Grok 4',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'unknown',
          'Caching unknown',
          'Verify xAI cache behavior against current provider usage reporting.'
        )
      }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    kind: 'built-in',
    apiStyle: 'openai-compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    secretLabel: 'GROQ_API_KEY',
    notes: 'OpenAI-compatible Groq preset.',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        providerId: 'groq',
        displayName: 'Llama 3.3 70B Versatile',
        source: 'preset',
        voiceReadiness: 'unknown',
        cacheCapability: cacheCapability(
          'unknown',
          'Caching unknown',
          'Verify Groq cache behavior against current provider usage reporting.'
        )
      }
    ]
  },
  {
    id: 'local',
    name: 'Local Mock',
    kind: 'built-in',
    apiStyle: 'local',
    baseUrl: null,
    secretLabel: null,
    notes: 'Dependency-free local mock provider for development.',
    models: [
      {
        id: 'mock-local-mentor',
        providerId: 'local',
        displayName: 'Mock local mentor',
        source: 'preset',
        voiceReadiness: 'unsupported',
        cacheCapability: cacheCapability(
          'unsupported',
          'Caching unsupported',
          'No provider cache exists for mock local mentors.'
        )
      }
    ]
  }
];

export function createProviderCatalogState({ customProviders = [] } = {}) {
  return {
    customProviders: customProviders.map(cloneProvider)
  };
}

export function getEffectiveProviders(state = createProviderCatalogState()) {
  return [...builtInProviders.map(cloneProvider), ...(state.customProviders ?? []).map(cloneProvider)];
}

export function validateCustomProviderDraft(state, draft) {
  const id = normalizeId(draft.id);
  const name = String(draft.name ?? '').trim();
  const modelId = String(draft.modelId ?? '').trim();
  const effectiveProviders = getEffectiveProviders(state);
  const errors = {};

  if (!id) errors.id = 'Provider id is required.';
  if (id && !/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    errors.id = 'Provider id must use lowercase letters, numbers, and hyphens.';
  }
  if (id && effectiveProviders.some((provider) => provider.id === id)) {
    errors.id = 'Provider id already exists.';
  }
  if (!name) errors.name = 'Provider name is required.';
  if (!modelId) errors.modelId = 'At least one model id is required.';

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function addCustomProvider(state, draft) {
  const validation = validateCustomProviderDraft(state, draft);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0]);
  }

  const providerId = normalizeId(draft.id);
  const provider = {
    id: providerId,
    name: String(draft.name).trim(),
    kind: 'custom',
    apiStyle: draft.apiStyle ?? 'openai-compatible',
    baseUrl: String(draft.baseUrl ?? '').trim(),
    secretLabel: String(draft.secretLabel ?? '').trim() || null,
    notes: String(draft.notes ?? '').trim(),
    models: [
      createModel(providerId, {
        id: draft.modelId,
        displayName: draft.modelDisplayName,
        cacheState: draft.cacheState
      })
    ]
  };

  return {
    ...state,
    customProviders: [...(state.customProviders ?? []), provider]
  };
}

export function addCustomModel(state, providerId, draft) {
  const customProviders = (state.customProviders ?? []).map((provider) => {
    if (provider.id !== providerId) return provider;
    const modelId = String(draft.id ?? '').trim();
    if (!modelId) throw new Error('Model id is required.');
    if (provider.models.some((model) => model.id === modelId)) {
      throw new Error('Model id already exists for provider.');
    }
    return {
      ...provider,
      models: [...provider.models, createModel(provider.id, draft)]
    };
  });

  return {
    ...state,
    customProviders
  };
}

function createModel(providerId, draft) {
  const state = CACHE_STATES.has(draft.cacheState) ? draft.cacheState : 'unknown';
  const displayName = String(draft.displayName ?? draft.id ?? '').trim();
  return {
    id: String(draft.id ?? '').trim(),
    displayName,
    providerId,
    source: 'custom',
    voiceReadiness: draft.voiceReadiness ?? 'unknown',
    notes: String(draft.notes ?? '').trim(),
    cacheCapability: cacheCapability(
      state,
      cacheLabel(state),
      state === 'unknown'
        ? 'Verify cache behavior against current provider usage reporting.'
        : 'User-defined cache capability.'
    )
  };
}

function cacheLabel(state) {
  return {
    automatic: 'Automatic input caching',
    explicit: 'Explicit prompt caching',
    unsupported: 'Caching unsupported',
    unknown: 'Caching unknown'
  }[state];
}

function normalizeId(value) {
  return String(value ?? '').trim().toLowerCase();
}

function cloneProvider(provider) {
  return {
    ...provider,
    models: provider.models.map((model) => ({
      ...model,
      cacheCapability: {
        ...model.cacheCapability,
        cacheCandidateSections: [...model.cacheCapability.cacheCandidateSections],
        dynamicSections: [...model.cacheCapability.dynamicSections]
      }
    }))
  };
}
