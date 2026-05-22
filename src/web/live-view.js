export function createLiveCouncilViewState(mentors = [], options = {}) {
  return {
    status: 'idle',
    originalQuestion: options.originalQuestion ?? '',
    stick: {
      ownerMentorId: null,
      label: 'Speaking stick rests on the table.',
      isActive: false
    },
    mentors: mentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      role: mentor.role,
      state: 'idle',
      hasStick: false,
      speechState: 'none'
    })),
    rounds: [],
    clarificationQuestions: [],
    clarificationTurnNumber: null,
    clarificationAnswer: '',
    synthesis: null,
    error: null
  };
}

export function validateClarificationAnswer(value) {
  const answer = String(value ?? '').trim();
  if (!answer) {
    return { valid: false, error: 'clarification-answer-required' };
  }
  return { valid: true, answer };
}

export function buildClarificationResumeContext(state, answerText) {
  if (state.status !== 'awaiting_clarification') {
    throw new Error('clarification-not-awaited');
  }
  const validation = validateClarificationAnswer(answerText);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const lastTurn = Math.max(
    state.clarificationTurnNumber ?? 0,
    state.rounds.reduce((max, round) => Math.max(max, round.number), 0)
  );
  return {
    originalQuestion: state.originalQuestion,
    nextTurnNumber: lastTurn + 1,
    clarificationQuestions: state.clarificationQuestions,
    clarificationAnswer: validation.answer,
    priorSummary: summarizePublicTranscript(state)
  };
}

export function applyLiveCouncilEvent(state, event) {
  const next = cloneState(state);
  next.status = nextStatus(next.status, event);

  if (event.type === 'turn.started') {
    ensureRound(next, event.turnNumber);
  }

  if (event.type === 'mentor.thinking') {
    updateMentor(next, event.mentorId, { state: 'thinking', speechState: 'none', hasStick: false });
  }

  if (event.type === 'mentor.abstained') {
    updateMentor(next, event.mentorId, { state: 'abstained', speechState: 'complete', hasStick: false });
    const round = ensureRound(next, event.turnNumber);
    round.items.push({
      type: 'abstention',
      mentorId: event.mentorId,
      speakerName: event.payload?.mentorName ?? event.mentorId,
      reason: event.payload?.reason ?? 'No contribution this turn.'
    });
  }

  if (event.type === 'stick.granted') {
    next.stick = {
      ownerMentorId: event.mentorId,
      label: `${event.payload?.mentorName ?? event.mentorId} holds the speaking stick.`,
      isActive: true
    };
    clearStick(next);
    updateMentor(next, event.mentorId, {
      state: 'holding_stick',
      hasStick: true,
      speechState: 'pre_action'
    });
  }

  if (event.type === 'mentor.pre_action') {
    const contribution = ensureContribution(next, event);
    contribution.preAction = event.payload?.action ?? '';
    updateMentor(next, event.mentorId, { state: 'speaking', hasStick: true, speechState: 'pre_action' });
  }

  if (event.type === 'mentor.token') {
    const contribution = ensureContribution(next, event);
    contribution.utterance += event.payload?.token ?? '';
    updateMentor(next, event.mentorId, { state: 'speaking', hasStick: true, speechState: 'speaking' });
  }

  if (event.type === 'mentor.post_action') {
    const contribution = ensureContribution(next, event);
    contribution.postAction = event.payload?.action ?? '';
    updateMentor(next, event.mentorId, { state: 'speaking', hasStick: true, speechState: 'post_action' });
  }

  if (event.type === 'mentor.done') {
    updateMentor(next, event.mentorId, { state: 'done', hasStick: false, speechState: 'complete' });
    next.stick = {
      ownerMentorId: null,
      label: 'Speaking stick returns to the table.',
      isActive: false
    };
  }

  if (event.type === 'mentor.question') {
    updateMentor(next, event.mentorId, { state: 'asking_clarification', hasStick: true });
  }

  if (event.type === 'turn.awaiting_clarification') {
    next.status = 'awaiting_clarification';
    next.clarificationQuestions = event.payload?.questions ?? [];
    next.clarificationTurnNumber = event.turnNumber ?? null;
  }

  if (event.type === 'preamble.awaiting_clarification') {
    next.status = 'awaiting_clarification';
    next.clarificationQuestions = event.payload?.questions ?? [];
    next.clarificationTurnNumber = 0;
  }

  if (event.type === 'clarification.answered') {
    next.status = 'running';
    next.clarificationAnswer = event.payload?.answer ?? '';
    next.clarificationQuestions = [];
    next.clarificationTurnNumber = null;
  }

  if (event.type === 'session.synthesized') {
    next.status = 'synthesized';
    next.synthesis = event.payload;
  }

  if (event.type === 'session.error' || event.type === 'mentor.error') {
    updateMentor(next, event.mentorId, {
      state: 'error',
      hasStick: false,
      error: event.payload?.reason ?? 'live-session-error'
    });
    if (next.stick.ownerMentorId === event.mentorId) {
      next.stick = {
        ownerMentorId: null,
        label: 'Speaking stick returns to the table.',
        isActive: false
      };
    }
    next.error = event.payload?.reason ?? 'live-session-error';
  }

  return next;
}

function nextStatus(current, event) {
  if (event.type === 'session.started') return 'running';
  if (event.type === 'session.error') return 'error';
  return current;
}

function ensureRound(state, turnNumber) {
  const existing = state.rounds.find((round) => round.number === turnNumber);
  if (existing) return existing;
  const round = { number: turnNumber, items: [] };
  state.rounds.push(round);
  return round;
}

function ensureContribution(state, event) {
  const round = ensureRound(state, event.turnNumber);
  let contribution = round.items.find(
    (item) => item.type === 'contribution' && item.mentorId === event.mentorId
  );
  if (!contribution) {
    contribution = {
      type: 'contribution',
      mentorId: event.mentorId,
      speakerId: event.mentorId,
      turnNumber: event.turnNumber,
      speakerName: event.payload?.mentorName ?? event.mentorId,
      speakerRole: event.payload?.mentorRole ?? '',
      preAction: '',
      utterance: '',
      postAction: ''
    };
    round.items.push(contribution);
  }
  return contribution;
}

function clearStick(state) {
  state.mentors = state.mentors.map((mentor) => ({ ...mentor, hasStick: false }));
}

function updateMentor(state, mentorId, updates) {
  if (!mentorId) return;
  state.mentors = state.mentors.map((mentor) => (mentor.id === mentorId ? { ...mentor, ...updates } : mentor));
}

function cloneState(state) {
  return {
    ...state,
    stick: { ...state.stick },
    mentors: state.mentors.map((mentor) => ({ ...mentor })),
    rounds: state.rounds.map((round) => ({
      ...round,
      items: round.items.map((item) => ({ ...item }))
    })),
    clarificationQuestions: state.clarificationQuestions.map((question) => ({ ...question })),
    clarificationTurnNumber: state.clarificationTurnNumber,
    clarificationAnswer: state.clarificationAnswer,
    synthesis: state.synthesis ? { ...state.synthesis } : null
  };
}

function summarizePublicTranscript(state) {
  return state.rounds
    .flatMap((round) =>
      round.items
        .filter((item) => item.type === 'contribution')
        .map((item) => `${item.speakerName}: ${item.utterance}`)
    )
    .join('\n');
}
