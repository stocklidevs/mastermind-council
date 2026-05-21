const GENERIC_ITEM_NAMES = {
  openai: 'OpenAI API Key',
  anthropic: 'Anthropic API Key',
  xai: 'xAI API Key',
  novita: 'Novita API Key',
  groq: 'Groq API Key',
  gemini: 'Gemini API Key',
  openrouter: 'OpenRouter API Key'
};

export function normalizeLocalSecretDefaults(value) {
  if (!value || typeof value !== 'object') return null;
  const vaultName = cleanText(value.vaultName) || 'Your Vault';
  const accountName = cleanText(value.accountName);
  const itemNames = Object.fromEntries(
    Object.entries(value.itemNames ?? {})
      .map(([providerId, itemName]) => [cleanProviderId(providerId), cleanText(itemName)])
      .filter(([providerId, itemName]) => providerId && itemName)
  );
  if (!Object.keys(itemNames).length && vaultName === 'Your Vault' && !accountName) return null;
  return {
    vaultName,
    accountName,
    itemNames
  };
}

export function buildOnePasswordReferenceFromDefaults(provider, defaults = null) {
  const providerId = cleanProviderId(provider?.id);
  const vault = cleanText(defaults?.vaultName) || 'Your Vault';
  const item =
    cleanText(defaults?.itemNames?.[providerId]) ||
    GENERIC_ITEM_NAMES[providerId] ||
    `${cleanText(provider?.name) || providerId} API Key`;
  return `op://${vault}/${item}/credential`;
}

export function applyLocalSecretDefaults(secretReferences, providers, defaults) {
  const normalized = normalizeLocalSecretDefaults(defaults);
  if (!normalized) return secretReferences;
  const next = { ...(secretReferences ?? {}) };
  for (const provider of providers ?? []) {
    if (provider.id === 'local' || !provider.secretLabel) continue;
    if (!normalized.itemNames[provider.id]) continue;
    next[provider.id] = {
      providerId: provider.id,
      mode: 'one-password',
      reference: buildOnePasswordReferenceFromDefaults(provider, normalized),
      account: normalized.accountName
    };
  }
  return next;
}

function cleanText(value) {
  return String(value ?? '')
    .replaceAll(/\bsk-[A-Za-z0-9_-]{4,}\b/g, '')
    .trim()
    .slice(0, 160);
}

function cleanProviderId(value) {
  return String(value ?? '')
    .replaceAll(/[^a-z0-9_-]/gi, '')
    .trim()
    .slice(0, 48);
}
