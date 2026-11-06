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
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note) => note && typeof note.day === 'string' && REFLECTION_ASPECTS.includes(note.aspect) && typeof note.text === 'string')
        : []
    };
  } catch {
    return { selectedDay: '', selectedAspect: null, notes: [] };
  }
}

export function writeReflectionState(state, storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
