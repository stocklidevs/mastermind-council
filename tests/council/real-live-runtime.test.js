import test from 'node:test';
import assert from 'node:assert/strict';
import { streamRealLiveCouncilEvents } from '../../src/council/real-live-runtime.js';

const mentors = [
  { id: 'athena', name: 'Athena', role: 'Strategist', providerId: 'openai', modelId: 'gpt-4.1' },
  { id: 'socrates', name: 'Socrates', role: 'Questioner', providerId: 'anthropic', modelId: 'claude-sonnet-4-20250514' },
  { id: 'daedalus', name: 'Daedalus', role: 'Builder', providerId: 'xai', modelId: 'grok-3' }
];

const providerTargets = [
  { id: 'openai', name: 'OpenAI', adapter: 'openai-responses', model: 'gpt-4.1', secretReference: 'op://Vault/OpenAI/credential' },
  {
    id: 'anthropic',
    name: 'Claude',
    adapter: 'anthropic-messages',
    model: 'claude-sonnet-4-20250514',
    secretReference: 'op://Vault/Claude/credential'
  },
  { id: 'xai', name: 'xAI', adapter: 'openai-compatible-chat', model: 'grok-3', secretReference: 'op://Vault/xAI/credential' }
];

test('streams supported real provider mentor tokens as live events', async () => {
  const callConfigs = [];
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors,
    providerTargets,
    maxTurns: 1,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ mentor, prompt, maxTokens }) {
      assert.doesNotMatch(prompt, /Return only valid JSON with these fields:\n\{"action"/);
      if (/streaming live council speech/i.test(prompt)) {
        callConfigs.push({ mentorId: mentor.id, maxTokens });
      }
      yield { type: 'token', text: `${mentor.name} ` };
      yield { type: 'token', text: 'speaks.' };
    }
  })) {
    events.push(event);
  }

  assert.equal(events[0].type, 'session.started');
  assert.deepEqual(
    events.filter((event) => event.type === 'stick.granted').map((event) => event.mentorId),
    ['athena', 'socrates', 'daedalus']
  );
  assert.deepEqual(
    events.filter((event) => event.type === 'mentor.token').map((event) => event.payload.token),
    ['Athena ', 'speaks.', 'Socrates ', 'speaks.', 'Daedalus ', 'speaks.']
  );
  assert.deepEqual(
    events.filter((event) => event.type === 'mentor.pre_action').map((event) => event.mentorId),
    ['athena', 'socrates', 'daedalus']
  );
  assert.deepEqual(
    events.filter((event) => event.type === 'mentor.post_action').map((event) => event.mentorId),
    ['athena', 'socrates', 'daedalus']
  );
  assert.ok(callConfigs.every((config) => config.maxTokens >= 900));
  assert.equal(events.some((event) => event.type === 'mentor.abstained' && event.mentorId === 'daedalus'), false);
  assert.match(events.at(-1).payload.mainAnswer, /Provisional counsel:/);
  assert.doesNotMatch(events.at(-1).payload.mainAnswer, /Athena:/);
  assert.doesNotMatch(events.at(-1).payload.mainAnswer, /Daedalus:/);
  assert.equal(events.at(-1).payload.agreementState, 'Fallback synthesis complete');
  assert.equal(events.at(-1).type, 'session.synthesized');
});

test('uses provider-authored live real actions around streamed speech', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 1),
    preambleEnabled: false,
    maxTurns: 1,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ prompt }) {
      if (/participation decision/i.test(prompt)) {
        yield { type: 'token', text: '{"wantsToSpeak":true,"intent":"contribute","reason":"useful"}' };
        return;
      }
      if (/visible stage direction/i.test(prompt) && /before speaking/i.test(prompt)) {
        yield { type: 'token', text: '{"action":"Athena touches the gold stick and lets a precise silence gather."}' };
        return;
      }
      if (/visible stage direction/i.test(prompt) && /after speaking/i.test(prompt)) {
        yield { type: 'token', text: '{"action":"Athena lowers the stick with a small decisive nod."}' };
        return;
      }
      if (/synthesis model/i.test(prompt)) {
        yield { type: 'token', text: '{"mainAnswer":"A decision brief.","agreementState":"Done"}' };
        return;
      }
      yield { type: 'token', text: 'Run one paid discovery test.' };
    }
  })) {
    events.push(event);
  }

  assert.equal(
    events.find((event) => event.type === 'mentor.pre_action')?.payload.action,
    'Athena touches the gold stick and lets a precise silence gather.'
  );
  assert.equal(
    events.find((event) => event.type === 'mentor.post_action')?.payload.action,
    'Athena lowers the stick with a small decisive nod.'
  );
  assert.deepEqual(
    events.filter((event) => event.type === 'mentor.token').map((event) => event.payload.token),
    ['Run one paid discovery test.']
  );
});

