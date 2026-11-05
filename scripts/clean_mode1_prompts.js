import fs from 'fs';

const trans = JSON.parse(fs.readFileSync('src/data/tang_translation.json', 'utf8'));

console.log('=== Polishing all Mode 1 prompts in tang_translation.json ===');

let updatedCount = 0;
for (const t of trans) {
  if (t.mode === 'en_to_zh') {
    // Generate clean keywords from mapping or english_text
    let enKeywords = '';
    if (t.mapping && Array.isArray(t.mapping) && t.mapping.length > 0) {
      enKeywords = t.mapping.map(m => m.en.replace(/[\n\r]+/g, ' ').trim()).filter(Boolean).join(' / ');
    } else if (t.english_text) {
      enKeywords = t.english_text.split(/[\n,;]+/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 30).slice(0, 4).join(' / ');
    }

    const poetName = t.author ? t.author.replace(/^[^\s·]+[\s·]+/, '').trim() : '名家';

    // Build standard, dignified zero-spoiler prompt
    const cleanPrompt = `解读上方英译中的核心意象（${enKeywords}），调动深层诗词记忆：你能逆向还原${poetName}写下的是哪句千古绝唱吗？`;

    // Strictly verify NO Chinese answer characters leaked
    const cleanAns = t.correct_answer.replace(/[^\u4e00-\u9fa5]/g, '');
    for (let i = 0; i < cleanAns.length - 1; i++) {
      const sub = cleanAns.slice(i, i + 2);
      if (cleanPrompt.includes(sub)) {
        console.warn(`WARNING: Leak detected in ${t.id}: ${sub}`);
      }
    }

    t.prompt = cleanPrompt;
    updatedCount++;
  }
}

fs.writeFileSync('src/data/tang_translation.json', JSON.stringify(trans, null, 2), 'utf8');
console.log(`Successfully polished ${updatedCount} Mode 1 questions in tang_translation.json!`);
