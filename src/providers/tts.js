export const OPENAI_TTS_VOICES = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'nova',
  'onyx',
  'sage',
  'shimmer',
  'verse',
  'marin',
  'cedar'
];

export const DEFAULT_OPENAI_TTS_MODEL = 'gpt-4o-mini-tts';
export const DEFAULT_OPENAI_TTS_VOICE = 'marin';

export function validateOpenAiTtsInput({ input, voice = DEFAULT_OPENAI_TTS_VOICE }) {
  const safeInput = String(input ?? '').trim();
  if (!safeInput) {
    return { valid: false, error: 'tts-input-required' };
  }
  if (safeInput.length > 4096) {
    return { valid: false, error: 'tts-input-too-long' };
  }
  if (!OPENAI_TTS_VOICES.includes(voice)) {
    return { valid: false, error: 'unsupported-openai-tts-voice' };
  }
  return { valid: true, input: safeInput, voice };
}

export function buildOpenAiTtsInstructions({ mentorName = 'Mentor', mentorRole = 'Council mentor', voice = {} } = {}) {
  const safeName = safeSpeechText(mentorName) || 'Mentor';
  const safeRole = safeSpeechText(mentorRole) || 'Council mentor';
  const tone = safeSpeechText(voice.tone) || 'clear';
  const pace = safeSpeechText(voice.pace) || 'balanced';
  const label = safeSpeechText(voice.voiceLabel) || 'natural';
  return [
    `Speak as ${safeName}, the ${safeRole}, in the Mastermind council.`,
    `Use a ${label} presence with a ${tone} tone and ${pace} pacing.`,
    'Sound thoughtful, composed, and humanly listenable without adding words that are not in the input.'
  ].join(' ');
}

export function buildOpenAiSpeechRequest({
  apiKey,
  input,
  voice = DEFAULT_OPENAI_TTS_VOICE,
  model = DEFAULT_OPENAI_TTS_MODEL,
  instructions = '',
  speed = 1,
  responseFormat = 'mp3'
}) {
  const validation = validateOpenAiTtsInput({ input, voice });
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    url: 'https://api.openai.com/v1/audio/speech',
    options: {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        voice,
        input: validation.input,
        instructions: safeSpeechText(instructions).slice(0, 900),
        response_format: responseFormat,
        speed: clampSpeed(speed)
      })
    }
  };
}

function clampSpeed(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(4, Math.max(0.25, numeric));
}

function safeSpeechText(value) {
  return String(value ?? '')
    .replaceAll(/op:\/\/[^\s"]+|\bsk-[A-Za-z0-9_-]{4,}\b/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}