test('fallback synthesis stays compact instead of dumping the transcript', async () => {
  const events = [];
  const longAnswer =
    'Start with customer discovery before building. '.repeat(20) +
    'Then constrain the project to a paid pilot.';

  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 2),
    providerTargets: providerTargets.slice(0, 2),
    preambleEnabled: false,
    maxTurns: 1,
    synthesisProviderId: 'openai',
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ prompt, mentor }) {
      if (/participation decision/i.test(prompt)) {
        yield { type: 'token', text: '{"wantsToSpeak":true,"intent":"contribute","reason":"useful"}' };
        return;
      }
      if (/synthesis model/i.test(prompt)) {
        yield {
          type: 'token',
          text: '{"mainAnswer":"Athena says start with customer discovery. Socrates says constrain the project.","agreementState":"Done"}'
        };
        return;
      }
      yield { type: 'token', text: `${mentor.name}: ${longAnswer}` };
    }
  })) {
    events.push(event);
  }

  const synthesis = events.at(-1).payload;
  assert.equal(synthesis.synthesisQuality, 'fallback');
  assert.ok(synthesis.mainAnswer.length < 700);
  assert.match(synthesis.mainAnswer, /Provisional counsel:/);
  assert.doesNotMatch(synthesis.mainAnswer, /The visible counsel points toward this synthesis/);
  assert.doesNotMatch(synthesis.mainAnswer, /Start with customer discovery before building\. Start with customer discovery before building/);
  assert.doesNotMatch(synthesis.mainAnswer, /Athena:/);
  assert.doesNotMatch(synthesis.mainAnswer, /Socrates:/);
  assert.ok(synthesis.mentorGrounding.every((item) => item.point.length < 220));
  assert.ok(synthesis.minorityViews.every((item) => item.length < 220));
});

test('opens another real live turn when mentors express interest', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 2),
    providerTargets: providerTargets.slice(0, 2),
    preambleEnabled: false,
    maxTurns: 2,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ prompt, mentor }) {
      if (/participation decision/i.test(prompt)) {
        const wantsToSpeak = prompt.includes('Turn number: 1') || mentor.id === 'socrates';
        yield {
          type: 'token',
          text: JSON.stringify({
            wantsToSpeak,
            intent: wantsToSpeak ? 'contribute' : 'abstain',
            reason: wantsToSpeak ? 'useful contrast' : 'nothing distinct'
          })
        };
        return;
      }
      if (/synthesis model/i.test(prompt)) {
        yield {
          type: 'token',
          text:
            '{"mainAnswer":"Synthesized across two turns.","agreementState":"Provisional counsel","minorityViews":[],"assumptions":["Transcript-based."],"nextActions":["Choose one avenue to test."],"unresolvedQuestions":["Which buyer segment is urgent?"],"mentorGrounding":[{"mentorName":"Athena","point":"Sequencing."}],"confidence":"medium","verificationGuidance":["Verify."]}'
        };
        return;
      }
      yield { type: 'token', text: `${mentor.name} turn ${prompt.includes('Turn number: 2') ? '2' : '1'}.` };
    }
  })) {
    events.push(event);
  }

  assert.deepEqual(
    events.filter((event) => event.type === 'turn.started').map((event) => event.turnNumber),
    [1, 2]
  );
  assert.ok(events.some((event) => event.type === 'mentor.abstained' && event.turnNumber === 2 && event.mentorId === 'athena'));
  assert.ok(events.some((event) => event.type === 'mentor.token' && event.turnNumber === 2 && event.mentorId === 'socrates'));
  assert.equal(events.at(-1).payload.mainAnswer, 'Synthesized across two turns.');
});

test('uses configured synthesis provider and model for live real summary', async () => {
  const synthesisCalls = [];
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 2),
    preambleEnabled: false,
    maxTurns: 1,
    synthesisProviderId: 'anthropic',
    synthesisModelId: 'claude-sonnet-4-20250514',
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ prompt, model, id, maxTokens }) {
      if (/participation decision/i.test(prompt)) {
        yield { type: 'token', text: '{"wantsToSpeak":true,"intent":"contribute","reason":"first pass"}' };
        return;
      }
      if (/synthesis model/i.test(prompt)) {
        synthesisCalls.push({ id, model, prompt, maxTokens });
        yield {
          type: 'token',
          text:
            '{"mainAnswer":"A true synthesis, not concatenation.","agreementState":"Provisional counsel","minorityViews":[],"assumptions":[],"nextActions":["Run a focused test."],"unresolvedQuestions":[],"mentorGrounding":[{"mentorName":"Athena","point":"Initial framing."}],"confidence":"medium","verificationGuidance":[]}'
        };
        return;
      }
      yield { type: 'token', text: 'First mentor answer.' };
    }
  })) {
    events.push(event);
  }

  assert.equal(synthesisCalls.length, 1);
  assert.equal(synthesisCalls[0].id, 'anthropic');
  assert.equal(synthesisCalls[0].model, 'claude-sonnet-4-20250514');
  assert.ok(synthesisCalls[0].maxTokens >= 900);
  assert.match(synthesisCalls[0].prompt, /First mentor answer/);
  assert.equal(events.at(-1).payload.mainAnswer, 'A true synthesis, not concatenation.');
  assert.deepEqual(events.at(-1).payload.nextActions, ['Run a focused test.']);
});

