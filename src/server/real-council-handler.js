import { createRealMentors } from '../council/real-mentors.js';
import { runRealCouncilRound } from '../council/real-runtime.js';
import { findOnePasswordCli, resolveOnePasswordReference } from '../secrets/one-password.js';
import { getProviderSmokeTargets } from '../providers/smoke-config.js';

export async function handleRealCouncilRequest(
  body,
  {
    findCli = findOnePasswordCli,
    resolveReference = resolveOnePasswordReference,
    providerTargets = getProviderSmokeTargets(),
    logger = silentLogger
  } = {}
) {
  const question = String(body?.question ?? '').trim();
  if (!question) {
    logger.warn('real_council.rejected', { reason: 'question-required' });
    return json(400, { error: 'question-required' });
  }

  const dryRun = body?.dryRun === true;
  logger.info('real_council.request', {
    dryRun,
    questionLength: question.length,
    providerCount: providerTargets.length
  });
  const cli = dryRun ? { ok: true, path: 'dry-run' } : await findCli();
  if (!cli.ok) {
    logger.error('real_council.rejected', { reason: 'one-password-cli-unavailable' });
    return json(503, { error: 'one-password-cli-unavailable' });
  }

  const session = await runRealCouncilRound({
    question,
    mentors: createRealMentors(providerTargets),
    providerTargets,
    resolveSecret: async (reference) => {
      if (dryRun) return { ok: true, getSecret: () => 'dry-run-secret' };
      return resolveReference(reference, { opPath: cli.path });
    },
    generateText: dryRun ? dryRunGenerateText : undefined,
    logger
  });

  logger.info('real_council.done', {
    sessionId: session.id,
    contributions: session.rounds.reduce((sum, round) => sum + round.contributions.length, 0),
    errors: session.events.filter((event) => event.type === 'provider.error').length
  });
  return json(200, { session: sanitizeSession(session) });
}

async function dryRunGenerateText({ mentor }) {
  return {
    ok: true,
    providerId: mentor.providerId,
    model: mentor.modelId,
    latencyMs: 0,
    text: JSON.stringify({
      action: `${mentor.name} studies the question`,
      utterance: `${mentor.name} would contribute a ${mentor.role.toLowerCase()} perspective.`,
      stance: mentor.role.toLowerCase(),
      wantsAnotherRound: false
    })
  };
}

function sanitizeSession(session) {
  return JSON.parse(
    JSON.stringify(session)
      .replaceAll(/op:\/\/[^"]+/g, '[redacted-reference]')
      .replaceAll(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]')
      .replaceAll(/\bdry-run-secret\b/g, '[redacted-secret]')
  );
}

function json(status, body) {
  return { status, body };
}

const silentLogger = {
  info() {},
  warn() {},
  error() {}
};
