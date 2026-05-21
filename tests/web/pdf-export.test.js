import test from 'node:test';
import assert from 'node:assert/strict';

import { buildConsultationPdfHtml, buildCurrentConsultationExport } from '../../src/web/pdf-export.js';

test('builds printable consultation HTML with transcript and synthesis', () => {
  const html = buildConsultationPdfHtml({
    title: 'Millionaire path <script>',
    mode: 'live-real',
    updatedAt: '2026-05-20T12:00:00.000Z',
    mentors: [{ name: 'Athena', role: 'Strategist', providerId: 'openai', modelId: 'gpt-5.5' }],
    exchanges: [
      {
        question: 'What should I build?',
        transcript: [
          {
            speakerName: 'Athena',
            preAction: 'Athena lifts the gold stick.',
            utterance: 'Talk to buyers before building.',
            postAction: 'Athena returns the stick.'
          }
        ],
        synthesis: {
          mainAnswer: 'Start with buyer discovery.',
          nextActions: ['Interview ten buyers.'],
          mentorGrounding: [{ mentorName: 'Athena', point: 'Buyer discovery first.' }]
        }
      }
    ]
  });

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /Save as PDF/i);
  assert.match(html, /Millionaire path &lt;script&gt;/);
  assert.match(html, /Athena lifts the gold stick/);
  assert.match(html, /Talk to buyers before building/);
  assert.match(html, /Start with buyer discovery/);
  assert.match(html, /Interview ten buyers/);
  assert.match(html, /Buyer discovery first/);
  assert.doesNotMatch(html, /<script>$/);
});

test('builds a current-session export record from latest exchange', () => {
  const record = buildCurrentConsultationExport({
    mode: 'live-real',
    mentors: [{ id: 'athena', name: 'Athena', role: 'Strategist', providerId: 'openai', modelId: 'gpt-5.5' }],
    sessionSettings: { maxTurns: 3, synthesisProviderId: 'openai', synthesisModelId: 'gpt-5.5' },
    exchange: {
      question: 'What next?',
      transcript: [{ speakerName: 'Athena', utterance: 'Begin.' }],
      synthesis: { mainAnswer: 'Begin small.' }
    }
  });

  assert.equal(record.title, 'What next?');
  assert.equal(record.mode, 'live-real');
  assert.equal(record.mentors[0].modelId, 'gpt-5.5');
  assert.equal(record.exchanges.length, 1);
});
