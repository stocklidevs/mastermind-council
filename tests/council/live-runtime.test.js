import test from 'node:test';
import assert from 'node:assert/strict';
import { createClarificationResumeEvents, createLiveCouncilEvents } from '../../src/council/live-runtime.js';

const members = [
  {
    id: 'athena',
    name: 'Athena',
    role: 'Strategist',
    behavior: {
      utterances: ['Focus on the decision that unlocks the next week.'],
      preActions: ['Athena places one hand near the gold stick.'],
      postActions: ['Athena lowers her voice and lets the counsel settle.'],
      wantsMoreRounds: true
    }
  },
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Questioner',
    behavior: {
      utterances: ['Before answering, I need the hidden constraint named.'],
      clarificationQuestions: ['What constraint are you not saying out loud?']
    }
  },
  {
    id: 'daedalus',
    name: 'Daedalus',
    role: 'Builder',
    behavior: {
      abstainRounds: [1],
      abstainReason: 'No build recommendation until the constraint is clear.',
      utterances: ['Now the path can be made practical.']
    }
  }
];

test('creates public live events with token-level mentor output', () => {
  const events = createLiveCouncilEvents({ question: 'What now?', members, maxTurns: 3 });

  assert.equal(events[0].type, 'session.started');
  assert.equal(events[1].type, 'turn.started');
  assert.ok(events.some((event) => event.type === 'mentor.pre_action'));
  assert.ok(events.some((event) => event.type === 'mentor.post_action'));

  const athenaTokens = events.filter((event) => event.type === 'mentor.token' && event.mentorId === 'athena');
  assert.ok(athenaTokens.length >= 3);
  assert.equal(athenaTokens.map((event) => event.payload.token).join(''), members[0].behavior.utterances[0]);
});

test('keeps once-per-turn stick ownership and abstention events', () => {
  const events = createLiveCouncilEvents({ question: 'What now?', members, maxTurns: 3 });
  const firstTurnGrants = events.filter((event) => event.type === 'stick.granted' && event.turnNumber === 1);
  const firstTurnGrantIds = firstTurnGrants.map((event) => event.mentorId);

  assert.deepEqual(firstTurnGrantIds, ['athena', 'socrates']);
  assert.equal(new Set(firstTurnGrantIds).size, firstTurnGrantIds.length);
  assert.ok(
    events.some(
      (event) =>
        event.type === 'mentor.abstained' &&
        event.mentorId === 'daedalus' &&
        event.payload.reason === 'No build recommendation until the constraint is clear.'
    )
  );
});

test('collects clarification questions at the end of a turn', () => {
  const events = createLiveCouncilEvents({ question: 'What now?', members, maxTurns: 3 });
  const question = events.find((event) => event.type === 'mentor.question');
  const awaiting = events.find((event) => event.type === 'turn.awaiting_clarification');
  const turnClosed = events.find((event) => event.type === 'turn.closed' && event.turnNumber === 1);

  assert.equal(question.payload.question, 'What constraint are you not saying out loud?');
  assert.equal(awaiting.payload.questions.length, 1);
  assert.equal(turnClosed, undefined);
  assert.ok(awaiting.sequence > question.sequence);
});

test('pauses for preamble questions before the first debate turn', () => {
  const preambleMembers = [
    {
      id: 'socrates',
      name: 'Socrates',
      role: 'Questioner',
      behavior: {
        preambleQuestions: ['What outcome would make this worth doing?'],
        utterances: ['Only after the answer should I deliberate.']
      }
    },
    {
      id: 'athena',
      name: 'Athena',
      role: 'Strategist',
      behavior: {
        preambleQuestions: ['What constraint governs the decision?'],
        utterances: ['Then we choose the narrow path.']
      }
    }
  ];
  const events = createLiveCouncilEvents({ question: 'What now?', members: preambleMembers, maxTurns: 3 });
  const preamble = events.find((event) => event.type === 'preamble.awaiting_clarification');
  const firstTurn = events.find((event) => event.type === 'turn.started');

  assert.equal(events[1].type, 'preamble.started');
  assert.equal(preamble.payload.phase, 'preamble');
  assert.deepEqual(
    preamble.payload.questions.map((question) => question.question),
    ['What outcome would make this worth doing?', 'What constraint governs the decision?']
  );
  assert.equal(firstTurn, undefined);
  assert.equal(events.at(-1).type, 'session.awaiting_clarification');
});

