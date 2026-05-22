import test from 'node:test';
import assert from 'node:assert/strict';

import { createSpeechChunks, TTS_CHUNK_LIMIT } from '../../src/web/tts-playback.js';

test('keeps short mentor speech as one TTS chunk', () => {
  assert.deepEqual(createSpeechChunks('A concise counsel answer.'), ['A concise counsel answer.']);
});

test('splits long mentor speech below the TTS request limit', () => {
  const input = 'This is a complete mentor sentence with enough substance to speak naturally. '.repeat(90);
  const chunks = createSpeechChunks(input);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= TTS_CHUNK_LIMIT));
  assert.equal(chunks.join(' ').replace(/\s+/g, ' '), input.trim().replace(/\s+/g, ' '));
});

test('splits very long unbroken mentor speech without dropping text', () => {
  const input = 'x'.repeat(TTS_CHUNK_LIMIT + 250);
  const chunks = createSpeechChunks(input);

  assert.equal(chunks.length, 2);
  assert.ok(chunks.every((chunk) => chunk.length <= TTS_CHUNK_LIMIT));
  assert.equal(chunks.join(''), input);
});
