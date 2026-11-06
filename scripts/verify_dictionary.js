import economist from '../src/data/questions.json' with { type: 'json' };
import translations from '../src/data/tang_translation.json' with { type: 'json' };
import economistTranslations from '../src/data/economist_translation.json' with { type: 'json' };
import { interactiveWords } from '../src/utils/wordTokens.js';
import { lookupWord } from '../src/utils/phoneticDict.js';
import { dictionaryFields } from './dictionaryFields.js';

const fields = dictionaryFields(economist, translations, economistTranslations);

const missing = new Map();
let total = 0;
for (const [field, text] of fields) {
  for (const word of interactiveWords(text)) {
    total++;
    const result = lookupWord(word);
    if (!result?.def?.trim() || result.def === '词典暂未收录该词详细释义') {
      if (!missing.has(word)) missing.set(word, []);
      missing.get(word).push(field);
    }
  }
}

if (missing.size) {
  console.error(`词典覆盖检查失败：${missing.size} 个可点击词没有释义。`);
  for (const [word, locations] of missing) console.error(`  ${word}: ${locations.slice(0, 3).join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`词典覆盖检查通过：${total} 次可点击词出现均有释义。`);
}
