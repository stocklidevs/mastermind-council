import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyLiveCouncilEvent,
  buildClarificationResumeContext,
  createLiveCouncilViewState,
  validateClarificationAnswer
} from '../../src/web/live-view.js';

const mentors = [
  { id: 'athena', name: 'Athena', role: 'Strategist' },
  { id: 'socrates', name: 'Socrates', role: 'Questioner' }
];

test('tracks stick owner and mentor activity state', () => {
  let state = createLiveCouncilViewState(mentors);
  state = applyLiveCouncilEvent(state, {
    type: 'stick.granted',
    sessionId: 'live-session-1',
    sequence: 1,
    turnNumber: 1,
    mentorId: 'athena',
    payload: { mentorName: 'Athena' }
  });

  assert.equal(state.stick.ownerMentorId, 'athena');
  assert.equal(state.mentors.find((mentor) => mentor.id === 'athena').state, 'holding_stick');
  assert.equal(state.mentors.find((mentor) => mentor.id === 'athena').hasStick, true);
});

test('releases stick when the active mentor errors', () => {
  let state = createLiveCouncilViewState(mentors);
  state = applyLiveCouncilEvent(state, {
    type: 'stick.granted',
    sessionId: 'live-session-1',
    sequence: 1,
    turnNumber: 1,
    mentorId: 'athena',
    payload: { mentorName: 'Athena' }
  });
  state = applyLiveCouncilEvent(state, {
    type: 'mentor.error',
    sessionId: 'live-session-1',
    sequence: 2,
    turnNumber: 1,
    mentorId: 'athena',
    payload: { reason: 'provider-stream-empty-output' }
  });

  assert.equal(state.stick.ownerMentorId, null);
  assert.equal(state.mentors.find((mentor) => mentor.id === 'athena').state, 'error');
  assert.equal(state.mentors.find((mentor) => mentor.id === 'athena').hasStick, false);
});

test('builds live transcript contribution from actions and tokens', () => {
  let state = createLiveCouncilViewState(mentors);
  for (const event of [
    { type: 'turn.started', sessionId: 's', sequence: 1, turnNumber: 1, payload: {} },
    {
      type: 'mentor.pre_action',
      sessionId: 's',
      sequence: 2,
      turnNumber: 1,
      mentorId: 'athena',
      payload: { action: 'Athena rises.' }
    },
    {
      type: 'mentor.token',
      sessionId: 's',
      sequence: 3,
      turnNumber: 1,
      mentorId: 'athena',
      payload: { token: 'Focus ' }
    },
    {
      type: 'mentor.token',
      sessionId: 's',
      sequence: 4,
      turnNumber: 1,
      mentorId: 'athena',
      payload: { token: 'now.' }
    },
    {
      type: 'mentor.post_action',
      sessionId: 's',
      sequence: 5,
      turnNumber: 1,
      mentorId: 'athena',
      payload: { action: 'Athena sits.' }
    }
  ]) {
    state = applyLiveCouncilEvent(state, event);
  }

  const contribution = state.rounds[0].items[0];
  assert.equal(contribution.speakerId, 'athena');
  assert.equal(contribution.preAction, 'Athena rises.');
  assert.equal(contribution.utterance, 'Focus now.');
  assert.equal(contribution.postAction, 'Athena sits.');
});

test('collects end-of-turn clarification questions', () => {
  let state = createLiveCouncilViewState(mentors);
  state = applyLiveCouncilEvent(state, {
    type: 'turn.awaiting_clarification',
    sessionId: 's',
    sequence: 1,
    turnNumber: 1,
    payload: { questions: [{ mentorId: 'socrates', mentorName: 'Socrates', question: 'What is the constraint?' }] }
  });

  assert.equal(state.status, 'awaiting_clarification');
  assert.equal(state.clarificationQuestions[0].question, 'What is the constraint?');
});

test('collects preamble clarification questions before a debate round exists', () => {
  let state = createLiveCouncilViewState(mentors, { originalQuestion: 'What now?' });
  state = applyLiveCouncilEvent(state, {
    type: 'preamble.awaiting_clarification',
    sessionId: 's',
    sequence: 1,
    turnNumber: 0,
    payload: {
      phase: 'preamble',
      questions: [{ mentorId: 'socrates', mentorName: 'Socrates', question: 'What must be clarified first?' }]
    }
  });

  const context = buildClarificationResumeContext(state, 'The constraint is time.');

  assert.equal(state.status, 'awaiting_clarification');
  assert.equal(state.rounds.length, 0);
  assert.equal(state.clarificationQuestions[0].question, 'What must be clarified first?');
  assert.equal(state.clarificationTurnNumber, 0);
  assert.equal(context.nextTurnNumber, 1);
}
);

test('validates clarification answer text', () => {
  assert.deepEqual(validateClarificationAnswer('   '), {
    valid: false,
    error: 'clarification-answer-required'
  });
  assert.deepEqual(validateClarificationAnswer('Two hours and a fixed budget.'), {
    valid: true,
    answer: 'Two hours and a fixed budget.'
  });
});

test('builds resume context only while awaiting clarification', () => {
  let state = createLiveCouncilViewState(mentors, { originalQuestion: 'What now?' });
  state = applyLiveCouncilEvent(state, {
    type: 'turn.awaiting_clarification',
    sessionId: 's',
    sequence: 1,
    turnNumber: 1,
    payload: { questions: [{ mentorId: 'socrates', mentorName: 'Socrates', question: 'What is the constraint?' }] }
  });

  const context = buildClarificationResumeContext(state, 'Two hours and a fixed budget.');
  assert.equal(context.originalQuestion, 'What now?');
  assert.equal(context.nextTurnNumber, 2);
  assert.equal(context.clarificationAnswer, 'Two hours and a fixed budget.');
  assert.equal(context.clarificationQuestions.length, 1);
});

test('records clarification answer and resumed synthesis in view state', () => {
  let state = createLiveCouncilViewState(mentors, { originalQuestion: 'What now?' });
  for (const event of [
    {
      type: 'clarification.answered',
      sessionId: 's',
      sequence: 1,
      turnNumber: 1,
      payload: { answer: 'Two hours.', questionCount: 1 }
    },
    {
      type: 'session.synthesized',
      sessionId: 's',
      sequence: 2,
      payload: {
        closureReason: 'clarification-incorporated',
        agreementState: 'Clarified counsel',
        mainAnswer: 'The council incorporated your clarification.'
      }
    }
  ]) {
    state = applyLiveCouncilEvent(state, event);
  }

  assert.equal(state.clarificationAnswer, 'Two hours.');
  assert.equal(state.synthesis.closureReason, 'clarification-incorporated');
});

test('stores mentor error reason on the affected mentor', () => {
  let state = createLiveCouncilViewState(mentors);
  state = applyLiveCouncilEvent(state, {
    type: 'mentor.error',
    sessionId: 's',
    sequence: 1,
    turnNumber: 1,
    mentorId: 'athena',
    payload: { mentorName: 'Athena', reason: 'openai-tts-secret-unavailable' }
  });

  const athena = state.mentors.find((mentor) => mentor.id === 'athena');
  assert.equal(athena.state, 'error');
  assert.equal(athena.error, 'openai-tts-secret-unavailable');
});
