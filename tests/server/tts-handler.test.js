import test from 'node:test';
import assert from 'node:assert/strict';

import { handleOpenAiTtsRequest } from '../../src/server/tts-handler.js';

test('generates OpenAI TTS audio from an environment secret without leaking it', async () => {
  const fetchCalls = [];
  const result = await handleOpenAiTtsRequest(
    {
      input: 'A short mentor answer.',
      voice: 'marin',
      mentorName: 'Athena',
      mentorRole: 'Strategist',
      secret: { mode: 'environment', reference: 'OPENAI_API_KEY' }
    },
    {
      env: { OPENAI_API_KEY: 'sk-live-secret' },
      fetchImpl: async (url, options) => {
        fetchCalls.push({ url, options });
        return new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' }
        });
      }
    }
  );

  assert.equal(result.status, 200);
  assert.equal(result.headers['content-type'], 'audio/mpeg');
  assert.deepEqual([...new Uint8Array(result.body)], [1, 2, 3]);
  assert.equal(fetchCalls[0].options.headers.Authorization, 'Bearer sk-live-secret');
  assert.equal(fetchCalls[0].options.body.includes('sk-live-secret'), false);
  assert.match(JSON.parse(fetchCalls[0].options.body).instructions, /Athena/);
});

test('generates OpenAI TTS audio from a 1Password reference', async () => {
  const result = await handleOpenAiTtsRequest(
    {
      input: 'The council speaks.',
      voice: 'cedar',
      secret: {
        mode: 'one-password',
        reference: 'op://Team Vault/OpenAI API Key/credential',
        account: 'example.1password.com'
      }
    },
    {
      findCli: async () => ({ ok: true, path: 'op' }),
      resolveReference: async (reference, options) => {
        assert.equal(options.account, 'example.1password.com');
        return { ok: true, getSecret: () => 'sk-op-secret' };
      },
      fetchImpl: async () =>
        new Response(new Uint8Array([4, 5]), {
          status: 200,
          headers: { 'content-type': 'audio/mpeg' }
        })
    }
  );

  assert.equal(result.status, 200);
  assert.deepEqual([...new Uint8Array(result.body)], [4, 5]);
});

test('returns sanitized errors when OpenAI rejects the speech request', async () => {
  const result = await handleOpenAiTtsRequest(
    {
      input: 'A short mentor answer.',
      voice: 'marin',
      secret: { mode: 'environment', reference: 'OPENAI_API_KEY' }
    },
    {
      env: { OPENAI_API_KEY: 'sk-live-secret' },
      fetchImpl: async () =>
        new Response('bad key sk-live-secret', {
          status: 401,
          headers: { 'content-type': 'text/plain' }
        })
    }
  );

  assert.equal(result.status, 502);
  assert.equal(result.body.error, 'openai-tts-request-failed');
  assert.equal(JSON.stringify(result.body).includes('sk-live-secret'), false);
});
