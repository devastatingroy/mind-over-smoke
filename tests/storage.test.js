import test from 'node:test';
import assert from 'node:assert/strict';
import { getInitialState, saveState } from '../src/utils/storage.js';

test('legacy quiz completions do not become smoke-free reports', () => {
  const values = new Map([['mind_over_smoke_state_v1', JSON.stringify({
    completedDays: Array(14).fill(true),
    currentDay: 14,
    totalCravingsIntercepted: 9,
    savedVocab: [{ id: 'kept' }]
  })]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
  const state = getInitialState();
  assert.equal(state.challenge, null);
  assert.equal(state.totalCravingsIntercepted, 9);
  assert.deepEqual(state.savedVocab, [{ id: 'kept' }]);
  assert.equal('completedDays' in state, false);
  saveState(state);
  assert.ok(values.has('mind_over_smoke_state_v2'));
});
