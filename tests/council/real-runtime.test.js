import test from 'node:test';
import assert from 'node:assert/strict';

import { runRealCouncilRound } from '../../src/council/real-runtime.js';
import { createDefaultMentors } from '../../src/config/mentor-config.js';

test('runs a one-round real council session with speaking-stick events', async () => {
  const mentors = createDefaultMentors().slice(0, 2);
  const session = await runRealCouncilRound({
    question: 'What should I focus on this week?',
    mentors,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
    generateText: async ({ mentor }) => ({
      ok: true,
      text: JSON.stringify({
        action: `${mentor.name} nods`,
        utterance: `${mentor.name} says focus.`,
        stance: 'focus',
        wantsAnotherRound: false
      }),
      providerId: mentor.providerId,
      model: mentor.modelId,
      latencyMs: 12
    })
  });

  assert.equal(session.status, 'closed');
  assert.equal(session.rounds.length, 1);
  assert.equal(session.rounds[0].contributions.length, 2);
  assert.ok(session.events.some((event) => event.type === 'stick.granted'));
  assert.ok(session.events.some((event) => event.type === 'contribution.accepted'));
});

test('does not store resolved secrets in session events', async () => {
  const [mentor] = createDefaultMentors();
  const session = await runRealCouncilRound({
    question: 'What should I focus on this week?',
    mentors: [mentor],
    resolveSecret: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
    generateText: async () => ({
      ok: true,
      text: '{"utterance":"No secrets here.","stance":"safe"}',
      providerId: 'openai',
      model: 'gpt-4.1',
      latencyMs: 1
    })
  });

  assert.equal(JSON.stringify(session).includes('sk-secret-value'), false);
});

test('records safe provider error events', async () => {
  const [mentor] = createDefaultMentors();
  const session = await runRealCouncilRound({
    question: 'What should I focus on this week?',
    mentors: [mentor],
    resolveSecret: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
    generateText: async () => ({
      ok: false,
      error: 'bad key [redacted-secret]',
      providerId: 'openai',
      model: 'gpt-4.1',
      latencyMs: 1
    })
  });

  const error = session.events.find((event) => event.type === 'provider.error');
  assert.equal(error.memberId, mentor.id);
  assert.match(error.reason, /redacted/);
  assert.equal(session.rounds[0].contributions.length, 0);
});
