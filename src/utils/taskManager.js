import economistQuestions from '../data/questions.json';
import tangPoetryTasks from '../data/tang_poetry.json';
import tangTranslationTasks from '../data/tang_translation.json';
import physicalTasks from '../data/physical_tasks.json';
import breathingTasks from '../data/breathing_tasks.json';

// Normalize Economist questions to include category
const normalizedEconomistQuestions = economistQuestions.map((q) => ({
  ...q,
  category: 'economist'
}));

// All combined tasks
export const allTasks = [
  ...tangTranslationTasks,
  ...physicalTasks,
  ...tangPoetryTasks,
  ...normalizedEconomistQuestions,
  ...breathingTasks
];

export const taskStats = {
  total: allTasks.length,
  translation: tangTranslationTasks.length,
  economist: normalizedEconomistQuestions.length,
  poetry: tangPoetryTasks.length,
  physical: physicalTasks.length,
  breathing: breathingTasks.length
};

/**
 * Generate randomized tasks for a session.
 * For 'sos' mode (3 tasks):
 * Strategically guarantees high multi-modal variety:
 * 1. Somatic physical shock (e.g. 10 push-ups, plank, shadowboxing - zero knee load)
 * 2. Medium Cognitive Load: English-to-Tang reverse reconstruction (中等认知挑战 · 英文唐诗逆向还原)
 * 3. Tang Poetry Recitation or The Economist satirical reasoning
 */
export function generateSessionTasks(mode = 'sos') {
  if (mode === 'sos') {
    const randomPhys = physicalTasks[Math.floor(Math.random() * physicalTasks.length)];
    const randomTrans = tangTranslationTasks[Math.floor(Math.random() * tangTranslationTasks.length)];
    // Pick either classic Tang recitation or Economist reading for the 3rd task
    const pool3 = Math.random() > 0.5 ? tangPoetryTasks : normalizedEconomistQuestions;
    const randomThird = pool3[Math.floor(Math.random() * pool3.length)];

    // Shuffle the order so it feels unpredictable and fresh every time
    const bundle = [randomPhys, randomTrans, randomThird].sort(() => 0.5 - Math.random());
    return bundle;
  }

  // Practice mode: pick 5 random tasks from the entire pool
  const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

/**
 * Swap a specific task with another random task from the pool.
 * Useful when a user cannot do push-ups (e.g., in an office/train) or wants a different challenge.
 */
export function getReplacementTask(currentTask, existingTaskIds = []) {
  // Try to find tasks from other categories or different from current
  const candidates = allTasks.filter(
    (t) => t.id !== currentTask.id && !existingTaskIds.includes(t.id)
  );

  if (candidates.length === 0) return currentTask;

  // Prefer a different category if possible
  const differentCategoryCandidates = candidates.filter(
    (t) => t.category !== currentTask.category
  );

  const pool = differentCategoryCandidates.length > 0 ? differentCategoryCandidates : candidates;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
