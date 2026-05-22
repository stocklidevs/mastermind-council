import { findOnePasswordCli, resolveOnePasswordReference } from '../secrets/one-password.js';
import {
  DEFAULT_OPENAI_TTS_MODEL,
  DEFAULT_OPENAI_TTS_VOICE,
  buildOpenAiSpeechRequest,
  buildOpenAiTtsInstructions,
  validateOpenAiTtsInput
} from '../providers/tts.js';

export async function handleOpenAiTtsRequest(
  body,
  {
    env = process.env,
    findCli = findOnePasswordCli,
    resolveReference = resolveOnePasswordReference,
    fetchImpl = fetch,
    logger = null
  } = {}
) {
  const input = String(body?.input ?? '').trim();
  const voice = String(body?.voice ?? DEFAULT_OPENAI_TTS_VOICE).trim();
  logger?.info('tts.request', {
    inputLength: input.length,
    voice,
    model: body?.model || DEFAULT_OPENAI_TTS_MODEL,
    secretMode: String(body?.secret?.mode ?? 'environment')
  });
  const validation = validateOpenAiTtsInput({ input, voice });
  if (!validation.valid) {
    logger?.warn('tts.rejected', { reason: validation.error });
    return jsonResult(400, { error: validation.error });
  }

  const secret = await resolveOpenAiSecret(body?.secret, { env, findCli, resolveReference });
  if (!secret.ok) {
    logger?.warn('tts.rejected', { reason: secret.error });
    return jsonResult(400, { error: secret.error });
  }

  const instructions =
    typeof body?.instructions === 'string' && body.instructions.trim()
      ? body.instructions
      : buildOpenAiTtsInstructions({
          mentorName: body?.mentorName,
          mentorRole: body?.mentorRole,
          voice: body?.mentorVoice
        });

  try {
    const request = buildOpenAiSpeechRequest({
      apiKey: secret.value,
      input: validation.input,
      voice: validation.voice,
      model: body?.model || DEFAULT_OPENAI_TTS_MODEL,
      instructions,
      speed: body?.speed ?? 1
    });
    const response = await fetchImpl(request.url, request.options);
    if (!response.ok) {
      logger?.warn('tts.provider_error', { status: response.status });
      return jsonResult(502, {
        error: 'openai-tts-request-failed',
        status: response.status,
        detail: sanitizeProviderError(await safeText(response))
      });
    }
    const audioBody = await response.arrayBuffer();
    logger?.info('tts.done', {
      bytes: audioBody.byteLength,
      contentType: response.headers.get('content-type') || 'audio/mpeg'
    });
    return {
      status: 200,
      headers: {
        'content-type': response.headers.get('content-type') || 'audio/mpeg',
        'cache-control': 'no-store'
      },
      body: audioBody
    };
  } catch (error) {
    logger?.error('tts.error', { reason: sanitizeProviderError(error.message) });
    return jsonResult(502, {
      error: 'openai-tts-request-failed',
      detail: sanitizeProviderError(error.message)
    });
  }
}

async function resolveOpenAiSecret(secret, { env, findCli, resolveReference }) {
  const mode = String(secret?.mode ?? 'environment');
  const reference = String(secret?.reference ?? 'OPENAI_API_KEY').trim() || 'OPENAI_API_KEY';

  if (mode === 'one-password') {
    const cli = await findCli();
    if (!cli.ok) return { ok: false, error: 'one-password-cli-unavailable' };
    const resolved = await resolveReference(reference, { opPath: cli.path, account: secret?.account });
    if (!resolved.ok) return { ok: false, error: 'openai-tts-secret-unavailable' };
    return { ok: true, value: resolved.getSecret() };
  }

  const value = env[reference];
  if (!value) return { ok: false, error: 'openai-tts-secret-unavailable' };
  return { ok: true, value };
}

function jsonResult(status, body) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body
  };
}

async function safeText(response) {
  try {
    return await response.text();
  } catch {
    return 'provider-error';
  }
}

function sanitizeProviderError(value) {
  return String(value ?? '')
    .replaceAll(/\bsk-[A-Za-z0-9_-]{4,}\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]')
    .slice(0, 240);
}
