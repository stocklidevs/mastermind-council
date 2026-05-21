import { createLiveCouncilEvents, streamLiveCouncilEvents } from '../council/live-runtime.js';
import { createRealMentors } from '../council/real-mentors.js';
import { streamRealLiveCouncilEvents } from '../council/real-live-runtime.js';
import { createDefaultMentors } from '../config/mentor-config.js';
import { getProviderSmokeTargets } from '../providers/smoke-config.js';
import { findOnePasswordCli, resolveOnePasswordReference } from '../secrets/one-password.js';

export function formatSseEvent(event) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function handleLiveCouncilRequest(
  url,
  {
    members = createDefaultMentors().map(createLiveMentorFromConfig),
    providerTargets = getProviderSmokeTargets(),
    findCli = findOnePasswordCli,
    resolveReference = resolveOnePasswordReference,
    streamText,
    start = null,
    write,
    end,
    logger = null,
    delayMs = 35
  } = {}
) {
  const question = String(url.searchParams.get('question') ?? '').trim();
  if (!question) {
    return {
      status: 400,
      body: { error: 'question-required' }
    };
  }

  const mode = url.searchParams.get('mode') ?? 'mock';
  if (!['mock', 'real'].includes(mode)) {
    return {
      status: 400,
      body: { error: 'unsupported-live-mode' }
    };
  }

  const maxTurns = Math.max(1, Math.min(Number.parseInt(url.searchParams.get('maxTurns') ?? '3', 10) || 3, 5));
  const preambleEnabled = parseBooleanSetting(url.searchParams.get('preambleEnabled'), true);
  const clarificationAnswer = String(url.searchParams.get('clarificationAnswer') ?? '').trim();
  const synthesisProviderId = safeText(url.searchParams.get('synthesisProviderId') ?? 'openai') || 'openai';
  const synthesisModelId = safeText(url.searchParams.get('synthesisModelId') ?? '');
  const headers = {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive'
  };

  logger?.info('live_council.request', {
    mode,
    questionLength: question.length,
    maxTurns,
    preambleEnabled,
    memberCount: members.length
  });

  const requestedMembers = parseMembersParam(url.searchParams.get('members')) ?? members;
  start?.(200, headers);
  const eventStream =
    mode === 'real'
      ? streamRealModeEvents({
          question,
          members: requestedMembers,
          providerTargets,
          findCli,
          resolveReference,
          streamText,
          preambleEnabled,
          clarificationAnswer,
          maxTurns,
          synthesisProviderId,
          synthesisModelId
        })
      : streamLiveCouncilEvents({ question, members: requestedMembers, maxTurns, preambleEnabled, delayMs });

  for await (const event of eventStream) {
    logger?.info('live_council.event', {
      type: event.type,
      sessionId: event.sessionId,
      sequence: event.sequence,
      turnNumber: event.turnNumber,
      mentorId: event.mentorId
    });
    write(formatSseEvent(event));
  }
  end();

  return { status: 200, headers };
}

async function* streamRealModeEvents({
  question,
  members,
  providerTargets,
  findCli,
  resolveReference,
  streamText,
  preambleEnabled = true,
  clarificationAnswer = '',
  maxTurns = 3,
  synthesisProviderId = 'openai',
  synthesisModelId = ''
}) {
  const cli = await findCli();
  if (!cli.ok) {
    yield {
      type: 'session.error',
      sessionId: 'real-live-session-error',
      sequence: 1,
      payload: { reason: 'one-password-cli-unavailable' }
    };
    return;
  }

  const realMentors = members?.some((mentor) => mentor.providerId) ? members : createRealMentors(providerTargets);
  yield* streamRealLiveCouncilEvents({
    question,
    mentors: realMentors,
    providerTargets,
    resolveSecret: (reference) => resolveReference(reference, { opPath: cli.path }),
    streamText,
    preambleEnabled,
    clarificationAnswer,
    maxTurns,
    synthesisProviderId,
    synthesisModelId
  });
}

export function previewLiveCouncilEvents({ question, members, maxTurns = 3, preambleEnabled = true }) {
  return createLiveCouncilEvents({ question, members, maxTurns, preambleEnabled });
}

function parseBooleanSetting(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  return !['0', 'false', 'off', 'no'].includes(String(value).toLowerCase());
}

function parseMembersParam(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((mentor) => ({
      id: safeText(mentor.id),
      name: safeText(mentor.name),
      role: safeText(mentor.role),
      providerId: safeText(mentor.providerId),
      modelId: safeText(mentor.modelId),
      personality: safeText(mentor.personality),
      speakingStyle: safeText(mentor.speakingStyle),
      participationBehavior: safeText(mentor.participationBehavior),
      personaMode: safeText(mentor.personaMode),
      identity: typeof mentor.identity === 'object' && mentor.identity ? mentor.identity : undefined,
      voice: typeof mentor.voice === 'object' && mentor.voice ? mentor.voice : undefined
    }));
  } catch {
    return null;
  }
}

function safeText(value) {
  return String(value ?? '').replaceAll(/op:\/\/[^\s"]+|\bsk-[A-Za-z0-9_-]{4,}\b/g, '').trim();
}

function createLiveMentorFromConfig(mentor) {
  return {
    ...mentor,
    behavior: {
      utterances: [
        `I will examine this as ${mentor.role}, keeping ${mentor.personality} in view while the council gathers its shape.`
      ],
      preActions: [`${mentor.name} inclines toward the gold speaking stick.`],
      postActions: [`${mentor.name} releases the stick with measured calm.`],
      clarificationQuestions:
        mentor.id === 'socrates' ? ['What constraint, fear, or desired outcome should the council account for?'] : []
    }
  };
}
