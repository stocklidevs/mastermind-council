import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSseEvent, handleLiveCouncilRequest } from '../../src/server/live-council-handler.js';

test('formats server-sent events', () => {
  const output = formatSseEvent({
    type: 'mentor.token',
    sessionId: 'live-session-1',
    sequence: 3,
    payload: { token: 'Focus ' }
  });

  assert.equal(
    output,
    'event: mentor.token\n' +
      'data: {"type":"mentor.token","sessionId":"live-session-1","sequence":3,"payload":{"token":"Focus "}}\n\n'
  );
});

test('streams safe live council events', async () => {
  const writes = [];
  const result = await handleLiveCouncilRequest(
    new URL('http://localhost/api/council/live?mode=mock&question=What%20next%3F&maxTurns=1'),
    {
      members: [
        {
          id: 'athena',
          name: 'Athena',
          role: 'Strategist',
          behavior: { utterances: ['Focus here now.'] }
        }
      ],
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  assert.equal(result.status, 200);
  assert.equal(result.headers['content-type'], 'text/event-stream; charset=utf-8');
  assert.ok(writes.join('').includes('event: mentor.token'));
  assert.ok(writes.join('').includes('event: session.synthesized'));
  assert.ok(!writes.join('').includes('op://'));
  assert.equal(writes.at(-1), '[end]');
});

test('can disable live mock preamble through request setting', async () => {
  const writes = [];
  const result = await handleLiveCouncilRequest(
    new URL('http://localhost/api/council/live?mode=mock&question=What%20next%3F&preambleEnabled=0'),
    {
      members: [
        {
          id: 'socrates',
          name: 'Socrates',
          role: 'Questioner',
          behavior: {
            preambleQuestions: ['What is missing?'],
            utterances: ['Answer now.']
          }
        }
      ],
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  const output = writes.join('');
  assert.equal(result.status, 200);
  assert.equal(output.includes('event: preamble.awaiting_clarification'), false);
  assert.ok(output.includes('event: turn.started'));
  assert.ok(output.includes('event: mentor.token'));
});

test('streams real council events with server-side secrets', async () => {
  const writes = [];
  const result = await handleLiveCouncilRequest(
    new URL('http://localhost/api/council/live?mode=real&question=What%20next%3F&maxTurns=1'),
    {
      members: [
        { id: 'athena', name: 'Athena', role: 'Strategist', providerId: 'openai', modelId: 'gpt-4.1' },
        { id: 'socrates', name: 'Socrates', role: 'Questioner', providerId: 'anthropic', modelId: 'claude-sonnet-4-20250514' }
      ],
      providerTargets: [
        {
          id: 'openai',
          name: 'OpenAI',
          adapter: 'openai-responses',
          model: 'gpt-4.1',
          secretReference: 'op://Vault/OpenAI/credential'
        },
        {
          id: 'anthropic',
          name: 'Claude',
          adapter: 'anthropic-messages',
          model: 'claude-sonnet-4-20250514',
          secretReference: 'op://Vault/Claude/credential'
        }
      ],
      findCli: async () => ({ ok: true, path: 'op' }),
      resolveReference: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
      streamText: async function* ({ mentor, prompt }) {
        if (/preamble clarification/i.test(prompt)) {
          yield { type: 'token', text: '{"needsClarification":false,"clarifyingQuestion":""}' };
          return;
        }
        yield { type: 'token', text: `${mentor.name} token` };
      },
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  const output = writes.join('');
  assert.equal(result.status, 200);
  assert.ok(output.includes('event: mentor.token'));
  assert.ok(output.includes('Athena token'));
  assert.ok(output.includes('Socrates token'));
  assert.equal(output.includes('op://'), false);
  assert.equal(output.includes('sk-secret-value'), false);
});

test('forwards live real max turns and synthesis model settings', async () => {
  const writes = [];
  const result = await handleLiveCouncilRequest(
    new URL(
      'http://localhost/api/council/live?mode=real&question=What%20next%3F&preambleEnabled=0&maxTurns=2&synthesisProviderId=anthropic&synthesisModelId=claude-sonnet-4-20250514'
    ),
    {
      members: [
        { id: 'athena', name: 'Athena', role: 'Strategist', providerId: 'openai', modelId: 'gpt-4.1' },
        { id: 'socrates', name: 'Socrates', role: 'Questioner', providerId: 'anthropic', modelId: 'claude-sonnet-4-20250514' }
      ],
      providerTargets: [
        {
          id: 'openai',
          name: 'OpenAI',
          adapter: 'openai-responses',
          model: 'gpt-4.1',
          secretReference: 'op://Vault/OpenAI/credential'
        },
        {
          id: 'anthropic',
          name: 'Claude',
          adapter: 'anthropic-messages',
          model: 'claude-sonnet-4-20250514',
          secretReference: 'op://Vault/Claude/credential'
        }
      ],
      findCli: async () => ({ ok: true, path: 'op' }),
      resolveReference: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
      streamText: async function* ({ prompt, mentor, id }) {
        if (/participation decision/i.test(prompt)) {
          const wantsToSpeak = prompt.includes('Turn number: 1') || mentor.id === 'socrates';
          yield { type: 'token', text: JSON.stringify({ wantsToSpeak, intent: 'contribute', reason: 'useful' }) };
          return;
        }
        if (/synthesis model/i.test(prompt)) {
          assert.equal(id, 'anthropic');
          yield {
            type: 'token',
            text:
              '{"mainAnswer":"Server forwarded synthesis config.","agreementState":"Done","nextActions":["Act."],"unresolvedQuestions":[],"mentorGrounding":[{"mentorName":"Athena","point":"Spoke."}],"confidence":"medium"}'
          };
          return;
        }
        yield { type: 'token', text: `${mentor.name} spoke.` };
      },
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  const output = writes.join('');
  assert.equal(result.status, 200);
  assert.ok(output.includes('"turnNumber":2'));
  assert.ok(output.includes('Server forwarded synthesis config.'));
});

test('uses requested live real mentors from the query string', async () => {
  const writes = [];
  const requestedMentors = encodeURIComponent(
    JSON.stringify([
      { id: 'market-moralist', name: 'Market Moralist', role: 'Incentive Analyst', providerId: 'openai', modelId: 'gpt-4.1' }
    ])
  );
  const result = await handleLiveCouncilRequest(
    new URL(`http://localhost/api/council/live?mode=real&question=What%20next%3F&preambleEnabled=0&members=${requestedMentors}`),
    {
      providerTargets: [
        {
          id: 'openai',
          name: 'OpenAI',
          adapter: 'openai-responses',
          model: 'gpt-4.1',
          secretReference: 'op://Vault/OpenAI/credential'
        }
      ],
      findCli: async () => ({ ok: true, path: 'op' }),
      resolveReference: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
      streamText: async function* ({ mentor }) {
        yield { type: 'token', text: `${mentor.name} token` };
      },
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  const output = writes.join('');
  assert.equal(result.status, 200);
  assert.ok(output.includes('Market Moralist token'));
  assert.equal(output.includes('Athena token'), false);
});

test('streams live real clarification resume from query answer', async () => {
  const writes = [];
  const requestedMentors = encodeURIComponent(
    JSON.stringify([{ id: 'terrain-reader', name: 'Terrain Reader', role: 'Strategic Positioner', providerId: 'openai', modelId: 'gpt-4.1' }])
  );
  const result = await handleLiveCouncilRequest(
    new URL(
      `http://localhost/api/council/live?mode=real&question=What%20next%3F&preambleEnabled=0&clarificationAnswer=${encodeURIComponent(
        'I need recurring business pain.'
      )}&members=${requestedMentors}`
    ),
    {
      providerTargets: [
        {
          id: 'openai',
          name: 'OpenAI',
          adapter: 'openai-responses',
          model: 'gpt-4.1',
          secretReference: 'op://Vault/OpenAI/credential'
        }
      ],
      findCli: async () => ({ ok: true, path: 'op' }),
      resolveReference: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
      streamText: async function* ({ prompt }) {
        assert.match(prompt, /User clarification:/);
        yield { type: 'token', text: 'Find recurring pain.' };
      },
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  const output = writes.join('');
  assert.equal(result.status, 200);
  assert.ok(output.includes('event: clarification.answered'));
  assert.ok(output.includes('event: mentor.token'));
  assert.ok(output.includes('Find recurring pain.'));
  assert.equal(output.includes('Terrain Reader receives the clarified context'), false);
});

test('can disable live real preamble through request setting', async () => {
  const writes = [];
  const result = await handleLiveCouncilRequest(
    new URL('http://localhost/api/council/live?mode=real&question=What%20next%3F&preambleEnabled=0'),
    {
      members: [{ id: 'athena', name: 'Athena', role: 'Strategist', providerId: 'openai', modelId: 'gpt-4.1' }],
      providerTargets: [
        {
          id: 'openai',
          name: 'OpenAI',
          adapter: 'openai-responses',
          model: 'gpt-4.1',
          secretReference: 'op://Vault/OpenAI/credential'
        }
      ],
      findCli: async () => ({ ok: true, path: 'op' }),
      resolveReference: async () => ({ ok: true, getSecret: () => 'sk-secret-value' }),
      streamText: async function* ({ prompt }) {
        assert.doesNotMatch(prompt, /preamble clarification/i);
        yield { type: 'token', text: 'Immediate real counsel.' };
      },
      write: (chunk) => writes.push(chunk),
      end: () => writes.push('[end]')
    }
  );

  const output = writes.join('');
  assert.equal(result.status, 200);
  assert.equal(output.includes('event: preamble.awaiting_clarification'), false);
  assert.ok(output.includes('event: turn.started'));
  assert.ok(output.includes('Immediate real counsel.'));
});

test('rejects empty live council questions', async () => {
  const result = await handleLiveCouncilRequest(new URL('http://localhost/api/council/live?mode=mock'), {
    write() {},
    end() {}
  });

  assert.equal(result.status, 400);
  assert.deepEqual(result.body, { error: 'question-required' });
});
