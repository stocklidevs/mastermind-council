import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStreamingProviderRequest,
  parseAnthropicStreamEvent,
  parseOpenAiCompatibleChatStreamEvent,
  parseOpenAiStreamEvent,
  streamProviderText
} from '../../src/providers/streaming.js';

test('builds OpenAI streaming request', () => {
  const request = buildStreamingProviderRequest({
    id: 'openai',
    adapter: 'openai-responses',
    apiKey: 'sk-test-secret',
    model: 'gpt-4.1',
    prompt: 'Hello'
  });
  const body = JSON.parse(request.options.body);

  assert.equal(request.url, 'https://api.openai.com/v1/responses');
  assert.equal(body.stream, true);
  assert.equal(body.input, 'Hello');
  assert.equal(request.options.headers.Authorization, 'Bearer sk-test-secret');
});

test('builds Anthropic streaming request', () => {
  const request = buildStreamingProviderRequest({
    id: 'anthropic',
    adapter: 'anthropic-messages',
    apiKey: 'anthropic-secret',
    model: 'claude-sonnet-4-20250514',
    prompt: 'Hello'
  });
  const body = JSON.parse(request.options.body);

  assert.equal(request.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(body.stream, true);
  assert.deepEqual(body.messages, [{ role: 'user', content: 'Hello' }]);
  assert.equal(request.options.headers['x-api-key'], 'anthropic-secret');
});

test('builds OpenAI-compatible chat streaming request', () => {
  const request = buildStreamingProviderRequest({
    id: 'xai',
    adapter: 'openai-compatible-chat',
    baseUrl: 'https://api.x.ai/v1/',
    apiKey: 'xai-secret',
    model: 'grok-3',
    prompt: 'Hello'
  });
  const body = JSON.parse(request.options.body);

  assert.equal(request.url, 'https://api.x.ai/v1/chat/completions');
  assert.equal(body.stream, true);
  assert.deepEqual(body.messages, [{ role: 'user', content: 'Hello' }]);
  assert.equal(request.options.headers.Authorization, 'Bearer xai-secret');
});

test('parses OpenAI output text delta events', () => {
  assert.equal(
    parseOpenAiStreamEvent({ type: 'response.output_text.delta', delta: 'Hel' }),
    'Hel'
  );
  assert.equal(parseOpenAiStreamEvent({ type: 'response.completed' }), null);
});

test('parses Anthropic text delta events', () => {
  assert.equal(
    parseAnthropicStreamEvent({ type: 'content_block_delta', delta: { type: 'text_delta', text: 'lo' } }),
    'lo'
  );
  assert.equal(parseAnthropicStreamEvent({ type: 'message_stop' }), null);
});

test('parses OpenAI-compatible chat delta events', () => {
  assert.equal(
    parseOpenAiCompatibleChatStreamEvent({ choices: [{ delta: { content: 'Hel' } }] }),
    'Hel'
  );
  assert.equal(parseOpenAiCompatibleChatStreamEvent({ choices: [{ delta: {} }] }), null);
});

test('streams OpenAI mocked SSE tokens in order', async () => {
  const chunks = [];
  for await (const chunk of streamProviderText(
    {
      id: 'openai',
      adapter: 'openai-responses',
      apiKey: 'sk-test-secret',
      model: 'gpt-4.1',
      prompt: 'Hello'
    },
    {
      fetchImpl: async () => streamResponse([
        { type: 'response.output_text.delta', delta: 'Hel' },
        { type: 'response.output_text.delta', delta: 'lo' },
        { type: 'response.completed' }
      ])
    }
  )) {
    chunks.push(chunk);
  }

  assert.deepEqual(chunks.map((chunk) => chunk.text), ['Hel', 'lo']);
  assert.ok(chunks.every((chunk) => chunk.type === 'token'));
});

test('streams Anthropic mocked SSE tokens in order', async () => {
  const chunks = [];
  for await (const chunk of streamProviderText(
    {
      id: 'anthropic',
      adapter: 'anthropic-messages',
      apiKey: 'anthropic-secret',
      model: 'claude-sonnet-4-20250514',
      prompt: 'Hello'
    },
    {
      fetchImpl: async () => streamResponse([
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hel' } },
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'lo' } },
        { type: 'message_stop' }
      ])
    }
  )) {
    chunks.push(chunk);
  }

  assert.deepEqual(chunks.map((chunk) => chunk.text), ['Hel', 'lo']);
});

test('streams OpenAI-compatible chat mocked SSE tokens in order', async () => {
  const chunks = [];
  for await (const chunk of streamProviderText(
    {
      id: 'xai',
      adapter: 'openai-compatible-chat',
      baseUrl: 'https://api.x.ai/v1',
      apiKey: 'xai-secret',
      model: 'grok-3',
      prompt: 'Hello'
    },
    {
      fetchImpl: async () => streamResponse([
        { choices: [{ delta: { content: 'Hel' } }] },
        { choices: [{ delta: { content: 'lo' } }] },
        { choices: [{ finish_reason: 'stop', delta: {} }] }
      ])
    }
  )) {
    chunks.push(chunk);
  }

  assert.deepEqual(chunks.map((chunk) => chunk.text), ['Hel', 'lo']);
});

test('sanitizes streaming provider errors', async () => {
  const chunks = [];
  for await (const chunk of streamProviderText(
    {
      id: 'openai',
      adapter: 'openai-responses',
      apiKey: 'sk-test-secret',
      model: 'gpt-4.1',
      prompt: 'Hello'
    },
    {
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        text: async () => 'bad sk-test-secret token'
      })
    }
  )) {
    chunks.push(chunk);
  }

  assert.equal(chunks[0].type, 'error');
  assert.equal(chunks[0].error.includes('sk-test-secret'), false);
});

function streamResponse(events) {
  const body = events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('');
  return {
    ok: true,
    status: 200,
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body));
        controller.close();
      }
    })
  };
}
