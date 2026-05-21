import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyCouncilPreset,
  applyUserCouncilPreset,
  createUserCouncilPreset,
  deleteUserCouncilPreset,
  getCouncilPreset,
  getCouncilPresets,
  getUserCouncilPresets,
  saveUserCouncilPreset
} from '../../src/config/council-presets.js';

test('defines required council archetype presets', () => {
  const ids = getCouncilPresets().map((preset) => preset.id);

  assert.deepEqual(ids.sort(), ['economics', 'personal-growth', 'philosophy', 'raw-analysis', 'science', 'strategy']);
});

test('presets have unique mentor ids and deep identities', () => {
  for (const preset of getCouncilPresets()) {
    assert.ok(preset.mentors.length >= 3);
    assert.equal(new Set(preset.mentors.map((mentor) => mentor.id)).size, preset.mentors.length);
    for (const mentor of preset.mentors) {
      assert.ok(mentor.identity.biography);
      assert.ok(mentor.identity.strengths.length >= 1);
      assert.ok(mentor.identity.blindSpots.length >= 1);
    }
  }
});

test('frames historical presets as inspired archetypes', () => {
  const philosophy = getCouncilPreset('philosophy');

  assert.match(philosophy.description, /inspired/i);
  assert.ok(philosophy.mentors.every((mentor) => mentor.personaMode === 'archetype'));
  assert.ok(philosophy.mentors.every((mentor) => /inspired by/i.test(mentor.identity.biography)));
});

test('raw analysis preset avoids persona theater', () => {
  const raw = getCouncilPreset('raw-analysis');

  assert.ok(raw.mentors.every((mentor) => mentor.personaMode === 'raw'));
  assert.ok(raw.mentors.some((mentor) => mentor.role === 'Decomposer'));
  assert.equal(JSON.stringify(raw).includes('inspired by'), false);
});

test('applies a preset as cloned mentors', () => {
  const mentors = applyCouncilPreset('science');
  mentors[0].name = 'Changed';

  assert.equal(getCouncilPreset('science').mentors[0].name === 'Changed', false);
});

test('creates and saves a local user council preset', () => {
  const mentors = applyCouncilPreset('science');
  const preset = createUserCouncilPreset({ name: 'My Lab', mentors });
  const state = saveUserCouncilPreset([], preset);

  assert.match(preset.id, /^user-/);
  assert.equal(preset.source, 'user');
  assert.equal(state.length, 1);
  assert.equal(getUserCouncilPresets(state)[0].name, 'My Lab');
  assert.equal(JSON.stringify(state).includes('sk-secret'), false);
});

test('applies user council presets as clones', () => {
  const saved = saveUserCouncilPreset(
    [],
    createUserCouncilPreset({ name: 'My Strategy Room', mentors: applyCouncilPreset('strategy') })
  );
  const mentors = applyUserCouncilPreset(saved, saved[0].id);
  mentors[0].name = 'Changed';

  assert.notEqual(getUserCouncilPresets(saved)[0].mentors[0].name, 'Changed');
});

test('deletes user council presets without touching others', () => {
  const first = createUserCouncilPreset({ name: 'First', mentors: applyCouncilPreset('science') });
  const second = createUserCouncilPreset({ name: 'Second', mentors: applyCouncilPreset('philosophy') });
  const state = deleteUserCouncilPreset(saveUserCouncilPreset(saveUserCouncilPreset([], first), second), first.id);

  assert.deepEqual(state.map((preset) => preset.name), ['Second']);
});
