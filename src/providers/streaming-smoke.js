import { getProviderSmokeTargets } from './smoke-config.js';
import { streamProviderText } from './streaming.js';

const STREAMING_SMOKE_PROMPT = 'Reply with exactly: OK';
const STREAMING_ADAPTERS = new Set(['openai-responses', 'anthropic-messages']);

export function createStreamingSmokeTargets({ only } = {}) {
  const selected = only ? new Set(String(only).split(',').map((id) => id.trim())) : new Set(['openai', 'anthropic']);
  return getProviderSmokeTargets()
    .filter((target) => selected.has(target.id))
    .filter((target) => STREAMING_ADAPTERS.has(target.adapter))
    .map((target) => ({
      ...target,
      prompt: STREAMING_SMOKE_PROMPT,
      maxTokens: 16
    }));
}

export async function runStreamingSmokeTarget(
  target,
  {
    dryRun = false,
    resolveSecret,
    streamText = streamProviderText
  } = {}
) {
  const started = Date.now();
  if (dryRun) {
    return safeResult(target, {
      ok: true,
      dryRun: true,
      tokenCount: 0,
      preview: 'ready',
      latencyMs: 0
    });
  }

  const secret = await resolveSecret(target.secretReference);
  if (!secret.ok) {
    return safeResult(target, {
      ok: false,
      tokenCount: 0,
      preview: '',
      latencyMs: Date.now() - started,
      error: sanitizeSmokeOutput(secret.error ?? 'secret-resolution-failed')
    });
  }

  let tokenCount = 0;
  let preview = '';
  for await (const chunk of streamText({
    ...target,
    apiKey: secret.getSecret(),
    prompt: target.prompt,
    maxTokens: target.maxTokens
  })) {
    if (chunk.type === 'token') {
      tokenCount += 1;
      preview += chunk.text;
    }
    if (chunk.type === 'error') {
      return safeResult(target, {
        ok: false,
        tokenCount,
        preview: truncatePreview(preview),
        latencyMs: Date.now() - started,
        error: sanitizeSmokeOutput(chunk.error ?? 'provider-stream-failed')
      });
    }
  }

  return safeResult(target, {
    ok: tokenCount > 0,
    tokenCount,
    preview: truncatePreview(preview),
    latencyMs: Date.now() - started,
    error: tokenCount > 0 ? undefined : 'provider-stream-returned-no-tokens'
  });
}

function safeResult(target, result) {
  const output = {
    providerId: target.id,
    providerName: target.name ?? target.id,
    model: target.model,
    ...result
  };
  return JSON.parse(sanitizeSmokeOutput(JSON.stringify(output)));
}

function truncatePreview(value) {
  return String(value ?? '').replaceAll(/\s+/g, ' ').trim().slice(0, 120);
}

function sanitizeSmokeOutput(value) {
  return String(value ?? '')
    .replaceAll(/op:\/\/[^\s"]+/g, '[redacted-reference]')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{4,})\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]');
}
