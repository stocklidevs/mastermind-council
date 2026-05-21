const DEFAULT_PROMPT = 'Reply with exactly: OK';

export function buildOpenAiSmokeRequest({ apiKey, model, prompt = DEFAULT_PROMPT }) {
  return {
    url: 'https://api.openai.com/v1/responses',
    options: {
      method: 'POST',
      headers: jsonHeaders({ Authorization: `Bearer ${apiKey}` }),
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: 32
      })
    },
    parse: parseOpenAiSmokeResponse
  };
}

export function buildAnthropicSmokeRequest({ apiKey, model, prompt = DEFAULT_PROMPT }) {
  return {
    url: 'https://api.anthropic.com/v1/messages',
    options: {
      method: 'POST',
      headers: jsonHeaders({
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }),
      body: JSON.stringify({
        model,
        max_tokens: 32,
        messages: [{ role: 'user', content: prompt }]
      })
    },
    parse: parseAnthropicSmokeResponse
  };
}

export function buildOpenAiCompatibleSmokeRequest({ apiKey, baseUrl, model, prompt = DEFAULT_PROMPT }) {
  return {
    url: `${String(baseUrl).replace(/\/$/, '')}/chat/completions`,
    options: {
      method: 'POST',
      headers: jsonHeaders({ Authorization: `Bearer ${apiKey}` }),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 32
      })
    },
    parse: parseOpenAiCompatibleSmokeResponse
  };
}

export function parseOpenAiSmokeResponse(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  const text = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text');
  return text?.text ?? '';
}

export function parseAnthropicSmokeResponse(payload) {
  return payload.content?.find((item) => item.type === 'text')?.text ?? '';
}

export function parseOpenAiCompatibleSmokeResponse(payload) {
  return payload.choices?.[0]?.message?.content ?? '';
}

export async function runProviderSmoke(config, { fetchImpl = fetch } = {}) {
  const started = Date.now();
  const request = buildRequest(config);
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
      preview: truncatePreview(request.parse(payload)),
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

function buildRequest(config) {
  if (config.adapter === 'openai-responses') return buildOpenAiSmokeRequest(config);
  if (config.adapter === 'anthropic-messages') return buildAnthropicSmokeRequest(config);
  return buildOpenAiCompatibleSmokeRequest(config);
}

function jsonHeaders(headers) {
  return {
    'Content-Type': 'application/json',
    ...headers
  };
}

function safeResult(config, result) {
  return {
    providerId: config.id,
    providerName: config.name ?? config.id,
    model: config.model,
    ...result
  };
}

function truncatePreview(value) {
  return String(value ?? '').replaceAll(/\s+/g, ' ').trim().slice(0, 120);
}

function sanitizeProviderError(value) {
  return String(value ?? '')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]')
    .slice(0, 240);
}
