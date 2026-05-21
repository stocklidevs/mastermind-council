export const defaultProviderSmokeTargets = [
  {
    id: 'anthropic',
    name: 'Claude',
    adapter: 'anthropic-messages',
    model: 'claude-sonnet-4-20250514',
    secretReference: 'op://Example Vault/Anthropic API Key/credential',
    prompt: 'Reply with exactly: OK'
  },
  {
    id: 'xai',
    name: 'xAI',
    adapter: 'openai-compatible-chat',
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-3',
    secretReference: 'op://Example Vault/xAI API Key/credential',
    prompt: 'Reply with exactly: OK'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    adapter: 'openai-responses',
    model: 'gpt-4.1',
    secretReference: 'op://Example Vault/OpenAI API Key/credential',
    prompt: 'Reply with exactly: OK'
  },
  {
    id: 'novita',
    name: 'Novita',
    adapter: 'openai-compatible-chat',
    baseUrl: 'https://api.novita.ai/openai/v1',
    model: 'meta-llama/llama-3.1-8b-instruct',
    secretReference: 'op://Example Vault/Novita API Key/credential',
    prompt: 'Reply with exactly: OK'
  }
];

export function getProviderSmokeTargets({ only } = {}) {
  const selected = only ? new Set(String(only).split(',').map((id) => id.trim())) : null;
  return defaultProviderSmokeTargets
    .filter((target) => !selected || selected.has(target.id))
    .map((target) => ({ ...target }));
}
