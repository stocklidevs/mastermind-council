import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createSpeechChunks,
  createStreamingSpeechBuffer,
  STREAMING_TTS_MAX_CHARS,
  TTS_CHUNK_LIMIT
} from '../../src/web/tts-playback.js';

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

test('streams natural speech segments as sentences finish', () => {
  const buffer = createStreamingSpeechBuffer({ minChars: 24, maxChars: 120 });

  assert.deepEqual(buffer.append('First short sentence. '), []);
  assert.deepEqual(buffer.append('Second sentence completes the thought. Third begins'), [
    'First short sentence. Second sentence completes the thought.'
  ]);
  assert.deepEqual(buffer.flush(), ['Third begins']);
});

test('streams long speech segments before a sentence boundary gets too far away', () => {
  const buffer = createStreamingSpeechBuffer({ minChars: 24, maxChars: 80 });
  const input =
    'This mentor is speaking in a deliberately long clause with no punctuation and should still produce audio before the whole answer is done';
  const firstSegments = buffer.append(input);

  assert.equal(firstSegments.length, 1);
  assert.ok(firstSegments[0].length <= 80);
  assert.deepEqual([...firstSegments, ...buffer.flush()].join(' '), input);
});

test('uses conservative streaming TTS chunk sizes', () => {
  assert.ok(STREAMING_TTS_MAX_CHARS < TTS_CHUNK_LIMIT);
});
