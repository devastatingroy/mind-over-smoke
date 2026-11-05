import economistQuestions from '../data/questions.json';
import tangTranslationTasks from '../data/tang_translation.json';
import physicalTasks from '../data/physical_tasks.json';
import breathingTasks from '../data/breathing_tasks.json';

// Normalize Economist questions to include category
const normalizedEconomistQuestions = economistQuestions.map((q) => ({
  ...q,
  category: 'economist'
}));

// All combined high-cognitive & somatic tasks (彻底移除纯中文古诗单字填空傻瓜题)
export const allTasks = [
  ...tangTranslationTasks,
  ...normalizedEconomistQuestions,
  ...physicalTasks,
  ...breathingTasks
];

export const taskStats = {
  total: allTasks.length,
  translation: tangTranslationTasks.length,
  economist: normalizedEconomistQuestions.length,
  physical: physicalTasks.length,
  breathing: breathingTasks.length
};

/**
 * Generate randomized tasks for a session.
 * For 'sos' mode (3 tasks):
 * Strategically guarantees high multi-modal variety without trivial cloze:
 * 1. Somatic physical shock or Vagus calming (10 push-ups, plank, or 4-7-8 breathing)
 * 2. Medium Cognitive Load: Translation challenge (英译逆向还原 或 汉诗挑名译，零中文剧透)
 * 3. The Economist Satirical Reasoning (经济学人深度反讽精读与词汇)
 */
export function generateSessionTasks(mode = 'sos') {
  if (mode === 'sos') {
    // Pick somatic or breathing task
    const somaticPool = Math.random() > 0.4 ? physicalTasks : breathingTasks;
    const randomSomatic = somaticPool[Math.floor(Math.random() * somaticPool.length)];
    
    // Pick translation challenge (en_to_zh or zh_to_en)
    const randomTrans = tangTranslationTasks[Math.floor(Math.random() * tangTranslationTasks.length)];
    
    // Pick Economist reasoning
    const randomEconomist = normalizedEconomistQuestions[Math.floor(Math.random() * normalizedEconomistQuestions.length)];

    // Shuffle the 3 tasks
    const bundle = [randomSomatic, randomTrans, randomEconomist].sort(() => 0.5 - Math.random());
    return bundle;
  }

  // Practice mode: pick 5 random tasks from the pool
  const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

/**
 * Swap a specific task with another random task from the pool.
 */
export function getReplacementTask(currentTask, existingTaskIds = []) {
  const candidates = allTasks.filter(
    (t) => t.id !== currentTask.id && !existingTaskIds.includes(t.id)
  );

  if (candidates.length === 0) return currentTask;

  const differentCategoryCandidates = candidates.filter(
    (t) => t.category !== currentTask.category
  );

  const pool = differentCategoryCandidates.length > 0 ? differentCategoryCandidates : candidates;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
