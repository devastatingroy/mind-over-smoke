import fs from 'fs';
import path from 'path';

import { newEconomistQuestions } from './data_economist_64.js';
import { economistQuestions51to100 } from './data_economist_51_100.js';
import { translationQuestions13to56 } from './data_translation_13_56.js';
import { translationQuestions31to56 } from './data_translation_31_56.js';
import { translationQuestions57to100 } from './data_translation_57_100.js';

console.log('=== MindOverSmoke 200 题全量装配与词典拓展引擎 ===');

// 1. Assemble questions.json (Target: 100 questions)
const existingEconomist = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));
const fullEconomist = [
  ...existingEconomist.slice(0, 36),
  ...newEconomistQuestions,
  ...economistQuestions51to100
];

console.log(`1. 经济学人题目组装完成：已有 ${existingEconomist.length} 题 -> 现达 ${fullEconomist.length} 题`);
fs.writeFileSync('src/data/questions.json', JSON.stringify(fullEconomist, null, 2), 'utf8');

// 2. Assemble tang_translation.json (Target: 100 questions: 50 Mode 1 + 50 Mode 2)
const existingTrans = JSON.parse(fs.readFileSync('src/data/tang_translation.json', 'utf8'));
const fullTrans = [
  ...existingTrans.slice(0, 12),
  ...translationQuestions13to56,
  ...translationQuestions31to56,
  ...translationQuestions57to100
];

const mode1Count = fullTrans.filter(q => q.mode === 'en_to_zh').length;
const mode2Count = fullTrans.filter(q => q.mode === 'zh_to_en').length;
console.log(`2. 传世名篇双向翻译题组装完成：已有 ${existingTrans.length} 题 -> 现达 ${fullTrans.length} 题 (Mode 1 逆向: ${mode1Count} 题, Mode 2 挑名译: ${mode2Count} 题)`);
fs.writeFileSync('src/data/tang_translation.json', JSON.stringify(fullTrans, null, 2), 'utf8');

// 3. Extract and expand phonetic dictionary for all vocab in the new questions
console.log('3. 扫描新词汇并拓展 phoneticDict.js 音标词库...');
const phoneticDictPath = 'src/utils/phoneticDict.js';
let phoneticDictContent = fs.readFileSync(phoneticDictPath, 'utf8');

const newVocabEntries = {};

// Collect from questions.json
for (const q of fullEconomist) {
  if (q.vocab && q.vocab.word) {
    const w = q.vocab.word.toLowerCase().replace(/[^a-z -]/g, '').trim();
    if (w && !phoneticDictContent.includes(`${w}:`) && !newVocabEntries[w]) {
      newVocabEntries[w] = {
        phonetic: q.vocab.phonetic || '',
        pos: q.vocab.meaning?.split(' ')[0] || 'n.',
        def: q.vocab.meaning || ''
      };
    }
  }
}

// Collect from translation mapping
for (const q of fullTrans) {
  if (q.mapping && Array.isArray(q.mapping)) {
    for (const m of q.mapping) {
      const words = m.en.split(/\s+/);
      for (const raw of words) {
        const clean = raw.toLowerCase().replace(/[^a-z]/g, '');
        if (clean && clean.length > 3 && !phoneticDictContent.includes(`${clean}:`) && !newVocabEntries[clean]) {
          newVocabEntries[clean] = {
            phonetic: '',
            pos: '',
            def: m.zh
          };
        }
      }
    }
  }
}

console.log(`检测到 ${Object.keys(newVocabEntries).length} 个待补充的新词条...`);

if (Object.keys(newVocabEntries).length > 0) {
  let appendStr = '\n  // Automatically expanded terms for 200 questions\n';
  for (const [w, data] of Object.entries(newVocabEntries)) {
    const ph = data.phonetic ? `'${data.phonetic}'` : 'null';
    appendStr += `  '${w}': { phonetic: ${ph}, pos: '${data.pos}', def: '${data.def.replace(/'/g, "\\'")}' },\n`;
  }

  // Insert before closing bracket of export const phoneticDict = { ... };
  const targetPattern = "  flight: { phonetic: '/flaɪt/', pos: 'n.', def: '（楼梯的）一段；飞翔' }";
  if (phoneticDictContent.includes(targetPattern)) {
    const replacement = targetPattern + ',\n' + appendStr;
    phoneticDictContent = phoneticDictContent.replace(targetPattern, replacement);
    fs.writeFileSync(phoneticDictPath, phoneticDictContent, 'utf8');
    console.log('phoneticDict.js 音标词库已成功扩展！');
  } else {
    console.warn('未找到 flight 锚点，跳过词典追加');
  }
}

console.log('=== 全量装配完成！===');