test('marks empty real stream output as an error instead of done', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 1),
    preambleEnabled: false,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* () {}
  })) {
    events.push(event);
  }

  assert.ok(events.some((event) => event.type === 'mentor.error' && event.payload.reason === 'provider-stream-empty-output'));
  assert.equal(events.some((event) => event.type === 'mentor.done'), false);
  assert.match(events.at(-1).payload.mainAnswer, /No real streaming mentor produced visible answer text/);
});

test('reports unsupported live real providers as infrastructure errors', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: [{ id: 'local', name: 'Local Mentor', role: 'Mock', providerId: 'local', modelId: 'mock' }],
    providerTargets: [{ id: 'local', name: 'Local', adapter: 'local', model: 'mock', secretReference: '' }],
    preambleEnabled: false,
    resolveSecret: async () => ({ ok: true, getSecret: () => '' })
  })) {
    events.push(event);
  }

  assert.equal(events.some((event) => event.type === 'mentor.abstained'), false);
  assert.ok(events.some((event) => event.type === 'mentor.error' && event.payload.reason === 'streaming-provider-not-supported'));
});

test('pauses live real session for supported provider preamble questions', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 2),
    providerTargets: providerTargets.slice(0, 2),
    resolveSecret: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
    streamText: async function* ({ prompt, mentor }) {
      if (/preamble clarification/i.test(prompt)) {
        yield {
          type: 'token',
          text:
            mentor.id === 'socrates'
              ? '{"needsClarification":true,"clarifyingQuestion":"What constraint should I know?"}'
              : '{"needsClarification":false,"clarifyingQuestion":""}'
        };
        return;
      }
      yield { type: 'token', text: `${mentor.name} should not deliberate yet.` };
    }
  })) {
    events.push(event);
  }

  assert.equal(events[1].type, 'preamble.started');
  assert.equal(events.some((event) => event.type === 'turn.started'), false);
  const awaiting = events.find((event) => event.type === 'preamble.awaiting_clarification');
  assert.equal(awaiting.payload.questions.length, 1);
  assert.equal(awaiting.payload.questions[0].question, 'What constraint should I know?');
  assert.equal(JSON.stringify(events).includes('sk-secret-value'), false);
});

test('skips live real preamble when disabled', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 1),
    preambleEnabled: false,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ prompt }) {
      assert.doesNotMatch(prompt, /preamble clarification/i);
      yield { type: 'token', text: 'Immediate counsel.' };
    }
  })) {
    events.push(event);
  }

  assert.equal(events.some((event) => event.type.startsWith('preamble.')), false);
  assert.equal(events[1].type, 'turn.started');
  assert.ok(events.some((event) => event.type === 'mentor.token'));
});

test('resumes live real session from a clarification answer', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What should I build?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 1),
    preambleEnabled: false,
    clarificationAnswer: 'Focus on repeated business pain, not only systems I enjoy building.',
    clarificationQuestions: [{ mentorId: 'athena', mentorName: 'Athena', question: 'What constraint matters?' }],
    nextTurnNumber: 1,
    resolveSecret: async () => ({ ok: true, getSecret: () => 'secret-value' }),
    streamText: async function* ({ prompt }) {
      assert.match(prompt, /User clarification:/);
      assert.match(prompt, /repeated business pain/);
      yield { type: 'token', text: 'Look for paid recurrence.' };
    }
  })) {
    events.push(event);
  }

  assert.equal(events[1].type, 'clarification.answered');
  assert.equal(events[1].turnNumber, 0);
  assert.equal(events[2].type, 'turn.started');
  assert.equal(events[2].turnNumber, 1);
  assert.ok(events.some((event) => event.type === 'mentor.token' && event.payload.token === 'Look for paid recurrence.'));
});

test('does not expose secret references or resolved secrets in real live events', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 1),
    resolveSecret: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
    streamText: async function* () {
      yield { type: 'token', text: 'Safe public text.' };
    }
  })) {
    events.push(event);
  }

  const serialized = JSON.stringify(events);
  assert.equal(serialized.includes('op://'), false);
  assert.equal(serialized.includes('sk-secret-value'), false);
});

test('emits safe mentor error when secret resolution fails', async () => {
  const events = [];
  for await (const event of streamRealLiveCouncilEvents({
    question: 'What next?',
    mentors: mentors.slice(0, 1),
    providerTargets: providerTargets.slice(0, 1),
    resolveSecret: async () => ({ ok: false, error: 'secret unavailable' })
  })) {
    events.push(event);
  }

  const error = events.find((event) => event.type === 'mentor.error');
  assert.equal(error.mentorId, 'athena');
  assert.equal(error.payload.reason, 'secret unavailable');
});
