import {
  buildAnthropicSmokeRequest,
  buildOpenAiCompatibleSmokeRequest,
  buildOpenAiSmokeRequest
} from './smoke-adapters.js';

export function buildGenerateRequest(config) {
  const request =
    config.adapter === 'openai-responses'
      ? buildOpenAiSmokeRequest(config)
      : config.adapter === 'anthropic-messages'
        ? buildAnthropicSmokeRequest(config)
        : buildOpenAiCompatibleSmokeRequest(config);
  const body = JSON.parse(request.options.body);
  if (config.adapter === 'openai-responses') {
    body.max_output_tokens = config.maxTokens ?? 220;
  } else {
    body.max_tokens = config.maxTokens ?? 220;
  }
  return {
    ...request,
    options: {
      ...request.options,
      body: JSON.stringify(body)
    }
  };
}

export async function generateProviderText(config, { fetchImpl = fetch } = {}) {
  const started = Date.now();
  const request = buildGenerateRequest(config);
  try {
    const response = await fetchImpl(request.url, request.options);
    const payload = await response.json();
    if (!response.ok) {
      return safeResult(config, {
        ok: false,
        status: response.status,
        error: sanitizeProviderError(payload?.error?.message ?? JSON.stringify(payload)),
        latencyMs: Date.now() - started
      });
    }

    return safeResult(config, {
      ok: true,
      status: response.status,
      text: request.parse(payload),
      latencyMs: Date.now() - started
    });
  } catch (error) {
    return safeResult(config, {
      ok: false,
      status: null,
      error: sanitizeProviderError(error.message),
      latencyMs: Date.now() - started
    });
  }
}

function safeResult(config, result) {
  return {
    providerId: config.id,
    providerName: config.name ?? config.id,
    model: config.model,
    ...result
  };
}

function sanitizeProviderError(value) {
  return String(value ?? '')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]')
    .slice(0, 240);
}
