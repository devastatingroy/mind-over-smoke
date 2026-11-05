import fs from 'fs';

const trans = JSON.parse(fs.readFileSync('src/data/tang_translation.json', 'utf8'));
const qList = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

console.log('==============================================');
console.log('DEEP COMPREHENSIVE AUDIT REPORT');
console.log('==============================================');

// 1. Audit tang_translation.json (all 100 questions)
console.log('\n--- 1. AUDITING tang_translation.json (100 Items) ---');
const mode1 = trans.filter(t => t.mode === 'en_to_zh');
const mode2 = trans.filter(t => t.mode === 'zh_to_en');
console.log(`Total: ${trans.length} (Mode 1 en_to_zh: ${mode1.length}, Mode 2 zh_to_en: ${mode2.length})`);

// Mode 1: Check for any Chinese leak from correct_answer or full_verse in prompt/theme
let mode1Leaks = [];
for (const t of mode1) {
  const ans = t.correct_answer || '';
  const prompt = t.prompt || '';
  const theme = t.theme || '';
  
  // Extract 2+ character Chinese substrings from answer
  const cleanAns = ans.replace(/[^\u4e00-\u9fa5]/g, '');
  let leakedSubstrings = [];
  for (let len = 2; len <= cleanAns.length; len++) {
    for (let i = 0; i <= cleanAns.length - len; i++) {
      const sub = cleanAns.slice(i, i + len);
      if (prompt.includes(sub) && !leakedSubstrings.some(existing => existing.includes(sub))) {
        leakedSubstrings.push(sub);
      }
    }
  }
  if (leakedSubstrings.length > 0) {
    mode1Leaks.push({ id: t.id, author: t.author, title: t.title, ans, prompt, leakedSubstrings });
  }
}
console.log(`Mode 1 Leaks Found: ${mode1Leaks.length} / ${mode1.length}`);
mode1Leaks.forEach(l => {
  console.log(`  [${l.id}] ${l.author} ${l.title}`);
  console.log(`    Ans: ${l.ans}`);
  console.log(`    Prompt: ${l.prompt}`);
  console.log(`    Leaked: ${l.leakedSubstrings.join(', ')}`);
});

// Mode 2: Check if prompt quotes or reveals the English correct_answer
let mode2Leaks = [];
for (const t of mode2) {
  const ans = (t.correct_answer || '').toLowerCase();
  const prompt = t.prompt || '';
  // Check if prompt has English words that match answer
  const enWordsInPrompt = (prompt.match(/[a-zA-Z]{4,}/g) || []).map(w => w.toLowerCase());
  const matchingWords = enWordsInPrompt.filter(w => ans.includes(w));
  // If prompt explicitly quotes English or has 3+ key words from the correct translation
  if (matchingWords.length >= 2) {
    mode2Leaks.push({ id: t.id, author: t.author, title: t.title, prompt, matchingWords });
  }
}
console.log(`\nMode 2 Leaks Found: ${mode2Leaks.length} / ${mode2.length}`);
mode2Leaks.forEach(l => {
  console.log(`  [${l.id}] ${l.author} ${l.title}`);
  console.log(`    Prompt: ${l.prompt}`);
  console.log(`    Matching EN Words: ${l.matchingWords.join(', ')}`);
});

// 2. Audit questions.json (100 Items)
console.log('\n--- 2. AUDITING questions.json (100 Items) ---');
let qIssues = [];
for (const q of qList) {
  const blank = (q.blank || '').toLowerCase();
  const passage = q.passage || '';
  const hint = q.hint || '';
  const translation = q.passage_translation || '';

  // Check 1: Does passage contain the blank word outside of ________ ?
  const passageClean = passage.replace('________', '');
  const wordRegex = new RegExp(`\\b${blank}\\b`, 'i');
  if (blank && wordRegex.test(passageClean)) {
    qIssues.push({ id: q.id, type: 'Passage contains blank word', blank, passage });
  }

  // Check 2: Does hint leak the blank word?
  if (blank && wordRegex.test(hint)) {
    qIssues.push({ id: q.id, type: 'Hint contains blank word', blank, hint });
  }

  // Check 3: Does passage_translation give away the blank in a way that is visible before answer?
  // We should check how passage_translation is handled in UI.
}
console.log(`Economist Question Issues Found: ${qIssues.length}`);
qIssues.forEach(i => console.log(' ', i));

// Keep each visible bilingual mapping tied to the current source text.
const normalizedEnglish = text => (text || '').toLowerCase().match(/[a-z]+/g)?.join(' ') || '';
const normalizedChinese = text => (text || '').match(/[\u4e00-\u9fff]/g)?.join('') || '';
const mappingIssues = [];
for (const t of trans) {
  const englishSource = t.mode === 'en_to_zh' ? t.english_text : t.correct_answer;
  const chineseSource = t.mode === 'en_to_zh' ? t.correct_answer : t.chinese_verse;
  if (!Array.isArray(t.mapping) || t.mapping.length === 0) {
    mappingIssues.push(`${t.id}: missing mapping`);
    continue;
  }
  for (const [index, pair] of t.mapping.entries()) {
    if (!normalizedEnglish(englishSource).includes(normalizedEnglish(pair.en)) || !normalizedEnglish(pair.en)) {
      mappingIssues.push(`${t.id} mapping ${index + 1}: English fragment absent from current translation`);
    }
    if (!normalizedChinese(chineseSource).includes(normalizedChinese(pair.zh)) || !normalizedChinese(pair.zh)) {
      mappingIssues.push(`${t.id} mapping ${index + 1}: Chinese fragment absent from source`);
    }
  }
}
console.log(`Bilingual Mapping Issues Found: ${mappingIssues.length}`);
mappingIssues.forEach(issue => console.log(' ', issue));
if (mode1Leaks.length || mode2Leaks.length || qIssues.length || mappingIssues.length) process.exitCode = 1;
