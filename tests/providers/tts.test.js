import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OPENAI_TTS_VOICES,
  buildOpenAiSpeechRequest,
  buildOpenAiTtsInstructions,
  validateOpenAiTtsInput
} from '../../src/providers/tts.js';

test('builds an OpenAI speech request without exposing the key in the body', () => {
  const request = buildOpenAiSpeechRequest({
    apiKey: 'sk-test-secret',
    input: 'Speak this counsel aloud.',
    voice: 'cedar',
    instructions: 'Speak with calm gravity.',
    speed: 1.15
  });

  assert.equal(request.url, 'https://api.openai.com/v1/audio/speech');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer sk-test-secret');

  const body = JSON.parse(request.options.body);
  assert.equal(body.model, 'gpt-4o-mini-tts');
  assert.equal(body.voice, 'cedar');
  assert.equal(body.input, 'Speak this counsel aloud.');
  assert.equal(body.instructions, 'Speak with calm gravity.');
  assert.equal(body.response_format, 'mp3');
  assert.equal(body.speed, 1.15);
  assert.equal(request.options.body.includes('sk-test-secret'), false);
});

test('validates OpenAI voice and input limits', () => {
  assert.ok(OPENAI_TTS_VOICES.includes('marin'));
  assert.deepEqual(validateOpenAiTtsInput({ input: '  ', voice: 'marin' }), {
    valid: false,
    error: 'tts-input-required'
  });
  assert.deepEqual(validateOpenAiTtsInput({ input: 'Hello', voice: 'unknown' }), {
    valid: false,
    error: 'unsupported-openai-tts-voice'
  });
  assert.equal(validateOpenAiTtsInput({ input: 'Hello', voice: 'marin' }).valid, true);
});

test('builds mentor-aware speech instructions from voice metadata', () => {
  const instructions = buildOpenAiTtsInstructions({
    mentorName: 'Athena',
    mentorRole: 'Strategist',
    voice: {
      tone: 'analytical',
      pace: 'balanced',
      voiceLabel: 'calm alto'
    }
  });

  assert.match(instructions, /Athena/);
  assert.match(instructions, /Strategist/);
  assert.match(instructions, /analytical/);
  assert.match(instructions, /calm alto/);
  assert.doesNotMatch(instructions, /op:\/\//);
});
