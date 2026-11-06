export const REFLECTION_ASPECTS = ['工作', '身体', '关系', '休息', '成长'];

const STORAGE_KEY = 'mind_over_smoke_reflections_v1';

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function defaultAspectIndex(dayKey) {
  const dayNumber = Math.floor(Date.parse(`${dayKey}T00:00:00Z`) / 86_400_000);
  return dayNumber % REFLECTION_ASPECTS.length;
}

export function readReflectionState(storage = localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') throw new Error('No saved reflections');
    return {
      selectedDay: typeof parsed.selectedDay === 'string' ? parsed.selectedDay : '',
      selectedAspect: Number.isInteger(parsed.selectedAspect) && parsed.selectedAspect >= 0 && parsed.selectedAspect < REFLECTION_ASPECTS.length
        ? parsed.selectedAspect
        : null,
      lastPromptAspect: Number.isInteger(parsed.lastPromptAspect) && parsed.lastPromptAspect >= 0 && parsed.lastPromptAspect < REFLECTION_ASPECTS.length
        ? parsed.lastPromptAspect
        : null,
      lastSosPromptDay: typeof parsed.lastSosPromptDay === 'string' ? parsed.lastSosPromptDay : '',
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note) => note && typeof note.day === 'string' && REFLECTION_ASPECTS.includes(note.aspect) && typeof note.text === 'string')
        : []
    };
  } catch {
    return { selectedDay: '', selectedAspect: null, lastPromptAspect: null, lastSosPromptDay: '', notes: [] };
  }
}

export function writeReflectionState(state, storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined' && storage === window.localStorage) {
      window.dispatchEvent(new Event('mind-over-smoke-reflection-updated'));
    }
    return true;
  } catch {
    return false;
  }
}

export function claimReflectionPrompt(mode, date = new Date(), storage = localStorage) {
  const day = localDayKey(date);
  const state = readReflectionState(storage);
  if (mode === 'sos' && state.lastSosPromptDay === day) return null;
  const aspectIndex = state.lastPromptAspect === null
    ? defaultAspectIndex(day)
    : (state.lastPromptAspect + 1) % REFLECTION_ASPECTS.length;
  writeReflectionState({
    ...state,
    lastPromptAspect: aspectIndex,
    lastSosPromptDay: mode === 'sos' ? day : state.lastSosPromptDay
  }, storage);
  return { aspectIndex };
}
