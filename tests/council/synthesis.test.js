import test from 'node:test';
import assert from 'node:assert/strict';

import { createCouncilSession, runCouncilSession } from '../../src/index.js';
import { basicCouncil, dissentCouncil, roundCapCouncil } from '../fixtures/mock-councils.js';

test('labels aligned mock positions as consensus', () => {
  const session = createCouncilSession({
    question: 'How should we proceed?',
    members: basicCouncil
  });

  const result = runCouncilSession(session);

  assert.equal(result.synthesis.agreementState, 'consensus');
  assert.equal(result.synthesis.closureReason, 'consensus');
  assert.deepEqual(result.synthesis.minorityViews, []);
});

test('preserves minority view for a split decision', () => {
  const session = createCouncilSession({
    question: 'Should I experiment or clarify?',
    members: dissentCouncil
  });

  const result = runCouncilSession(session);

  assert.equal(result.synthesis.agreementState, 'split-decision');
  assert.equal(result.synthesis.closureReason, 'split-decision');
  assert.equal(result.synthesis.minorityViews.length, 1);
  assert.match(result.synthesis.minorityViews[0], /clarify/i);
});

test('names max-round closure and unresolved assumptions', () => {
  const session = createCouncilSession({
    question: 'Should we keep debating?',
    members: roundCapCouncil,
    options: { maxRounds: 1 }
  });

  const result = runCouncilSession(session);

  assert.equal(result.synthesis.closureReason, 'max-rounds');
  assert.ok(result.synthesis.assumptions.some((item) => /unresolved/i.test(item)));
});
