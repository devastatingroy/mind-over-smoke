const DAY_MS = 24 * 60 * 60 * 1000;
export const CHALLENGE_DAYS = 14;

export function localDaySerial(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(timestamp);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day)) / DAY_MS;
}

export function dateLabel(serial) {
  return new Date(serial * DAY_MS).toISOString().slice(0, 10);
}

export function createChallenge(now = Date.now(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC') {
  return { startDay: localDaySerial(now, timeZone) + 1, timeZone, reports: {} };
}

export function getChallengeView(challenge, now = Date.now()) {
  if (!challenge) return null;
  const today = localDaySerial(now, challenge.timeZone);
  const days = Array.from({ length: CHALLENGE_DAYS }, (_, index) => {
    const number = index + 1;
    const day = challenge.startDay + index;
    const report = challenge.reports?.[number];
    const open = day + 1;
    const close = open + 2;
    const status = report || (today < day ? 'upcoming' : today === day ? 'active' : today >= close ? 'expired' : 'reportable');
    return { number, date: dateLabel(day), deadline: dateLabel(close - 1), status };
  });
  return {
    days,
    currentDay: Math.max(0, Math.min(CHALLENGE_DAYS, today - challenge.startDay + 1)),
    nextReport: days.find(({ status }) => status === 'reportable') || null,
    smokeFreeCount: days.filter(({ status }) => status === 'smoke_free').length,
    reportedCount: days.filter(({ status }) => status === 'smoke_free' || status === 'smoked').length
  };
}

export function recordReport(challenge, dayNumber, result, now = Date.now()) {
  if (!['smoke_free', 'smoked'].includes(result)) throw new Error('Invalid report');
  const day = getChallengeView(challenge, now)?.days[dayNumber - 1];
  if (!day || day.status !== 'reportable') throw new Error('This day is not available to report');
  return { ...challenge, reports: { ...challenge.reports, [dayNumber]: result } };
}
