import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clearSessionHistory,
  appendConsultationExchange,
  buildConsultationFollowUpPrompt,
  createConsultationRecord,
  createSessionHistoryRecord,
  getRecentSessionHistory,
  getSavedConsultations,
  saveSessionHistoryRecord
} from '../../src/web/session-history.js';

test('creates public-safe session history record', () => {
  const record = createSessionHistoryRecord({
    question: 'What next?',
    mode: 'live-real',
    mentors: [{ name: 'Athena', role: 'Strategist', apiKey: 'sk-secret-value' }],
    transcript: [{ speakerName: 'Athena', utterance: 'Focus.', secretReference: 'op://Vault/Item/credential' }],
    synthesis: { mainAnswer: 'Focus now.' }
  });

  const serialized = JSON.stringify(record);
  assert.match(record.id, /^session-/);
  assert.equal(record.question, 'What next?');
  assert.deepEqual(record.mentors, [{ name: 'Athena', role: 'Strategist' }]);
  assert.equal(serialized.includes('sk-secret-value'), false);
  assert.equal(serialized.includes('op://'), false);
});

test('saves and lists recent sessions newest first', () => {
  const first = createSessionHistoryRecord({ question: 'First?', mode: 'mock', createdAt: '2026-01-01T00:00:00.000Z' });
  const second = createSessionHistoryRecord({ question: 'Second?', mode: 'mock', createdAt: '2026-01-02T00:00:00.000Z' });
  const state = saveSessionHistoryRecord(saveSessionHistoryRecord([], first), second);

  assert.deepEqual(
    getRecentSessionHistory(state).map((record) => record.question),
    ['Second?', 'First?']
  );
});

test('clears session history', () => {
  const record = createSessionHistoryRecord({ question: 'First?', mode: 'mock' });

  assert.deepEqual(clearSessionHistory([record]), []);
});

test('creates public-safe consultation records for later use', () => {
  const consultation = createConsultationRecord({
    title: 'Millionaire path',
    mode: 'live-real',
    mentors: [
      {
        id: 'athena',
        name: 'Athena',
        role: 'Strategist',
        personality: 'measured',
        speakingStyle: 'direct',
        participationBehavior: 'speaks when strategy matters',
        identity: { biography: 'A public mentor identity.', preferredQuestions: ['What matters now?'] },
        voice: { openAiVoice: 'marin', ttsEnabled: true },
        apiKey: 'sk-secret-value',
        providerId: 'openai',
        modelId: 'gpt-4.1'
      }
    ],
    sessionSettings: { maxTurns: 3, synthesisProviderId: 'openai', synthesisModelId: 'gpt-4.1', secretReference: 'op://Vault/Item/credential' },
    exchange: {
      question: 'How do I build wealth?',
      transcript: [{ speakerName: 'Athena', utterance: 'Talk to buyers.', resolvedSecret: 'sk-secret-value' }],
      synthesis: { mainAnswer: 'Start with buyer discovery.' }
    }
  });

  const serialized = JSON.stringify(consultation);
  assert.match(consultation.id, /^consultation-/);
  assert.equal(consultation.title, 'Millionaire path');
  assert.equal(consultation.exchanges.length, 1);
  assert.equal(consultation.mentors[0].providerId, 'openai');
  assert.equal(consultation.mentors[0].personality, 'measured');
  assert.equal(consultation.mentors[0].identity.biography, 'A public mentor identity.');
  assert.equal(consultation.mentors[0].voice.openAiVoice, 'marin');
  assert.equal(serialized.includes('sk-secret-value'), false);
  assert.equal(serialized.includes('op://'), false);
});

test('appends exchanges and lists saved consultations newest first', () => {
  const first = createConsultationRecord({
    title: 'First',
    createdAt: '2026-01-01T00:00:00.000Z',
    exchange: { question: 'First question?', synthesis: { mainAnswer: 'First answer.' } }
  });
  const updated = appendConsultationExchange(first, {
    question: 'Follow-up?',
    synthesis: { mainAnswer: 'Second answer.' },
    createdAt: '2026-01-03T00:00:00.000Z'
  });
  const second = createConsultationRecord({
    title: 'Second',
    createdAt: '2026-01-02T00:00:00.000Z',
    exchange: { question: 'Second question?' }
  });

  assert.equal(updated.exchanges.length, 2);
  assert.equal(updated.updatedAt, '2026-01-03T00:00:00.000Z');
  assert.deepEqual(getSavedConsultations([first, updated, second]).map((item) => item.title), ['First', 'Second']);
});

test('does not append the same consultation exchange twice', () => {
  const firstExchange = {
    id: 'exchange-fixed',
    question: 'What should I do first?',
    synthesis: { mainAnswer: 'Start with one buyer interview.' }
  };
  const consultation = createConsultationRecord({
    title: 'Business path',
    exchange: firstExchange
  });
  const updated = appendConsultationExchange(consultation, firstExchange);

  assert.equal(updated.exchanges.length, 1);
  assert.equal(updated.exchanges[0].id, 'exchange-fixed');
});

test('builds follow-up prompt from prior public consultation context', () => {
  const consultation = createConsultationRecord({
    title: 'Business path',
    exchange: {
      question: 'How do I find a useful product?',
      transcript: [
        { type: 'contribution', speakerName: 'Market Mentor', utterance: 'Interview people already paying.' },
        { type: 'abstention', speakerName: 'Quiet Mentor', reason: 'No new angle.' }
      ],
      synthesis: {
        mainAnswer: 'Start from paid pain, not technical curiosity.',
        nextActions: ['Interview five buyers.'],
        unresolvedQuestions: ['Which niche is reachable this week?']
      }
    }
  });

  const prompt = buildConsultationFollowUpPrompt(consultation, 'What should I ask them?');

  assert.match(prompt, /ongoing consultation/);
  assert.match(prompt, /How do I find a useful product\?/);
  assert.match(prompt, /Market Mentor: Interview people already paying\./);
  assert.match(prompt, /Start from paid pain/);
  assert.match(prompt, /Follow-up question: What should I ask them\?/);
});
