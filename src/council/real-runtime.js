import { buildMentorPrompt, parseMentorContribution } from './real-prompt.js';
import { synthesizeSession } from './synthesis.js';
import { getProviderSmokeTargets } from '../providers/smoke-config.js';
import { generateProviderText } from '../providers/generate.js';

let realSessionCounter = 0;

export async function runRealCouncilRound({
  question,
  mentors,
  resolveSecret,
  generateText = generateProviderText,
  providerTargets = getProviderSmokeTargets(),
  logger = null
}) {
  assertQuestion(question);
  const session = createSession(question, mentors);
  const round = openRound(session, 1);
  const priorContributions = [];

  for (const mentor of mentors) {
    logger?.info('provider.start', {
      sessionId: session.id,
      roundNumber: round.number,
      mentorId: mentor.id,
      mentorName: mentor.name,
      providerId: mentor.providerId,
      modelId: mentor.modelId
    });
    const grant = recordEvent(session, {
      type: 'stick.granted',
      roundNumber: round.number,
      memberId: mentor.id
    });
    const target = providerTargets.find((item) => item.id === mentor.providerId);
    if (!target) {
      logger?.warn('provider.error', {
        sessionId: session.id,
        mentorId: mentor.id,
        providerId: mentor.providerId,
        reason: 'provider-target-not-configured'
      });
      recordProviderError(session, round, mentor, 'provider-target-not-configured');
      continue;
    }

    const secret = await resolveSecret(target.secretReference);
    if (!secret.ok) {
      logger?.warn('provider.error', {
        sessionId: session.id,
        mentorId: mentor.id,
        providerId: mentor.providerId,
        reason: secret.error ?? 'secret-resolution-failed'
      });
      recordProviderError(session, round, mentor, secret.error ?? 'secret-resolution-failed');
      continue;
    }

    const prompt = buildMentorPrompt({ mentor, question, priorContributions });
    const result = await generateText({
      ...target,
      mentor,
      apiKey: secret.getSecret(),
      model: target.model,
      prompt
    });

    if (!result.ok) {
      logger?.warn('provider.error', {
        sessionId: session.id,
        mentorId: mentor.id,
        providerId: mentor.providerId,
        status: result.status,
        latencyMs: result.latencyMs,
        reason: result.error ?? 'provider-call-failed'
      });
      recordProviderError(session, round, mentor, result.error ?? 'provider-call-failed');
      continue;
    }

    const contribution = parseMentorContribution(result.text);
    const accepted = acceptContribution(session, round, mentor, grant, contribution, result);
    logger?.info('provider.done', {
      sessionId: session.id,
      mentorId: mentor.id,
      mentorName: mentor.name,
      providerId: result.providerId,
      modelId: result.model,
      latencyMs: result.latencyMs,
      utteranceLength: accepted.utterance.length
    });
    priorContributions.push({
      speakerName: mentor.name,
      utterance: accepted.utterance
    });
  }

  round.status = 'closed';
  recordEvent(session, {
    type: 'round.closed',
    roundNumber: round.number
  });
  session.synthesis = synthesizeSession(session, 'real-provider-round');
  session.status = 'closed';
  recordEvent(session, {
    type: 'session.synthesized',
    synthesis: session.synthesis
  });
  return session;
}

function createSession(question, mentors) {
  return {
    id: `real-session-${++realSessionCounter}`,
    status: 'running',
    question,
    members: mentors,
    options: { maxRounds: 1, runtime: 'real-provider-cli' },
    rounds: [],
    events: [
      {
        id: 'event-1',
        sequence: 1,
        sessionId: `real-session-${realSessionCounter}`,
        type: 'session.started',
        question
      }
    ],
    synthesis: null
  };
}

function openRound(session, roundNumber) {
  const round = {
    number: roundNumber,
    spokenMemberIds: [],
    abstainedMemberIds: [],
    contributions: [],
    status: 'open'
  };
  session.rounds.push(round);
  recordEvent(session, { type: 'round.started', roundNumber });
  return round;
}

function acceptContribution(session, round, mentor, grant, contribution, result) {
  const order = session.rounds.reduce((count, item) => count + item.contributions.length, 0) + 1;
  const accepted = {
    speakerId: mentor.id,
    roundNumber: round.number,
    order,
    grantEventId: grant.id,
    action: contribution.action,
    utterance: contribution.utterance,
    stance: contribution.stance,
    wantsAnotherRound: contribution.wantsAnotherRound,
    providerId: result.providerId,
    modelId: result.model,
    latencyMs: result.latencyMs
  };
  round.spokenMemberIds.push(mentor.id);
  round.contributions.push(accepted);
  recordEvent(session, {
    type: 'contribution.accepted',
    ...accepted
  });
  return accepted;
}

function recordProviderError(session, round, mentor, reason) {
  return recordEvent(session, {
    type: 'provider.error',
    roundNumber: round.number,
    memberId: mentor.id,
    providerId: mentor.providerId,
    modelId: mentor.modelId,
    reason: sanitizeEventText(reason)
  });
}

function recordEvent(session, event) {
  const sequence = session.events.length + 1;
  const recorded = {
    id: `event-${sequence}`,
    sequence,
    sessionId: session.id,
    ...event
  };
  session.events.push(recorded);
  return recorded;
}

function assertQuestion(question) {
  if (typeof question !== 'string' || question.trim() === '') throw new Error('question-required');
}

function sanitizeEventText(value) {
  return String(value ?? '')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]')
    .slice(0, 240);
}
