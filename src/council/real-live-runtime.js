import { streamProviderText } from '../providers/streaming.js';
import {
  buildLiveActionPrompt,
  buildLiveMentorPrompt,
  buildParticipationPrompt,
  buildPreamblePrompt,
  buildSynthesisPrompt,
  parseLiveAction,
  parseParticipationDecision,
  parsePreambleQuestion,
  parseSynthesisResult
} from './real-prompt.js';

let realLiveSessionCounter = 0;
const STREAMING_ADAPTERS = new Set(['openai-responses', 'anthropic-messages', 'openai-compatible-chat']);

export async function* streamRealLiveCouncilEvents({
  question,
  mentors,
  providerTargets,
  resolveSecret,
  streamText = streamProviderText,
  sessionId = `real-live-session-${++realLiveSessionCounter}`,
  preambleEnabled = true,
  clarificationAnswer = '',
  clarificationQuestions = [],
  nextTurnNumber = 1,
  maxTurns = 3,
  synthesisProviderId = 'openai',
  synthesisModelId = ''
}) {
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('question-required');
  }

  let sequence = 0;
  const emit = (type, fields = {}) => ({
    type,
    sessionId,
    sequence: ++sequence,
    ...fields
  });

  yield emit('session.started', {
    payload: { questionLength: question.trim().length, mode: 'real' }
  });

  const cleanClarificationAnswer = String(clarificationAnswer ?? '').trim();
  const isClarificationResume = Boolean(cleanClarificationAnswer);

  if (isClarificationResume) {
    yield emit('clarification.answered', {
      turnNumber: Math.max(0, nextTurnNumber - 1),
      payload: {
        answer: cleanClarificationAnswer,
        questionCount: clarificationQuestions.length
      }
    });
  }

  if (preambleEnabled && !isClarificationResume) {
    const preambleQuestions = [];
    for (const mentor of mentors) {
      const target = providerTargets.find((item) => item.id === mentor.providerId);
      if (!target || !STREAMING_ADAPTERS.has(target.adapter)) continue;

      const secret = await resolveSecret(target.secretReference);
      if (!secret.ok) {
        yield emit('mentor.error', {
          turnNumber: 0,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            reason: sanitizeReason(secret.error ?? 'secret-resolution-failed')
          }
        });
        continue;
      }

      const output = await collectStreamText(
        streamText({
          ...target,
          apiKey: secret.getSecret(),
          model: mentor.modelId,
          prompt: buildPreamblePrompt({ mentor, question }),
          mentor
        })
      );
      const parsed = parsePreambleQuestion(output.text);
      if (output.error) {
        yield emit('mentor.error', {
          turnNumber: 0,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            reason: sanitizeReason(output.error)
          }
        });
      }
      if (parsed.needsClarification) {
        preambleQuestions.push({
          mentorId: mentor.id,
          mentorName: mentor.name,
          question: parsed.clarifyingQuestion
        });
      }
    }

    if (preambleQuestions.length > 0) {
      yield emit('preamble.started', {
        turnNumber: 0,
        payload: { phase: 'preamble' }
      });
      for (const item of preambleQuestions) {
        yield emit('mentor.question', {
          turnNumber: 0,
          mentorId: item.mentorId,
          payload: {
            mentorName: item.mentorName,
            question: item.question,
            phase: 'preamble'
          }
        });
      }
      yield emit('preamble.awaiting_clarification', {
        turnNumber: 0,
        payload: { phase: 'preamble', questions: preambleQuestions }
      });
      yield emit('session.awaiting_clarification', {
        turnNumber: 0,
        payload: { closureReason: 'preamble-clarification', phase: 'preamble' }
      });
      return;
    }
  }

  const firstTurnNumber = isClarificationResume ? nextTurnNumber : 1;
  const effectiveQuestion = isClarificationResume
    ? `${question}\n\nUser clarification: ${cleanClarificationAnswer}`
    : question;
  const maxTurnCount = Math.max(1, Math.min(Number.parseInt(maxTurns, 10) || 3, 5));
  const priorContributions = [];
  const infrastructureIssues = [];
  let closureReason = isClarificationResume ? 'clarification-incorporated' : 'no-further-interest';

  for (let offset = 0; offset < maxTurnCount; offset += 1) {
    const turnNumber = firstTurnNumber + offset;
    yield emit('turn.started', {
      turnNumber,
      payload: { turnNumber, resumedFromClarification: isClarificationResume && offset === 0 }
    });

    const interestedMentors = [];
    for (const mentor of mentors) {
      const decision = await collectParticipationDecision({
        mentor,
        question: effectiveQuestion,
        turnNumber,
        transcript: priorContributions,
        providerTargets,
        resolveSecret,
        streamText,
        infrastructureIssues
      });

      if (decision.wantsToSpeak) {
        interestedMentors.push(mentor);
        yield emit('mentor.interested', {
          turnNumber,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            intent: decision.intent,
            reason: decision.reason
          }
        });
      } else {
        yield emit('mentor.abstained', {
          turnNumber,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            reason: decision.reason
          }
        });
      }
    }

    if (interestedMentors.length === 0) {
      closureReason = 'no-further-interest';
      yield emit('turn.closed', {
        turnNumber,
        payload: { turnNumber, reason: closureReason }
      });
      break;
    }

    for (const mentor of interestedMentors) {
      yield* streamMentorSpeech({
        emit,
        mentor,
        question: effectiveQuestion,
        turnNumber,
        priorContributions,
        infrastructureIssues,
        providerTargets,
        resolveSecret,
        streamText
      });
    }

    yield emit('turn.closed', {
      turnNumber,
      payload: { turnNumber, resumedFromClarification: isClarificationResume && offset === 0 }
    });

    if (offset === maxTurnCount - 1) {
      closureReason = 'max-turns';
    }
  }

  const fallback = buildFallbackLiveSynthesis(priorContributions, infrastructureIssues, isClarificationResume, closureReason);
  const synthesis = await synthesizeWithConfiguredModel({
    question: effectiveQuestion,
    contributions: priorContributions,
    infrastructureIssues,
    providerTargets,
    resolveSecret,
    streamText,
    synthesisProviderId,
    synthesisModelId,
    fallback
  });

  yield emit('session.synthesized', {
    payload: synthesis
  });
}

