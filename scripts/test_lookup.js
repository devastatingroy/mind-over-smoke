import fs from 'fs';

const fullDict = JSON.parse(fs.readFileSync('src/data/fullDictionary.json', 'utf8'));

function cleanWord(rawWord) {
  if (!rawWord) return '';
  return rawWord.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').toLowerCase();
}

function lookup(w) {
  const cleaned = cleanWord(w);
  if (fullDict[cleaned]) return { word: cleaned, ...fullDict[cleaned] };
  if (cleaned.endsWith('s') && !cleaned.endsWith('ss')) {
    const singular = cleaned.slice(0, -1);
    if (fullDict[singular]) return { word: cleaned, ...fullDict[singular] };
  }
  if (cleaned.endsWith('ies')) {
    const singular = cleaned.slice(0, -3) + 'y';
    if (fullDict[singular]) return { word: cleaned, ...fullDict[singular] };
  }
  if (cleaned.endsWith('ing')) {
    const stem = cleaned.slice(0, -3);
    if (fullDict[stem]) return { word: cleaned, ...fullDict[stem] };
    if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
      const single = stem.slice(0, -1);
      if (fullDict[single]) return { word: cleaned, ...fullDict[single] };
    }
  }
  return null;
}

const passage = 'Free radicals in combustion gas degrade elastin fibers in vessel walls relentlessly stripping arteries of the supple required to buffer cardiac pressure waves';
const words = passage.split(/\s+/);
console.log('Testing all words in user screenshot passage:');
for (const w of words) {
  const res = lookup(w);
  if (res) {
    console.log(`${w} -> ${res.phonetic || '(no ipa)'} [${res.pos}] ${res.def.slice(0, 35)}`);
  } else {
    console.log(`${w} -> MISSING!`);
  }
}
