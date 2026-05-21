import {
  attemptsRepeatInRound,
  createContribution,
  getAbstainReason,
  shouldAbstain,
  wantsAnotherRound
} from './mock-agents.js';
import { synthesizeSession } from './synthesis.js';

let sessionCounter = 0;

function assertValidQuestion(question) {
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('question-required');
  }
}

function assertUniqueMembers(members) {
  const ids = new Set();

  for (const member of members) {
    if (!member.id || ids.has(member.id)) {
      throw new Error('duplicate-member-id');
    }
    ids.add(member.id);
  }
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

function openRound(session, roundNumber) {
  const round = {
    number: roundNumber,
    spokenMemberIds: [],
    abstainedMemberIds: [],
    contributions: [],
    status: 'open'
  };

  session.rounds.push(round);
  recordEvent(session, {
    type: 'round.started',
    roundNumber
  });

  return round;
}

function grantStick(session, round, member) {
  if (round.spokenMemberIds.includes(member.id)) {
    return recordEvent(session, {
      type: 'protocol.invalid-event',
      roundNumber: round.number,
      memberId: member.id,
      reason: 'agent-already-spoke-in-round'
    });
  }

  return recordEvent(session, {
    type: 'stick.granted',
    roundNumber: round.number,
    memberId: member.id
  });
}

function acceptContribution(session, round, member, grant) {
  if (grant.type === 'protocol.invalid-event') return null;

  const contribution = createContribution(member, round.number);
  if (!contribution.utterance.trim()) {
    return recordEvent(session, {
      type: 'protocol.invalid-event',
      roundNumber: round.number,
      memberId: member.id,
      reason: 'utterance-required'
    });
  }

  const order =
    session.rounds.reduce((count, item) => count + item.contributions.length, 0) + 1;
  const accepted = {
    ...contribution,
    order,
    grantEventId: grant.id
  };

  round.spokenMemberIds.push(member.id);
  round.contributions.push(accepted);

  return recordEvent(session, {
    type: 'contribution.accepted',
    ...accepted
  });
}

export function createCouncilSession({ question, members, options = {} }) {
  assertValidQuestion(question);
  assertUniqueMembers(members);

  return {
    id: `session-${++sessionCounter}`,
    status: 'pending',
    question,
    members,
    options: {
      maxRounds: options.maxRounds ?? 5
    },
    rounds: [],
    events: [],
    synthesis: null
  };
}

export function runCouncilSession(session) {
  session.status = 'running';
  recordEvent(session, {
    type: 'session.started',
    question: session.question
  });

  let closureReason = 'no-further-participation';

  for (let roundNumber = 1; roundNumber <= session.options.maxRounds; roundNumber += 1) {
    const round = openRound(session, roundNumber);
    let anyWantsAnotherRound = false;

    for (const member of session.members) {
      if (shouldAbstain(member, roundNumber)) {
        round.abstainedMemberIds.push(member.id);
        recordEvent(session, {
          type: 'agent.abstained',
          roundNumber,
          memberId: member.id,
          reason: getAbstainReason(member)
        });
        continue;
      }

      const grant = grantStick(session, round, member);
      acceptContribution(session, round, member, grant);

      if (attemptsRepeatInRound(member)) {
        grantStick(session, round, member);
      }

      anyWantsAnotherRound = anyWantsAnotherRound || wantsAnotherRound(member);
    }

    round.status = 'closed';
    recordEvent(session, {
      type: 'round.closed',
      roundNumber
    });

    if (!anyWantsAnotherRound) break;
    if (roundNumber === session.options.maxRounds) {
      closureReason = 'max-rounds';
    }
  }

  session.synthesis = synthesizeSession(session, closureReason);
  session.status = 'closed';
  recordEvent(session, {
    type: 'session.synthesized',
    synthesis: session.synthesis
  });

  return session;
}
