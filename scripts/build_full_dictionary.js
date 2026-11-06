import fs from 'fs';
import https from 'https';
import { interactiveWords } from '../src/utils/wordTokens.js';
import { dictionaryFields } from './dictionaryFields.js';

console.log('=== MindOverSmoke 全量词库智能构建引擎 (方案 C) ===');

const economist = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));
const trans = JSON.parse(fs.readFileSync('src/data/tang_translation.json', 'utf8'));
const economistTranslations = JSON.parse(fs.readFileSync('src/data/economist_translation.json', 'utf8'));

// 1. Collect all unique English words
const wordSet = new Set();
function addText(text) {
  if (!text) return;
  const tokens = interactiveWords(text);
  for (const t of tokens) {
    const clean = t.toLowerCase();
    if (clean.length >= 1) {
      wordSet.add(clean);
    }
  }
}

for (const [, text] of dictionaryFields(economist, trans, economistTranslations)) addText(text);

const allWords = Array.from(wordSet).sort();
console.log(`全库共扫描出 ${allWords.length} 个独立英文字词。`);

// 2. Load existing fullDictionary.json if present
let dictionary = {};
if (fs.existsSync('src/data/fullDictionary.json')) {
  try {
    dictionary = JSON.parse(fs.readFileSync('src/data/fullDictionary.json', 'utf8'));
    console.log(`已加载既有词典缓存：${Object.keys(dictionary).length} 词条`);
  } catch (e) {
    dictionary = {};
  }
}

// Context-specific names override generic dictionary meanings.
Object.assign(dictionary, JSON.parse(fs.readFileSync('src/data/dictionaryOverrides.json', 'utf8')));

// Filter words that need to be fetched
const missingWords = allWords.filter(w => !dictionary[w]?.def && !(w.endsWith("'s") && dictionary[w.slice(0, -2)]?.def));
console.log(`需要补充查询/补全音标与释义的词条：${missingWords.length} 个`);

// 3. Fetcher function
function fetchWordOnline(word) {
  return new Promise((resolve) => {
    const req = https.get('https://dict.youdao.com/jsonapi?q=' + encodeURIComponent(word), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const ec = json.ec;
          if (ec && ec.word && ec.word[0]) {
            const w = ec.word[0];
            const rawPhone = w.ukphone || w.usphone || w.phone || '';
            const phonetic = rawPhone ? `/${rawPhone}/` : null;
            let pos = '';
            let def = '';
            if (w.trs && w.trs.length > 0) {
              const firstTr = w.trs[0].tr[0].l.i[0];
              const match = firstTr.match(/^([a-z&/]+\.)\s*(.+)$/i);
              if (match) {
                pos = match[1];
                def = match[2];
              } else {
                def = firstTr;
              }
            }
            // Clean up def: keep first 60 chars or up to semicolon
            if (def) {
              def = def.replace(/[\n\r]+/g, ' ').trim();
            }
            resolve({ word, phonetic, pos, def });
          } else {
            resolve({ word, phonetic: null, pos: '', def: '' });
          }
        } catch (e) {
          resolve({ word, phonetic: null, pos: '', def: '' });
        }
      });
    });

    req.on('error', () => resolve({ word, phonetic: null, pos: '', def: '' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ word, phonetic: null, pos: '', def: '' });
    });
  });
}

// 4. Batch concurrent execution
async function buildDictionary() {
  const CONCURRENCY = 15;
  let done = 0;
  for (let i = 0; i < missingWords.length; i += CONCURRENCY) {
    const batch = missingWords.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(w => fetchWordOnline(w)));
    for (const r of results) {
      if (r.def || r.phonetic) {
        dictionary[r.word] = {
          phonetic: r.phonetic,
          pos: r.pos,
          def: r.def
        };
      }
    }
    done += batch.length;
    if (done % 150 === 0 || done === missingWords.length) {
      console.log(`进度：${done} / ${missingWords.length} (${Math.round(done / missingWords.length * 100)}%)`);
      fs.writeFileSync('src/data/fullDictionary.json', JSON.stringify(dictionary, null, 2), 'utf8');
    }
  }

  // Final write
  fs.writeFileSync('src/data/fullDictionary.json', JSON.stringify(dictionary, null, 2), 'utf8');
  console.log(`=== 全量词典构建完成！总收录词条数: ${Object.keys(dictionary).length} ===`);
}

buildDictionary();
