// These are the fields passed to renderInteractiveSegment in QuizModal.
export function dictionaryFields(economist, translations, economistTranslations = []) {
  const fields = [];
  for (const q of economist) {
    fields.push([`${q.id}.passage`, q.passage], [`${q.id}.punchline`, q.punchline]);
  }
  for (const t of translations) {
    fields.push([`${t.id}.english_text`, t.english_text], [`${t.id}.punchline`, t.punchline]);
    if (t.mode === 'zh_to_en') fields.push([`${t.id}.correct_answer`, t.correct_answer]);
  }
  for (const t of economistTranslations) {
    fields.push([`${t.id}.reference_translation`, t.reference_translation]);
    fields.push([`${t.id}.punchline`, t.punchline]);
    for (const [index, phrase] of t.key_phrases.entries()) {
      fields.push([`${t.id}.key_phrases.${index}`, phrase.en]);
    }
  }
  return fields;
}
