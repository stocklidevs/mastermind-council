import test from 'node:test';
import assert from 'node:assert/strict';

import { createCouncilSession, runCouncilSession } from '../../src/index.js';
import { abstentionCouncil, basicCouncil, dissentCouncil } from '../fixtures/mock-councils.js';
import {
  buildSessionViewModel,
  buildSynthesisViewModel,
  validateQuestion
} from '../../src/web/render.js';

test('rejects empty questions with a visible validation message', () => {
  assert.deepEqual(validateQuestion('   '), {
    valid: false,
    error: 'Bring a question to the council first.'
  });
});

test('maps a completed session into transcript and synthesis view models', () => {
  const session = runCouncilSession(
    createCouncilSession({
      question: 'What should I do first?',
      members: basicCouncil
    })
  );

  const viewModel = buildSessionViewModel(session);

  assert.equal(viewModel.question, 'What should I do first?');
  assert.equal(viewModel.rounds.length, 1);
  assert.ok(viewModel.rounds[0].items.some((item) => item.type === 'contribution'));
  assert.equal(viewModel.synthesis.agreementState, 'Consensus');
});

test('preserves contribution order and speaker labels', () => {
  const session = runCouncilSession(
    createCouncilSession({
      question: 'What should I do first?',
      members: basicCouncil
    })
  );

  const [round] = buildSessionViewModel(session).rounds;
  const speakers = round.items
    .filter((item) => item.type === 'contribution')
    .map((item) => item.speakerName);

  assert.deepEqual(speakers, ['Athena', 'Socrates', 'Hephaestus']);
});

test('maps abstentions as non-contribution transcript items', () => {
  const session = runCouncilSession(
    createCouncilSession({
      question: 'What should I do first?',
      members: abstentionCouncil
    })
  );

  const [round] = buildSessionViewModel(session).rounds;
  const abstention = round.items.find((item) => item.type === 'abstention');

  assert.equal(abstention.speakerName, 'Hermes');
  assert.equal(abstention.reason, 'No distinct point to add.');
});

test('keeps action fields separated from utterances', () => {
  const session = runCouncilSession(
    createCouncilSession({
      question: 'What should I do first?',
      members: basicCouncil
    })
  );

  const [round] = buildSessionViewModel(session).rounds;
  const contribution = round.items.find(
    (item) => item.type === 'contribution' && item.speakerName === 'Athena'
  );

  assert.equal(contribution.action, 'leans forward with calm focus');
  assert.equal(contribution.utterance, 'Start with the smallest reversible test.');
});

test('labels split decisions for synthesis display', () => {
  const session = runCouncilSession(
    createCouncilSession({
      question: 'Should I experiment or clarify?',
      members: dissentCouncil
    })
  );

  const synthesis = buildSynthesisViewModel(session.synthesis);

  assert.equal(synthesis.agreementState, 'Split decision');
  assert.equal(synthesis.tone, 'warning');
});

test('maps minority views, assumptions, and verification guidance', () => {
  const session = runCouncilSession(
    createCouncilSession({
      question: 'Should I experiment or clarify?',
      members: dissentCouncil
    })
  );

  const synthesis = buildSynthesisViewModel(session.synthesis);

  assert.equal(synthesis.minorityViews.length, 1);
  assert.ok(synthesis.assumptions.length > 0);
  assert.ok(synthesis.verificationGuidance.length > 0);
});
