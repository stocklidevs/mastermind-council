import { getAbstainReason, shouldAbstain, wantsAnotherRound } from './mock-agents.js';

let liveSessionCounter = 0;

export function createLiveCouncilEvents({ question, members, maxTurns = 3, sessionId, preambleEnabled = true } = {}) {
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('question-required');
  }
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error('members-required');
  }

  const id = sessionId ?? `live-session-${++liveSessionCounter}`;
  const events = [];
  let sequence = 0;
  const emit = (type, fields = {}) => {
    const event = {
      type,
      sessionId: id,
      sequence: ++sequence,
      ...fields
    };
    events.push(event);
    return event;
  };

  emit('session.started', {
    payload: {
      questionLength: question.trim().length,
      maxTurns
    }
  });

  const preambleQuestions = preambleEnabled ? collectPreambleQuestions(members) : [];
  if (preambleQuestions.length > 0) {
    emit('preamble.started', {
      turnNumber: 0,
      payload: { phase: 'preamble' }
    });
    for (const item of preambleQuestions) {
      emit('mentor.question', {
        turnNumber: 0,
        mentorId: item.mentorId,
        payload: {
          mentorName: item.mentorName,
          mentorRole: item.mentorRole,
          question: item.question,
          phase: 'preamble'
        }
      });
    }
    emit('preamble.awaiting_clarification', {
      turnNumber: 0,
      payload: {
        phase: 'preamble',
        questions: preambleQuestions.map(({ mentorRole, ...item }) => item)
      }
    });
    emit('session.awaiting_clarification', {
      turnNumber: 0,
      payload: { closureReason: 'preamble-clarification', phase: 'preamble' }
    });
    return events;
  }

  let closureReason = 'no-further-participation';
  let awaitingClarification = false;

  for (let turnNumber = 1; turnNumber <= maxTurns; turnNumber += 1) {
    emit('turn.started', { turnNumber, payload: { turnNumber } });
    const spokenMentorIds = new Set();
    const questions = [];
    let anyWantsAnotherRound = false;

    for (const mentor of members) {
      emit('mentor.thinking', {
        turnNumber,
        mentorId: mentor.id,
        payload: publicMentorPayload(mentor)
      });

      if (shouldAbstain(mentor, turnNumber)) {
        emit('mentor.abstained', {
          turnNumber,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            reason: getAbstainReason(mentor)
          }
        });
        continue;
      }

      if (spokenMentorIds.has(mentor.id)) continue;
      spokenMentorIds.add(mentor.id);
      anyWantsAnotherRound = anyWantsAnotherRound || wantsAnotherRound(mentor);

      emit('stick.granted', {
        turnNumber,
        mentorId: mentor.id,
        payload: publicMentorPayload(mentor)
      });

      const preAction = getTurnValue(mentor.behavior?.preActions, turnNumber);
      if (preAction) {
        emit('mentor.pre_action', {
          turnNumber,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            action: preAction
          }
        });
      }

      const utterance = getTurnValue(mentor.behavior?.utterances, turnNumber) ?? '';
      const tokens = tokenizeUtterance(utterance);
      if (tokens.length === 0) {
        emit('mentor.error', {
          turnNumber,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            reason: 'utterance-required'
          }
        });
      } else {
        for (const token of tokens) {
          emit('mentor.token', {
            turnNumber,
            mentorId: mentor.id,
            payload: {
              ...publicMentorPayload(mentor),
              token
            }
          });
        }
      }

      const postAction = getTurnValue(mentor.behavior?.postActions, turnNumber);
      if (postAction) {
        emit('mentor.post_action', {
          turnNumber,
          mentorId: mentor.id,
          payload: {
            ...publicMentorPayload(mentor),
            action: postAction
          }
        });
      }

      const clarificationQuestion = getTurnValue(mentor.behavior?.clarificationQuestions, turnNumber);
      if (clarificationQuestion) {
        const questionPayload = {
          ...publicMentorPayload(mentor),
          question: clarificationQuestion
        };
        questions.push({
          mentorId: mentor.id,
          mentorName: mentor.name,
          question: clarificationQuestion
        });
        emit('mentor.question', {
          turnNumber,
          mentorId: mentor.id,
          payload: questionPayload
        });
      }

      emit('mentor.done', {
        turnNumber,
        mentorId: mentor.id,
        payload: publicMentorPayload(mentor)
      });
    }

    if (questions.length > 0) {
      awaitingClarification = true;
      closureReason = 'awaiting-clarification';
      emit('turn.awaiting_clarification', {
        turnNumber,
        payload: { questions }
      });
      break;
    }

    emit('turn.closed', {
      turnNumber,
      payload: { turnNumber }
    });

    if (!anyWantsAnotherRound) break;
    if (turnNumber === maxTurns) {
      closureReason = 'max-turns';
    }
  }

  if (awaitingClarification) {
    emit('session.awaiting_clarification', {
      payload: { closureReason }
    });
  } else {
    emit('session.synthesized', {
      payload: {
        closureReason,
        agreementState: closureReason === 'max-turns' ? 'Unresolved' : 'Provisional counsel',
        mainAnswer:
          closureReason === 'max-turns'
            ? 'The council reached the configured turn limit and preserved its open questions.'
            : 'The council completed this live mock deliberation.'
      }
    });
  }

  return events;
}

