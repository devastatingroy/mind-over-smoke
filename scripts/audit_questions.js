import fs from 'fs';

const trans = JSON.parse(fs.readFileSync('src/data/tang_translation.json', 'utf8'));
const qList = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));

console.log('=== AUDITING tang_translation.json ===');
let transLeaks = [];

for (const t of trans) {
  const ans = t.correct_answer || '';
  const prompt = t.prompt || '';
  const theme = t.theme || '';
  const title = t.title || '';

  if (t.mode === 'en_to_zh') {
    // Break ans into chunks of 2 or more Chinese chars
    const phrases = ans.split(/[，。？！、\s]+/).filter(p => p.length >= 2);
    let leaks = [];
    for (const p of phrases) {
      if (prompt.includes(p)) {
        leaks.push(p);
      }
    }
    // Also check 3-char sub-slices
    for (let i = 0; i < ans.length - 2; i++) {
      const sub = ans.slice(i, i + 3);
      if (!/[，。？！、\s]/.test(sub) && prompt.includes(sub) && !leaks.includes(sub)) {
        leaks.push(sub);
      }
    }
    if (leaks.length > 0) {
      transLeaks.push({
        id: t.id,
        mode: t.mode,
        author: t.author,
        title: t.title,
        ans,
        prompt,
        leaks
      });
    }
  } else if (t.mode === 'zh_to_en') {
    // In Mode 2: does the prompt leak the English answer or key options?
    // In Mode 2, chinese_verse is shown. If prompt leaks the English answer:
    const ansClean = ans.toLowerCase();
    // Check if long English fragments from ans appear in prompt
    const enTokens = (prompt.match(/[a-zA-Z]{4,}/g) || []).map(w => w.toLowerCase());
    const matchedTokens = enTokens.filter(w => ansClean.includes(w));
    // If prompt quotes English phrases that match the answer directly
    if (matchedTokens.length >= 3) {
      transLeaks.push({
        id: t.id,
        mode: t.mode,
        author: t.author,
        title: t.title,
        ans,
        prompt,
        leaks: matchedTokens
      });
    }
  }
}

console.log(`Found ${transLeaks.length} potential leaks in tang_translation.json:`);
for (const l of transLeaks) {
  console.log(`- [${l.id}] ${l.author} ${l.title} (Mode: ${l.mode})`);
  console.log(`  Ans: ${l.ans}`);
  console.log(`  Prompt: ${l.prompt}`);
  console.log(`  Leaked elements:`, l.leaks);
  console.log('');
}

console.log('\n=== AUDITING questions.json (The Economist) ===');
let economistIssues = [];
for (const q of qList) {
  // Check if answer is in passage or question prompt or hint before answering
  const ans = (q.blank || q.correct_answer || '').trim();
  const passage = q.passage || '';
  const statement = q.statement || '';
  const hint = q.hint || '';

  // In cloze: does the passage already contain the blank word anywhere else?
  if (q.type === 'cloze' && ans) {
    // Check if the passage before or after ____ contains the answer word
    const passageWithoutBlank = passage.replace('________', '');
    const regex = new RegExp(`\\b${ans}\\b`, 'i');
    if (regex.test(passageWithoutBlank)) {
      economistIssues.push({
        id: q.id,
        type: q.type,
        ans,
        reason: 'Answer appears elsewhere in passage',
        passage
      });
    }
    // Check if hint contains the answer directly
    if (regex.test(hint)) {
      economistIssues.push({
        id: q.id,
        type: q.type,
        ans,
        reason: 'Hint contains answer word',
        hint
      });
    }
  }

  // Check if options have duplicates
  if (q.options && Array.isArray(q.options)) {
    const uniqueOpts = new Set(q.options.map(o => (typeof o === 'string' ? o.trim() : o)));
    if (uniqueOpts.size !== q.options.length) {
      economistIssues.push({
        id: q.id,
        type: q.type,
        reason: 'Duplicate options in question',
        options: q.options
      });
    }
  }
}

console.log(`Found ${economistIssues.length} issues in questions.json:`);
for (const issue of economistIssues) {
  console.log(issue);
}
