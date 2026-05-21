export function buildStreamingProviderRequest(config) {
  if (config.adapter === 'openai-responses') return buildOpenAiStreamingRequest(config);
  if (config.adapter === 'anthropic-messages') return buildAnthropicStreamingRequest(config);
  if (config.adapter === 'openai-compatible-chat') return buildOpenAiCompatibleStreamingRequest(config);
  throw new Error('streaming-adapter-not-supported');
}

export function buildOpenAiStreamingRequest({ apiKey, model, prompt, maxTokens = 220 }) {
  return {
    url: 'https://api.openai.com/v1/responses',
    options: {
      method: 'POST',
      headers: jsonHeaders({ Authorization: `Bearer ${apiKey}` }),
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: maxTokens,
        stream: true
      })
    },
    parseEvent: parseOpenAiStreamEvent
  };
}

export function buildAnthropicStreamingRequest({ apiKey, model, prompt, maxTokens = 220 }) {
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
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })
    },
    parseEvent: parseAnthropicStreamEvent
  };
}

export function buildOpenAiCompatibleStreamingRequest({ apiKey, baseUrl, model, prompt, maxTokens = 220 }) {
  const root = String(baseUrl ?? '').replace(/\/+$/, '');
  return {
    url: `${root}/chat/completions`,
    options: {
      method: 'POST',
      headers: jsonHeaders({ Authorization: `Bearer ${apiKey}` }),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        stream: true
      })
    },
    parseEvent: parseOpenAiCompatibleChatStreamEvent
  };
}

export function parseOpenAiStreamEvent(event) {
  if (event?.type !== 'response.output_text.delta') return null;
  return typeof event.delta === 'string' ? event.delta : null;
}

export function parseAnthropicStreamEvent(event) {
  if (event?.type !== 'content_block_delta') return null;
  if (event.delta?.type !== 'text_delta') return null;
  return typeof event.delta.text === 'string' ? event.delta.text : null;
}

export function parseOpenAiCompatibleChatStreamEvent(event) {
  const text = event?.choices?.[0]?.delta?.content;
  return typeof text === 'string' ? text : null;
}

export async function* streamProviderText(config, { fetchImpl = fetch } = {}) {
  const request = buildStreamingProviderRequest(config);
  try {
    const response = await fetchImpl(request.url, request.options);
    if (!response.ok) {
      yield safeChunk(config, {
        type: 'error',
        status: response.status,
        error: sanitizeProviderError(await safeText(response))
      });
      return;
    }

    if (!response.body) {
      yield safeChunk(config, {
        type: 'error',
        status: response.status,
        error: 'provider-stream-missing-body'
      });
      return;
    }

    for await (const event of parseSseStream(response.body)) {
      const text = request.parseEvent(event);
      if (text) {
        yield safeChunk(config, {
          type: 'token',
          text,
          status: response.status
        });
      }
    }
  } catch (error) {
    yield safeChunk(config, {
      type: 'error',
      status: null,
      error: sanitizeProviderError(error.message)
    });
  }
}

export async function* parseSseStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const event = parseSseRecord(part);
      if (event) yield event;
    }
  }

  buffer += decoder.decode();
  const finalEvent = parseSseRecord(buffer);
  if (finalEvent) yield finalEvent;
}

function parseSseRecord(record) {
  const dataLines = String(record)
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());
  if (dataLines.length === 0) return null;
  const data = dataLines.join('\n');
  if (data === '[DONE]') return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function jsonHeaders(headers) {
  return {
    'Content-Type': 'application/json',
    ...headers
  };
}

function safeChunk(config, chunk) {
  return {
    providerId: config.id,
    providerName: config.name ?? config.id,
    model: config.model,
    ...chunk
  };
}

async function safeText(response) {
  try {
    return await response.text();
  } catch {
    return 'provider-stream-error';
  }
}

function sanitizeProviderError(value) {
  return String(value ?? '')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{4,})\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]')
    .slice(0, 240);
}
