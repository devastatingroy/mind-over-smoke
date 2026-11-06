import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REFLECTION_ASPECTS,
  defaultAspectIndex,
  claimReflectionPrompt,
  localDayKey,
  readReflectionState,
  writeReflectionState
} from '../src/utils/reflection.js';

test('one aspect is selected deterministically for the same local day', () => {
  const day = localDayKey(new Date(2026, 10, 6, 15));
  assert.equal(day, '2026-11-06');
  assert.equal(defaultAspectIndex(day), defaultAspectIndex(day));
  assert.ok(defaultAspectIndex(day) >= 0);
  assert.ok(defaultAspectIndex(day) < REFLECTION_ASPECTS.length);
  assert.notEqual(defaultAspectIndex(day), defaultAspectIndex('2026-11-07'));
});

test('reflection notes are stored separately and malformed records are ignored', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
  const state = { selectedDay: '2026-11-06', selectedAspect: 2, lastPromptAspect: null, lastSosPromptDay: '', notes: [{ day: '2026-11-06', aspect: '关系', text: '给朋友留点时间' }] };
  assert.equal(writeReflectionState(state, storage), true);
  assert.deepEqual(readReflectionState(storage), state);
  values.set('mind_over_smoke_reflections_v1', JSON.stringify({ ...state, notes: [...state.notes, { day: '2026-11-06', aspect: 'other', text: 'ignored' }] }));
  assert.deepEqual(readReflectionState(storage).notes, state.notes);
});

test('practice rotates all five aspects and SOS appears only once per local day', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
  const today = new Date(2026, 10, 6, 10);
  const aspects = Array.from({ length: 5 }, () => claimReflectionPrompt('practice', today, storage).aspectIndex);
  assert.equal(new Set(aspects).size, 5);
  const firstSos = claimReflectionPrompt('sos', today, storage);
  assert.ok(firstSos);
  assert.equal(claimReflectionPrompt('sos', today, storage), null);
  assert.notEqual(claimReflectionPrompt('sos', new Date(2026, 10, 7, 10), storage), null);
});
