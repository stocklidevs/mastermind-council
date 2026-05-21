import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAnthropicSmokeRequest,
  buildOpenAiCompatibleSmokeRequest,
  buildOpenAiSmokeRequest,
  parseAnthropicSmokeResponse,
  parseOpenAiCompatibleSmokeResponse,
  parseOpenAiSmokeResponse,
  runProviderSmoke
} from '../../src/providers/smoke-adapters.js';

test('builds OpenAI Responses smoke request', () => {
  const request = buildOpenAiSmokeRequest({
    apiKey: 'secret',
    model: 'gpt-4.1',
    prompt: 'Reply with OK'
  });

  assert.equal(request.url, 'https://api.openai.com/v1/responses');
  assert.equal(request.options.headers.Authorization, 'Bearer secret');
  assert.equal(JSON.parse(request.options.body).input, 'Reply with OK');
});

test('builds Anthropic Messages smoke request', () => {
  const request = buildAnthropicSmokeRequest({
    apiKey: 'secret',
    model: 'claude-sonnet-4-20250514',
    prompt: 'Reply with OK'
  });

  assert.equal(request.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(request.options.headers['x-api-key'], 'secret');
  assert.equal(request.options.headers['anthropic-version'], '2023-06-01');
});

test('builds OpenAI-compatible chat smoke request', () => {
  const request = buildOpenAiCompatibleSmokeRequest({
    apiKey: 'secret',
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-3',
    prompt: 'Reply with OK'
  });

  assert.equal(request.url, 'https://api.x.ai/v1/chat/completions');
  assert.equal(JSON.parse(request.options.body).messages[0].content, 'Reply with OK');
});

test('parses provider smoke responses into previews', () => {
  assert.equal(parseOpenAiSmokeResponse({ output_text: 'OK from OpenAI' }), 'OK from OpenAI');
  assert.equal(parseAnthropicSmokeResponse({ content: [{ type: 'text', text: 'OK from Claude' }] }), 'OK from Claude');
  assert.equal(
    parseOpenAiCompatibleSmokeResponse({ choices: [{ message: { content: 'OK from compatible' } }] }),
    'OK from compatible'
  );
});

test('runs smoke request without exposing api key in result', async () => {
  const result = await runProviderSmoke(
    {
      id: 'openai',
      adapter: 'openai-responses',
      model: 'gpt-4.1',
      prompt: 'Reply with OK',
      apiKey: 'sk-secret-value'
    },
    {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ output_text: 'OK' })
      })
    }
  );

  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes('sk-secret-value'), false);
  assert.equal(result.preview, 'OK');
});
