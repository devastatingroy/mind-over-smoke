import test from 'node:test';
import assert from 'node:assert/strict';
import { createChallenge, getChallengeView, recordReport } from '../src/utils/challenge.js';

const at = (date) => Date.parse(date);

test('challenge starts on the next full calendar day in the chosen time zone', () => {
  const challenge = createChallenge(at('2026-11-05T12:00:00Z'), 'Asia/Shanghai');
  assert.equal(getChallengeView(challenge, at('2026-11-05T15:59:59Z')).currentDay, 0);
  assert.equal(getChallengeView(challenge, at('2026-11-05T16:00:00Z')).currentDay, 1);
  assert.equal(getChallengeView(challenge, at('2026-11-05T16:00:00Z')).days[0].status, 'active');
  assert.equal(getChallengeView(challenge, at('2026-11-06T16:00:00Z')).days[0].status, 'reportable');
});

test('report window lasts two full calendar days and reports are unique', () => {
  const challenge = createChallenge(at('2026-11-05T12:00:00Z'), 'Asia/Shanghai');
  const open = at('2026-11-06T16:00:00Z');
  assert.throws(() => recordReport(challenge, 1, 'smoke_free', open - 1));
  const reported = recordReport(challenge, 1, 'smoke_free', open);
  assert.equal(getChallengeView(reported, open).smokeFreeCount, 1);
  assert.throws(() => recordReport(reported, 1, 'smoke_free', open));
  assert.equal(getChallengeView(challenge, at('2026-11-08T15:59:59Z')).days[0].status, 'reportable');
  assert.equal(getChallengeView(challenge, at('2026-11-08T16:00:00Z')).days[0].status, 'expired');
});

test('a smoked day does not block the next day', () => {
  const challenge = createChallenge(at('2026-11-05T12:00:00Z'), 'Asia/Shanghai');
  const afterDayTwo = at('2026-11-07T16:00:00Z');
  const first = recordReport(challenge, 1, 'smoked', afterDayTwo);
  const second = recordReport(first, 2, 'smoke_free', afterDayTwo);
  assert.equal(getChallengeView(second, afterDayTwo).smokeFreeCount, 1);
  assert.equal(getChallengeView(second, afterDayTwo).reportedCount, 2);
});

test('calendar-day arithmetic survives a daylight saving switch', () => {
  const challenge = createChallenge(at('2026-10-31T16:00:00Z'), 'America/New_York');
  assert.equal(getChallengeView(challenge, at('2026-11-02T05:00:00Z')).days[0].status, 'reportable');
});
