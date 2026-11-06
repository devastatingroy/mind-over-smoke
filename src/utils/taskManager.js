import economistQuestions from '../data/questions.json';
import economistTranslationTasks from '../data/economist_translation.json';
import tangTranslationTasks from '../data/tang_translation.json';
import physicalTasks from '../data/physical_tasks.json';
import breathingTasks from '../data/breathing_tasks.json';
import { REFLECTION_ASPECTS } from './reflection';

const ROTATION_KEY = 'mind_over_smoke_task_rotation_v1';
const normalizedEconomistQuestions = economistQuestions.map((q) => ({ ...q, category: 'economist' }));
const economistTasks = [...normalizedEconomistQuestions, ...economistTranslationTasks];

export const reflectionTasks = REFLECTION_ASPECTS.map((aspect, aspectIndex) => ({
  id: `reflection_${aspectIndex}`,
  category: 'reflection',
  type: 'reflection',
  aspectIndex,
  theme: `生活的一角 · ${aspect}`,
  title: '你真的没有其他事可做了吗？'
}));

const thirdPools = {
  breathing: breathingTasks,
  poetry_en_to_zh: tangTranslationTasks.filter((task) => task.mode === 'en_to_zh'),
  poetry_zh_to_en: tangTranslationTasks.filter((task) => task.mode === 'zh_to_en'),
  economist_cloze: normalizedEconomistQuestions,
  economist_zh_to_en: economistTranslationTasks
};
const practicePools = { physical: physicalTasks, ...thirdPools };

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function rotationStorage(storage) {
  return storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : storage;
}

function readRotation(storage) {
  try {
    const value = JSON.parse(storage?.getItem(ROTATION_KEY) || 'null');
    if (value && typeof value === 'object' && value.bags && typeof value.bags === 'object') return value;
  } catch { /* Start a new cycle if storage is unavailable or damaged. */ }
  return { bags: {} };
}

function saveRotation(storage, state) {
  try { storage?.setItem(ROTATION_KEY, JSON.stringify(state)); } catch { /* The session still works without persistence. */ }
}

function drawFromBag(state, key, values) {
  if (!values.length) return null;
  const remaining = new Set(values);
  let bag = Array.isArray(state.bags[key]) ? state.bags[key].filter((value) => remaining.has(value)) : [];
  if (!bag.length) bag = shuffled(values);
  const selected = bag.shift();
  state.bags[key] = bag;
  return selected;
}

function thirdFamily(task) {
  if (task.category === 'reflection') return 'reflection';
  if (task.category === 'physical') return 'physical';
  if (task.category === 'breathing') return 'breathing';
  if (task.category === 'translation') return `poetry_${task.mode}`;
  if (task.type === 'zh_to_en') return 'economist_zh_to_en';
  return 'economist_cloze';
}

function drawFamilyTask(state, family, excludedIds = []) {
  const candidates = practicePools[family].filter((task) => !excludedIds.includes(task.id));
  const id = drawFromBag(state, `tasks:${family}:ids`, candidates.map((task) => task.id));
  return candidates.find((task) => task.id === id);
}

function drawThirdTask(state, excludedIds = [], excludedFamily = null) {
  const families = Object.keys(thirdPools).filter((family) =>
    family !== excludedFamily && thirdPools[family].some((task) => !excludedIds.includes(task.id))
  );
  const family = drawFromBag(state, 'sos:families', families);
  if (!family) return null;
  return drawFamilyTask(state, family, excludedIds);
}

export const allTasks = [
  ...tangTranslationTasks,
  ...economistTasks,
  ...physicalTasks,
  ...breathingTasks,
  ...reflectionTasks
];

export const taskStats = {
  total: allTasks.length,
  translation: tangTranslationTasks.length,
  economist: economistTasks.length,
  economistTranslation: economistTranslationTasks.length,
  physical: physicalTasks.length,
  breathing: breathingTasks.length,
  reflection: reflectionTasks.length
};

