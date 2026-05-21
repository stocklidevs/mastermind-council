import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGenerateRequest,
  generateProviderText
} from '../../src/providers/generate.js';

test('builds generate request from provider target', () => {
  const request = buildGenerateRequest({
    adapter: 'openai-compatible-chat',
    baseUrl: 'https://api.x.ai/v1',
    apiKey: 'secret',
    model: 'grok-3',
    prompt: 'Hello'
  });

  assert.equal(request.url, 'https://api.x.ai/v1/chat/completions');
  assert.equal(JSON.parse(request.options.body).messages[0].content, 'Hello');
  assert.equal(JSON.parse(request.options.body).max_tokens, 220);
});

test('generates normalized provider text without exposing api key', async () => {
  const result = await generateProviderText(
    {
      id: 'openai',
      name: 'OpenAI',
      adapter: 'openai-responses',
      apiKey: 'sk-secret-value',
      model: 'gpt-4.1',
      prompt: 'Hello'
    },
    {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ output_text: '{"utterance":"Hello there."}' })
      })
    }
  );

  assert.equal(result.ok, true);
  assert.equal(result.text, '{"utterance":"Hello there."}');
  assert.equal(JSON.stringify(result).includes('sk-secret-value'), false);
});

test('returns sanitized provider errors', async () => {
  const result = await generateProviderText(
    {
      id: 'openai',
      name: 'OpenAI',
      adapter: 'openai-responses',
      apiKey: 'sk-secret-value',
      model: 'gpt-4.1',
      prompt: 'Hello'
    },
    {
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'bad key sk-secret-value' } })
      })
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.equal(result.error.includes('sk-secret-value'), false);
});
