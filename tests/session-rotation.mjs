import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';

const translationBank = JSON.parse(fs.readFileSync('src/data/economist_translation.json', 'utf8'));
const filmQuotes = JSON.parse(fs.readFileSync('src/data/film_quotes.json', 'utf8'));
const microTasks = JSON.parse(fs.readFileSync('src/data/micro_tasks.json', 'utf8'));
assert.equal(translationBank.length, 30);
assert.equal(new Set(translationBank.map((task) => task.id)).size, 30);
assert.equal(new Set(translationBank.map((task) => task.chinese_claim)).size, 30);
assert.equal(filmQuotes.length, 27);
assert.equal(new Set(filmQuotes.map((task) => task.id)).size, filmQuotes.length);
assert.equal(microTasks.length, 8);
assert.equal(new Set(microTasks.map((task) => task.id)).size, microTasks.length);
for (const task of microTasks) {
  assert.ok(task.title && task.prompt && task.example, `${task.id} needs a concrete prompt and example`);
}
for (const task of filmQuotes) {
  assert.ok(['en', 'zh'].includes(task.language));
  assert.ok(task.film && task.quote && task.sourceUrl && task.sourceType);
  if (task.language === 'en') assert.ok(task.quote.split(/\s+/).length <= 25, `${task.id} is too long for 10 seconds`);
}
for (const task of translationBank) {
  for (const field of ['theme', 'chinese_claim', 'prompt', 'scaffold_hint', 'reference_translation', 'analysis', 'punchline']) {
    assert.ok(task[field]?.trim(), `${task.id}.${field} is missing`);
  }
  assert.equal(task.key_phrases?.length, 2, `${task.id} needs two expression mappings`);
}

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
const storageData = new Map();
const storage = {
  getItem: (key) => storageData.get(key) ?? null,
  setItem: (key, value) => storageData.set(key, value)
};

function family(task) {
  if (task.category === 'physical') return 'physical';
  if (task.category === 'reflection') return 'reflection';
  if (task.category === 'breathing') return 'breathing';
  if (task.category === 'film_quote') return 'film_quote';
  if (task.category === 'visual_imagery') return 'visual_imagery';
  if (task.category === 'observation_judgment') return 'observation_judgment';
  if (task.category === 'translation') return `poetry_${task.mode}`;
  return task.type === 'zh_to_en' ? 'economist_zh_to_en' : 'economist_cloze';
}

try {
  const { generateSessionTasks, getReplacementTask, taskStats } = await server.ssrLoadModule('/src/utils/taskManager.js');
  assert.equal(taskStats.economistTranslation, 30);
  assert.equal(taskStats.reflection, 5);
  assert.equal(taskStats.filmQuote, 27);
  assert.equal(taskStats.total, 275);
  assert.equal(taskStats.visualImagery, 3);
  assert.equal(taskStats.observationJudgment, 5);

  const firstSevenFamilies = new Set();
  const firstFourPhysical = new Set();
  const translatedIds = [];
  const filmIds = [];
  let firstSession;
  for (let index = 0; index < 210; index++) {
    const tasks = generateSessionTasks('sos', { reflectionAspectIndex: index % 5, storage });
    assert.equal(tasks.length, 3);
    assert.equal(new Set(tasks.map((task) => task.id)).size, 3);
    const physical = tasks.filter((task) => task.category === 'physical');
    const reflection = tasks.filter((task) => task.category === 'reflection');
    assert.equal(physical.length, 1);
    assert.equal(reflection.length, 1);
    assert.equal(reflection[0].aspectIndex, index % 5);
    const third = tasks.find((task) => !['physical', 'reflection'].includes(task.category));
    if (index < 7) firstSevenFamilies.add(family(third));
    if (index < 4) firstFourPhysical.add(physical[0].id);
    if (third.type === 'zh_to_en') translatedIds.push(third.id);
    if (third.category === 'film_quote') filmIds.push(third.id);
    if (index === 0) firstSession = { physical: physical[0], reflection: reflection[0], third, ids: tasks.map((task) => task.id) };
  }
  assert.equal(firstSevenFamilies.size, 7, 'Each third-task type appears once in the first cycle');
  assert.equal(firstFourPhysical.size, 4, 'Physical tasks cycle before repeating');
  assert.equal(new Set(translatedIds.slice(0, 30)).size, 30, 'All 30 new-form questions rotate before repeating');
  assert.equal(new Set(filmIds.slice(0, 25)).size, 25, 'Film lines rotate before repeating');
  let displayed = firstSession.physical;
  const seenFamilies = [];
  for (let step = 0; step < 9; step++) {
    const next = getReplacementTask(displayed, firstSession.ids, 'sos', { storage });
    assert.notEqual(family(next), family(displayed));
    seenFamilies.push(family(next));
    displayed = next;
  }
  assert.equal(new Set(seenFamilies).size, 9, 'Nine consecutive skips cover every SOS format');
  assert.equal(family(getReplacementTask(firstSession.reflection, firstSession.ids, 'sos', { storage })), 'breathing');
  assert.equal(family(getReplacementTask(firstSession.reflection, [firstSession.reflection.id, firstSession.physical.id], 'sos', { storage })), 'breathing', 'Completed families do not constrain the next format');
  const breath = getReplacementTask(firstSession.reflection, firstSession.ids, 'sos', { storage });
  assert.equal(family(getReplacementTask(firstSession.reflection, [...firstSession.ids, breath.id], 'sos', { storage })), 'breathing', 'A one-item format stays available after completion');

  const practice = generateSessionTasks('practice', { reflectionAspectIndex: 2, storage });
  assert.equal(practice.length, 5);
  assert.equal(practice.filter((task) => task.category === 'reflection').length, 1);
  assert.ok(practice.some((task) => task.category === 'economist'));
  assert.equal(new Set(practice.filter((task) => task.category !== 'reflection').map(family)).size, 4);
  const practiceIds = practice.map((task) => task.id);
  const onlyEconomist = practice.find((task) => task.category === 'economist');
  if (practice.filter((task) => task.category === 'economist').length === 1) {
    assert.equal(getReplacementTask(onlyEconomist, practiceIds, 'practice', { storage }).category, 'economist');
  }
  assert.ok(practice.some((task) => task.category === 'observation_judgment') ||
    [...Array(20)].some(() => generateSessionTasks('practice', { reflectionAspectIndex: 2, storage })
      .some((task) => task.category === 'observation_judgment')),
  'Observation and judgment tasks must be reachable in practice');
  console.log('SOS nine-format rotation, ID bags, swaps, and five-task practice verified.');
} finally {
  await server.close();
}