test('skips preamble questions when preamble is disabled', () => {
  const events = createLiveCouncilEvents({
    question: 'What now?',
    preambleEnabled: false,
    members: [
      {
        id: 'socrates',
        name: 'Socrates',
        role: 'Questioner',
        behavior: {
          preambleQuestions: ['What is missing?'],
          utterances: ['Now I will speak immediately.']
        }
      }
    ],
    maxTurns: 1
  });

  assert.equal(events.some((event) => event.type.startsWith('preamble.')), false);
  assert.equal(events[1].type, 'turn.started');
  assert.ok(events.some((event) => event.type === 'mentor.token'));
});

test('synthesizes when max turns are reached without clarification', () => {
  const decisiveMembers = [
    {
      id: 'athena',
      name: 'Athena',
      role: 'Strategist',
      behavior: {
        utterances: ['Choose the narrow path and execute it cleanly.'],
        wantsMoreRounds: true
      }
    }
  ];
  const events = createLiveCouncilEvents({ question: 'What now?', members: decisiveMembers, maxTurns: 2 });
  const turns = events.filter((event) => event.type === 'turn.started');
  const synthesis = events.at(-1);

  assert.equal(turns.length, 2);
  assert.equal(synthesis.type, 'session.synthesized');
  assert.equal(synthesis.payload.closureReason, 'max-turns');
});

test('creates resumed turn events from a clarification answer', () => {
  const firstEvents = createLiveCouncilEvents({ question: 'What now?', members, maxTurns: 3, sessionId: 'live-session-test' });
  const resumed = createClarificationResumeEvents({
    sessionId: 'live-session-test',
    originalQuestion: 'What now?',
    members,
    priorEvents: firstEvents,
    clarificationQuestions: [{ mentorId: 'socrates', mentorName: 'Socrates', question: 'What constraint?' }],
    answer: 'The hidden constraint is that I only have two hours this week.'
  });

  assert.equal(resumed[0].type, 'clarification.answered');
  assert.equal(resumed[0].turnNumber, 1);
  assert.equal(resumed[1].type, 'turn.started');
  assert.equal(resumed[1].turnNumber, 2);
  assert.ok(resumed.some((event) => event.type === 'mentor.token'));
  assert.equal(resumed.at(-1).type, 'session.synthesized');
  assert.equal(resumed.at(-1).payload.clarificationIncorporated, true);
  assert.match(
    resumed
      .filter((event) => event.type === 'mentor.token')
      .map((event) => event.payload.token)
      .join(''),
    /two hours/
  );
});

test('creates first debate turn when resuming from preamble clarification', () => {
  const firstEvents = createLiveCouncilEvents({
    question: 'What now?',
    sessionId: 'live-session-preamble',
    members: [
      {
        id: 'socrates',
        name: 'Socrates',
        role: 'Questioner',
        behavior: {
          preambleQuestions: ['What constraint is hidden?'],
          utterances: ['Now the premise is visible.']
        }
      }
    ],
    maxTurns: 3
  });
  const resumed = createClarificationResumeEvents({
    sessionId: 'live-session-preamble',
    originalQuestion: 'What now?',
    members,
    priorEvents: firstEvents,
    clarificationQuestions: [{ mentorId: 'socrates', mentorName: 'Socrates', question: 'What constraint is hidden?' }],
    answer: 'I only have two hours this week.'
  });

  assert.equal(resumed[0].type, 'clarification.answered');
  assert.equal(resumed[0].turnNumber, 0);
  assert.equal(resumed[1].type, 'turn.started');
  assert.equal(resumed[1].turnNumber, 1);
  assert.ok(resumed.some((event) => event.type === 'mentor.token'));
});

test('rejects blank clarification resume answers', () => {
  assert.throws(
    () =>
      createClarificationResumeEvents({
        sessionId: 's',
        originalQuestion: 'What now?',
        members,
        priorEvents: [],
        clarificationQuestions: [],
        answer: ' '
      }),
    /clarification-answer-required/
  );
});
