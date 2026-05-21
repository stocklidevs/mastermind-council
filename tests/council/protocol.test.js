import test from 'node:test';
import assert from 'node:assert/strict';

import { createCouncilSession, runCouncilSession } from '../../src/index.js';
import {
  abstentionCouncil,
  basicCouncil,
  duplicateAttemptCouncil
} from '../fixtures/mock-councils.js';

function eventsOf(result, type) {
  return result.events.filter((event) => event.type === type);
}

test('creates a pending session from a user question', () => {
  const session = createCouncilSession({
    question: 'What should I do first?',
    members: basicCouncil
  });

  assert.equal(session.status, 'pending');
  assert.equal(session.question, 'What should I do first?');
  assert.equal(session.members.length, 3);
});

test('ties each accepted contribution to one speaking-stick grant', () => {
  const session = createCouncilSession({
    question: 'What should I do first?',
    members: basicCouncil
  });

  const result = runCouncilSession(session);
  const grants = eventsOf(result, 'stick.granted');
  const contributions = eventsOf(result, 'contribution.accepted');

  assert.ok(contributions.length > 0);
  assert.equal(grants.length, contributions.length);

  for (const contribution of contributions) {
    const grant = grants.find((event) => event.id === contribution.grantEventId);
    assert.ok(grant, `missing grant for contribution ${contribution.id}`);
    assert.equal(grant.memberId, contribution.speakerId);
    assert.equal(grant.roundNumber, contribution.roundNumber);
    assert.ok(grant.sequence < contribution.sequence);
  }
});

test('rejects an agent that attempts to speak twice in one round', () => {
  const session = createCouncilSession({
    question: 'Should I act now?',
    members: duplicateAttemptCouncil
  });

  const result = runCouncilSession(session);
  const invalidEvents = eventsOf(result, 'protocol.invalid-event');

  assert.equal(eventsOf(result, 'contribution.accepted').length, 1);
  assert.equal(invalidEvents.length, 1);
  assert.equal(invalidEvents[0].reason, 'agent-already-spoke-in-round');
});

test('closes a session with synthesis and closure reason', () => {
  const session = createCouncilSession({
    question: 'What should I do first?',
    members: basicCouncil
  });

  const result = runCouncilSession(session);

  assert.equal(result.status, 'closed');
  assert.ok(result.synthesis.mainAnswer);
  assert.ok(result.synthesis.closureReason);
  assert.equal(eventsOf(result, 'session.synthesized').length, 1);
});

test('records abstention events in the transcript', () => {
  const session = createCouncilSession({
    question: 'What should I do first?',
    members: abstentionCouncil
  });

  const result = runCouncilSession(session);
  const abstentions = eventsOf(result, 'agent.abstained');

  assert.equal(abstentions.length, 1);
  assert.equal(abstentions[0].memberId, 'hermes');
  assert.equal(abstentions[0].reason, 'No distinct point to add.');
});

test('keeps action fields separate from utterances', () => {
  const session = createCouncilSession({
    question: 'What should I do first?',
    members: basicCouncil
  });

  const result = runCouncilSession(session);
  const contribution = eventsOf(result, 'contribution.accepted').find(
    (event) => event.speakerId === 'athena'
  );

  assert.equal(contribution.action, 'leans forward with calm focus');
  assert.equal(contribution.utterance, 'Start with the smallest reversible test.');
  assert.ok(!contribution.utterance.includes(contribution.action));
});

test('preserves speaking order across multiple stick grants', () => {
  const session = createCouncilSession({
    question: 'What should I do first?',
    members: basicCouncil
  });

  const result = runCouncilSession(session);
  const speakers = eventsOf(result, 'contribution.accepted').map(
    (event) => event.speakerId
  );

  assert.deepEqual(speakers, ['athena', 'socrates', 'hephaestus']);
});
