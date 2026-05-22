export const TTS_CHUNK_LIMIT = 3600;

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