async function* streamMentorSpeech({
  emit,
  mentor,
  question,
  turnNumber,
  priorContributions,
  infrastructureIssues,
  providerTargets,
  resolveSecret,
  streamText
}) {
  const target = providerTargets.find((item) => item.id === mentor.providerId);
  yield emit('mentor.thinking', {
    turnNumber,
    mentorId: mentor.id,
    payload: publicMentorPayload(mentor)
  });

  if (!target || !STREAMING_ADAPTERS.has(target.adapter)) {
    const reason = !target ? 'streaming-provider-target-missing' : 'streaming-provider-not-supported';
    infrastructureIssues.push(`${mentor.name}: ${reason}`);
    yield emit('mentor.error', {
      turnNumber,
      mentorId: mentor.id,
      payload: {
        ...publicMentorPayload(mentor),
        reason
      }
    });
    return;
  }

  const secret = await resolveSecret(target.secretReference);
  if (!secret.ok) {
    infrastructureIssues.push(`${mentor.name}: secret-resolution-failed`);
    yield emit('mentor.error', {
      turnNumber,
      mentorId: mentor.id,
      payload: {
        ...publicMentorPayload(mentor),
        reason: sanitizeReason(secret.error ?? 'secret-resolution-failed')
      }
    });
    return;
  }

  yield emit('stick.granted', {
    turnNumber,
    mentorId: mentor.id,
    payload: publicMentorPayload(mentor)
  });

  const preAction = await collectLiveAction({
    target,
    secret,
    mentor,
    question,
    turnNumber,
    priorContributions,
    streamText,
    phase: 'pre'
  });

  yield emit('mentor.pre_action', {
    turnNumber,
    mentorId: mentor.id,
    payload: {
      ...publicMentorPayload(mentor),
      action: preAction
    }
  });

  const prompt = `${buildLiveMentorPrompt({ mentor, question, priorContributions })}\n\nTurn number: ${turnNumber}`;
  let utterance = '';
  let hadStreamError = false;
  for await (const chunk of streamText({
    ...target,
    apiKey: secret.getSecret(),
    model: mentor.modelId,
    maxTokens: 1600,
    prompt,
    mentor
  })) {
    if (chunk.type === 'token') {
      utterance += chunk.text;
      yield emit('mentor.token', {
        turnNumber,
        mentorId: mentor.id,
        payload: {
          ...publicMentorPayload(mentor),
          token: chunk.text
        }
      });
    } else if (chunk.type === 'error') {
      hadStreamError = true;
      infrastructureIssues.push(`${mentor.name}: ${sanitizeReason(chunk.error ?? 'provider-stream-failed')}`);
      yield emit('mentor.error', {
        turnNumber,
        mentorId: mentor.id,
        payload: {
          ...publicMentorPayload(mentor),
          reason: sanitizeReason(chunk.error ?? 'provider-stream-failed')
        }
      });
    }
  }

  if (utterance.trim()) {
    priorContributions.push({ turnNumber, speakerName: mentor.name, utterance: utterance.trim() });
    const postAction = await collectLiveAction({
      target,
      secret,
      mentor,
      question,
      turnNumber,
      priorContributions,
      utterance,
      streamText,
      phase: 'post'
    });
    yield emit('mentor.post_action', {
      turnNumber,
      mentorId: mentor.id,
      payload: {
        ...publicMentorPayload(mentor),
        action: postAction
      }
    });
    yield emit('mentor.done', {
      turnNumber,
      mentorId: mentor.id,
      payload: publicMentorPayload(mentor)
    });
  } else if (!hadStreamError) {
    const reason = 'provider-stream-empty-output';
    infrastructureIssues.push(`${mentor.name}: ${reason}`);
    yield emit('mentor.error', {
      turnNumber,
      mentorId: mentor.id,
      payload: {
        ...publicMentorPayload(mentor),
        reason
      }
    });
  }
}

