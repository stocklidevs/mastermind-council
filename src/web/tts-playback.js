export const TTS_CHUNK_LIMIT = 3600;
export const STREAMING_TTS_MIN_CHARS = 180;
export const STREAMING_TTS_MAX_CHARS = 900;

export function createSpeechChunks(input, limit = TTS_CHUNK_LIMIT) {
  const text = String(input ?? '').replace(/\s+/g, ' ').trim();
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(200, Number(limit)) : TTS_CHUNK_LIMIT;
  if (!text) return [];
  if (text.length <= safeLimit) return [text];

  const chunks = [];
  let remaining = text;
  while (remaining.length > safeLimit) {
    const cutAt = findSpeechChunkBoundary(remaining, safeLimit);
    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function findSpeechChunkBoundary(text, limit) {
  const slice = text.slice(0, limit + 1);
  const punctuation = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('? '), slice.lastIndexOf('! '), slice.lastIndexOf('; '));
  if (punctuation >= limit * 0.55) return punctuation + 1;
  const comma = slice.lastIndexOf(', ');
  if (comma >= limit * 0.7) return comma + 1;
  const space = slice.lastIndexOf(' ');
  if (space >= limit * 0.45) return space;
  return limit;
}

export function createStreamingSpeechBuffer({
  minChars = STREAMING_TTS_MIN_CHARS,
  maxChars = STREAMING_TTS_MAX_CHARS
} = {}) {
  const safeMin = Math.max(40, Number(minChars) || STREAMING_TTS_MIN_CHARS);
  const safeMax = Math.max(safeMin + 40, Math.min(Number(maxChars) || STREAMING_TTS_MAX_CHARS, TTS_CHUNK_LIMIT));
  let buffer = '';

  return {
    append(value) {
      buffer = normalizeSpeechBuffer(`${buffer}${String(value ?? '')}`);
      return drainReadySegments();
    },
    flush() {
      const text = normalizeSpeechBuffer(buffer);
      buffer = '';
      return createSpeechChunks(text, safeMax);
    },
    pending() {
      return buffer;
    }
  };

  function drainReadySegments() {
    const segments = [];
    let boundary = findStreamingBoundary(buffer, safeMin, safeMax);
    while (boundary > 0) {
      segments.push(buffer.slice(0, boundary).trim());
      buffer = buffer.slice(boundary).trimStart();
      boundary = findStreamingBoundary(buffer, safeMin, safeMax);
    }
    return segments;
  }
}

function findStreamingBoundary(text, minChars, maxChars) {
  if (!text.trim()) return -1;
  const sentenceBoundary = findSentenceBoundary(text, minChars, maxChars);
  if (sentenceBoundary > 0) return sentenceBoundary;
  if (text.length < maxChars) return -1;
  return findSpeechChunkBoundary(text, maxChars);
}

function findSentenceBoundary(text, minChars, maxChars) {
  const limit = Math.min(text.length, maxChars + 1);
  const boundaryPattern = /[.!?](?:["')\]]+)?\s+/g;
  let match;
  let best = -1;
  while ((match = boundaryPattern.exec(text.slice(0, limit)))) {
    const boundary = match.index + match[0].length;
    if (boundary >= minChars) best = boundary;
  }
  return best;
}

function normalizeSpeechBuffer(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trimStart();
}
