import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultMentors,
  createMentorIdentityDraft,
  updateMentorCharacteristics,
  updateMentorModel
} from '../../src/config/mentor-config.js';
import {
  addCustomProvider,
  createProviderCatalogState,
  getEffectiveProviders
} from '../../src/config/provider-catalog.js';

test('creates default mentors with provider and model selections', () => {
  const mentors = createDefaultMentors();

  assert.ok(mentors.length >= 3);
  assert.ok(mentors.every((mentor) => mentor.providerId && mentor.modelId));
});

test('updates mentor provider and model together', () => {
  const [mentor] = createDefaultMentors();
  const updated = updateMentorModel(mentor, {
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-20250514'
  });

  assert.equal(updated.providerId, 'anthropic');
  assert.equal(updated.modelId, 'claude-sonnet-4-20250514');
});

test('updates mentor model using a custom provider catalog', () => {
  const [mentor] = createDefaultMentors();
  const catalogState = addCustomProvider(createProviderCatalogState(), {
    id: 'x-router',
    name: 'Experimental Router',
    baseUrl: 'https://router.example/v1',
    modelId: 'router-large'
  });

  const updated = updateMentorModel(
    mentor,
    { providerId: 'x-router', modelId: 'router-large' },
    getEffectiveProviders(catalogState)
  );

  assert.equal(updated.providerId, 'x-router');
  assert.equal(updated.modelId, 'router-large');
});

test('updates mentor public characteristics', () => {
  const [mentor] = createDefaultMentors();
  const updated = updateMentorCharacteristics(mentor, {
    name: 'Minerva',
    role: 'Strategic Editor',
    personality: 'precise, calm, and allergic to vague plans',
    speakingStyle: 'brief and surgical',
    participationBehavior: 'speaks when the plan lacks a test'
  });

  assert.equal(updated.name, 'Minerva');
  assert.equal(updated.role, 'Strategic Editor');
  assert.match(updated.personality, /precise/);
  assert.match(updated.speakingStyle, /brief/);
  assert.match(updated.participationBehavior, /lacks a test/);
});

test('preserves future voice metadata', () => {
  const [mentor] = createDefaultMentors();
  const updated = updateMentorCharacteristics(mentor, {
    voice: {
      voiceLabel: 'calm alto',
      pace: 'balanced',
      tone: 'analytical',
      enabledLater: true
    }
  });

  assert.equal(updated.voice.voiceLabel, 'calm alto');
  assert.equal(updated.voice.enabledLater, true);
});

test('creates default mentors with deep public identities', () => {
  const mentors = createDefaultMentors();

  for (const mentor of mentors) {
    assert.ok(mentor.identity.biography);
    assert.ok(mentor.identity.operatingPrinciples.length >= 2);
    assert.ok(mentor.identity.strengths.length >= 2);
    assert.ok(mentor.identity.blindSpots.length >= 1);
    assert.ok(mentor.identity.ritualPresence);
  }
});

test('updates mentor deep identity without replacing other identity fields', () => {
  const [mentor] = createDefaultMentors();
  const updated = updateMentorCharacteristics(mentor, {
    identity: {
      ritualPresence: 'She pauses before speaking, making the room quieter.'
    }
  });

  assert.equal(updated.identity.ritualPresence, 'She pauses before speaking, making the room quieter.');
  assert.equal(updated.identity.biography, mentor.identity.biography);
});

test('creates a deterministic local mentor identity draft', () => {
  const draft = createMentorIdentityDraft({
    name: 'Ariadne',
    role: 'Pattern Finder',
    archetype: 'strategic navigator'
  });

  assert.equal(draft.name, 'Ariadne');
  assert.equal(draft.role, 'Pattern Finder');
  assert.match(draft.identity.biography, /strategic navigator/);
  assert.equal(JSON.stringify(draft).includes('API_KEY'), false);
  assert.equal(draft.providerId, undefined);
});