async function collectLiveAction({
  target,
  secret,
  mentor,
  question,
  turnNumber,
  priorContributions,
  utterance = '',
  streamText,
  phase
}) {
  const fallback = defaultLiveAction(mentor, phase);
  const output = await collectStreamText(
    streamText({
      ...target,
      apiKey: secret.getSecret(),
      model: mentor.modelId,
      maxTokens: 120,
      prompt: `${buildLiveActionPrompt({ mentor, question, phase, priorContributions, utterance })}\n\nTurn number: ${turnNumber}`,
      mentor
    })
  );
  if (output.error || !output.text.trim()) return fallback;
  return parseLiveAction(output.text, fallback);
}

function defaultLiveAction(mentor, phase) {
  return phase === 'post'
    ? `${mentor.name} returns the speaking stick to the table.`
    : `${mentor.name} takes the gold speaking stick and gathers their counsel.`;
}

async function collectParticipationDecision({
  mentor,
  question,
  turnNumber,
  transcript,
  providerTargets,
  resolveSecret,
  streamText,
  infrastructureIssues
}) {
  const target = providerTargets.find((item) => item.id === mentor.providerId);
  if (!target || !STREAMING_ADAPTERS.has(target.adapter)) {
    return { wantsToSpeak: true, intent: 'contribute', reason: 'Provider will be checked during speaking turn.' };
  }

  const secret = await resolveSecret(target.secretReference);
  if (!secret.ok) {
    infrastructureIssues.push(`${mentor.name}: participation-secret-resolution-failed`);
    return { wantsToSpeak: true, intent: 'contribute', reason: 'Secret resolution will be checked during speaking turn.' };
  }

  const output = await collectStreamText(
    streamText({
      ...target,
      apiKey: secret.getSecret(),
      model: mentor.modelId,
      prompt: buildParticipationPrompt({ mentor, question, turnNumber, transcript }),
      mentor
    })
  );
  if (output.error) {
    infrastructureIssues.push(`${mentor.name}: ${sanitizeReason(output.error)}`);
    return { wantsToSpeak: true, intent: 'contribute', reason: 'Participation check failed; preserving opportunity to speak.' };
  }
  if (!String(output.text ?? '').trim().startsWith('{') && transcript.length > 0) {
    return { wantsToSpeak: false, intent: 'abstain', reason: 'No explicit interest after prior contributions.' };
  }
  return parseParticipationDecision(output.text);
}

async function synthesizeWithConfiguredModel({
  question,
  contributions,
  infrastructureIssues,
  providerTargets,
  resolveSecret,
  streamText,
  synthesisProviderId,
  synthesisModelId,
  fallback
}) {
  const target = providerTargets.find((item) => item.id === synthesisProviderId) ?? providerTargets[0];
  if (!target || !STREAMING_ADAPTERS.has(target.adapter)) return fallback;

  const secret = await resolveSecret(target.secretReference);
  if (!secret.ok) return fallback;

  const output = await collectStreamText(
    streamText({
      ...target,
      apiKey: secret.getSecret(),
      model: synthesisModelId || target.model,
      maxTokens: 1200,
      prompt: buildSynthesisPrompt({ question, transcript: contributions, infrastructureIssues }),
      mentor: {
        id: 'synthesis',
        name: 'Synthesis',
        role: 'Council Synthesizer'
      }
    })
  );
  if (output.error || !output.text.trim()) return fallback;
  return parseSynthesisResult(output.text, fallback, { transcript: contributions });
}