// One physical action, one reflection and one rotating third type per SOS session.
// Type and question bags persist across sessions until each cycle is exhausted.
export function generateSessionTasks(mode = 'sos', { reflectionAspectIndex, storage } = {}) {
  const chosenStorage = rotationStorage(storage);
  const state = readRotation(chosenStorage);
  const reflectionId = reflectionAspectIndex === undefined
    ? drawFromBag(state, 'reflection:ids', reflectionTasks.map((task) => task.id))
    : null;
  const reflection = reflectionTasks[reflectionAspectIndex]
    || reflectionTasks.find((task) => task.id === reflectionId);

  if (mode === 'sos') {
    const physical = drawFamilyTask(state, 'physical');
    const third = drawThirdTask(state, [physical.id, reflection.id]);
    saveRotation(chosenStorage, state);
    return shuffled([physical, reflection, third]);
  }

  const economistFamily = drawFromBag(state, 'practice:economist:families', ['economist_cloze', 'economist_zh_to_en']);
  const tasks = [reflection, drawFamilyTask(state, economistFamily)];
  const usedFamilies = new Set([economistFamily]);
  for (let index = 0; index < 3; index++) {
    const family = drawFromBag(state, 'practice:other:families', Object.keys(practicePools).filter((item) => !usedFamilies.has(item)));
    tasks.push(drawFamilyTask(state, family, tasks.map((task) => task.id)));
    usedFamilies.add(family);
  }
  saveRotation(chosenStorage, state);
  return shuffled(tasks);
}

export function getReplacementTask(currentTask, existingTaskIds = [], mode = 'practice', { storage } = {}) {
  if (currentTask.category === 'reflection') {
    const alternatives = reflectionTasks.filter((task) => task.id !== currentTask.id && !existingTaskIds.includes(task.id));
    return alternatives.length ? alternatives[Math.floor(Math.random() * alternatives.length)] : currentTask;
  }

  if (mode === 'sos') {
    const chosenStorage = rotationStorage(storage);
    const state = readRotation(chosenStorage);
    if (currentTask.category === 'physical') {
      const candidates = physicalTasks.filter((task) => task.id !== currentTask.id && !existingTaskIds.includes(task.id));
      const id = drawFromBag(state, 'tasks:physical:ids', candidates.map((task) => task.id));
      saveRotation(chosenStorage, state);
      return candidates.find((task) => task.id === id) || currentTask;
    }
    const replacement = drawThirdTask(state, [...existingTaskIds, currentTask.id], thirdFamily(currentTask));
    saveRotation(chosenStorage, state);
    return replacement || currentTask;
  }

  const chosenStorage = rotationStorage(storage);
  const state = readRotation(chosenStorage);
  const existing = existingTaskIds.map((id) => allTasks.find((task) => task.id === id)).filter(Boolean);
  const mustKeepEconomist = currentTask.category === 'economist' && existing.filter((task) => task.category === 'economist').length === 1;
  const occupiedFamilies = new Set(existing.filter((task) => task.id !== currentTask.id).map(thirdFamily));
  let families = Object.keys(practicePools).filter((family) =>
    (!mustKeepEconomist || family.startsWith('economist_')) &&
    family !== thirdFamily(currentTask) && !occupiedFamilies.has(family) &&
    practicePools[family].some((task) => task.id !== currentTask.id && !existingTaskIds.includes(task.id))
  );
  if (!families.length) families = Object.keys(practicePools).filter((family) =>
    (!mustKeepEconomist || family.startsWith('economist_')) &&
    practicePools[family].some((task) => task.id !== currentTask.id && !existingTaskIds.includes(task.id))
  );
  const family = drawFromBag(state, 'practice:swap:families', families);
  const replacement = family ? drawFamilyTask(state, family, [...existingTaskIds, currentTask.id]) : currentTask;
  saveRotation(chosenStorage, state);
  return replacement || currentTask;
}
