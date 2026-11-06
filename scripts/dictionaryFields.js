// These are the fields passed to renderInteractiveSegment in QuizModal.
export function dictionaryFields(economist, translations) {
  const fields = [];
  for (const q of economist) {
    fields.push([`${q.id}.passage`, q.passage], [`${q.id}.punchline`, q.punchline]);
  }
  for (const t of translations) {
    fields.push([`${t.id}.english_text`, t.english_text], [`${t.id}.punchline`, t.punchline]);
    if (t.mode === 'zh_to_en') fields.push([`${t.id}.correct_answer`, t.correct_answer]);
  }
  return fields;
}