function buildFallbackLiveSynthesis(contributions, infrastructureIssues, isClarificationResume, closureReason) {
  const distilledPoints = distillContributionPoints(contributions);
  return {
    closureReason,
    agreementState: contributions.length > 0 ? 'Fallback synthesis complete' : 'No visible counsel produced',
    clarificationIncorporated: isClarificationResume,
    mainAnswer: buildLiveSynthesisAnswer(distilledPoints, infrastructureIssues, isClarificationResume),
    minorityViews: distilledPoints.slice(1).map((item) => `${item.speakerName} preserves this angle: ${item.point}`),
    assumptions: infrastructureIssues.length
      ? ['Some mentor contributions were unavailable because of provider or streaming issues.']
      : ['The configured synthesis model was unavailable or rejected, so this compact synthesis was assembled locally from visible mentor contributions.'],
    nextActions: ['Choose the smallest claim in the synthesis that can be verified next.'],
    unresolvedQuestions: infrastructureIssues.length ? ['Would unavailable mentors change the counsel?'] : [],
    mentorGrounding: distilledPoints.map((item) => ({
      mentorName: item.speakerName,
      point: item.point
    })),
    confidence: contributions.length > 1 && infrastructureIssues.length === 0 ? 'medium' : 'low',
    synthesisQuality: 'fallback',
    verificationGuidance: ['Review the transcript and verify important claims before acting.']
  };
}

function buildLiveSynthesisAnswer(distilledPoints, infrastructureIssues, isClarificationResume) {
  if (distilledPoints.length === 0) {
    const issueText = infrastructureIssues.length ? ` Issues: ${infrastructureIssues.join('; ')}.` : '';
    return `No real streaming mentor produced visible answer text.${issueText}`;
  }

  const context = isClarificationResume ? 'After your clarification, ' : '';
  const primary = distilledPoints[0]?.point ?? 'choose one concrete direction and test it quickly.';
  const tension =
    distilledPoints.length > 1
      ? ' Treat the remaining counsel as constraints to test, not as separate answers to follow all at once.'
      : ' Treat it as a hypothesis until reality confirms it.';
  const issueText = infrastructureIssues.length
    ? ' Some council voices were unavailable, so keep confidence modest.'
    : '';
  return `${context}Provisional counsel: ${primary} Convert that into one observable next move, then let evidence decide whether to deepen, revise, or stop.${tension}${issueText}`;
}

function distillContributionPoints(contributions) {
  const seen = new Set();
  return contributions
    .map((item) => ({
      speakerName: item.speakerName,
      point: compactContributionPoint(item.utterance)
    }))
    .filter((item) => {
      const key = item.point.toLowerCase();
      if (!item.point || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function compactContributionPoint(utterance) {
  const cleaned = String(utterance ?? '')
    .replace(/\s+/g, ' ')
    .replace(/^[A-Za-z][A-Za-z\s-]{1,40}:\s*/, '')
    .trim();
  const firstSentence = cleaned.match(/^.{24,180}?[.!?](?:\s|$)/)?.[0]?.trim() ?? cleaned;
  return truncateText(firstSentence, 180);
}

function truncateText(text, limit) {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 80 ? lastSpace : limit - 1).trim()}.`;
}

async function collectStreamText(stream) {
  let text = '';
  let error = '';
  for await (const chunk of stream) {
    if (chunk.type === 'token') text += chunk.text;
    if (chunk.type === 'error') error = chunk.error ?? 'provider-stream-failed';
  }
  return { text, error };
}

function publicMentorPayload(mentor) {
  return {
    mentorName: mentor.name,
    mentorRole: mentor.role
  };
}

function sanitizeReason(value) {
  return String(value ?? '')
    .replaceAll(/op:\/\/[^\s"]+/g, '[redacted-reference]')
    .replaceAll(/\b(sk-[A-Za-z0-9_-]{4,})\b/g, '[redacted-secret]')
    .replaceAll(/\b[a-zA-Z0-9_-]{32,}\b/g, '[redacted-token]')
    .slice(0, 160);
}