export async function* streamLiveCouncilEvents(options = {}) {
  const events = createLiveCouncilEvents(options);
  const delayMs = options.delayMs ?? 0;

  for (const event of events) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    yield event;
  }
}

export function createClarificationResumeEvents({
  sessionId,
  originalQuestion,
  members,
  priorEvents = [],
  clarificationQuestions = [],
  answer,
  nextTurnNumber
} = {}) {
  const cleanAnswer = String(answer ?? '').trim();
  if (!cleanAnswer) {
    throw new Error('clarification-answer-required');
  }
  if (!sessionId) {
    throw new Error('session-id-required');
  }
  if (!Array.isArray(members) || members.length === 0) {
    throw new Error('members-required');
  }

  const sequenceStart = priorEvents.reduce((max, event) => Math.max(max, event.sequence ?? 0), 0);
  const clarificationTurn =
    priorEvents
      .filter((event) => event.type === 'turn.awaiting_clarification' || event.type === 'preamble.awaiting_clarification')
      .at(-1)?.turnNumber ?? 1;
  const turnNumber = nextTurnNumber ?? clarificationTurn + 1;
  const events = [];
  let sequence = sequenceStart;
  const emit = (type, fields = {}) => {
    const event = {
      type,
      sessionId,
      sequence: ++sequence,
      ...fields
    };
    events.push(event);
    return event;
  };

  emit('clarification.answered', {
    turnNumber: clarificationTurn,
    payload: {
      answer: cleanAnswer,
      questionCount: clarificationQuestions.length
    }
  });
  emit('turn.started', {
    turnNumber,
    payload: {
      turnNumber,
      resumedFromClarification: true
    }
  });

  for (const mentor of members) {
    emit('mentor.thinking', {
      turnNumber,
      mentorId: mentor.id,
      payload: publicMentorPayload(mentor)
    });
    emit('stick.granted', {
      turnNumber,
      mentorId: mentor.id,
      payload: publicMentorPayload(mentor)
    });

    const preAction = `${mentor.name} receives the clarified context and considers the new shape of the question.`;
    emit('mentor.pre_action', {
      turnNumber,
      mentorId: mentor.id,
      payload: {
        ...publicMentorPayload(mentor),
        action: preAction
      }
    });

    const utterance = createClarifiedUtterance(mentor, originalQuestion, cleanAnswer);
    for (const token of tokenizeUtterance(utterance)) {
      emit('mentor.token', {
        turnNumber,
        mentorId: mentor.id,
        payload: {
          ...publicMentorPayload(mentor),
          token
        }
      });
    }

    emit('mentor.post_action', {
      turnNumber,
      mentorId: mentor.id,
      payload: {
        ...publicMentorPayload(mentor),
        action: `${mentor.name} releases the stick after integrating the clarification.`
      }
    });
    emit('mentor.done', {
      turnNumber,
      mentorId: mentor.id,
      payload: publicMentorPayload(mentor)
    });
  }

  emit('turn.closed', {
    turnNumber,
    payload: { turnNumber, resumedFromClarification: true }
  });
  emit('session.synthesized', {
    payload: {
      closureReason: 'clarification-incorporated',
      agreementState: 'Clarified counsel',
      clarificationIncorporated: true,
      mainAnswer: `The council incorporated your clarification: ${cleanAnswer}`
    }
  });

  return events;
}

function publicMentorPayload(mentor) {
  return {
    mentorName: mentor.name,
    mentorRole: mentor.role,
    voice: mentor.voice
      ? {
          voiceLabel: mentor.voice.voiceLabel,
          tone: mentor.voice.tone
        }
      : undefined
  };
}

function collectPreambleQuestions(members) {
  return members.flatMap((mentor) => {
    const questions = Array.isArray(mentor.behavior?.preambleQuestions) ? mentor.behavior.preambleQuestions : [];
    return questions
      .map((question) => String(question ?? '').trim())
      .filter(Boolean)
      .map((question) => ({
        mentorId: mentor.id,
        mentorName: mentor.name,
        mentorRole: mentor.role,
        question
      }));
  });
}

function getTurnValue(values, turnNumber) {
  if (!Array.isArray(values) || values.length === 0) return undefined;
  return values[turnNumber - 1] ?? values[0];
}

function tokenizeUtterance(utterance) {
  return String(utterance ?? '').match(/\S+\s*/g) ?? [];
}

function createClarifiedUtterance(mentor, originalQuestion, answer) {
  const role = mentor.role ? ` as ${mentor.role}` : '';
  return `${mentor.name}${role} now works from your clarification: ${answer} This narrows the counsel for "${originalQuestion}".`;
}
