import test from 'node:test';
import assert from 'node:assert/strict';

import { createRealMentors } from '../../src/council/real-mentors.js';
import { getProviderSmokeTargets } from '../../src/providers/smoke-config.js';

test('includes Novita as fourth real council mentor', () => {
  const mentors = createRealMentors(getProviderSmokeTargets());

  assert.equal(mentors.length, 4);
  assert.equal(mentors[3].name, 'Hypatia');
  assert.equal(mentors[3].providerId, 'novita');
  assert.equal(mentors[3].modelId, 'meta-llama/llama-3.1-8b-instruct');
});
