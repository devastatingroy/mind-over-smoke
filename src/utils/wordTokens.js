// Keep the displayed click targets and the dictionary build's vocabulary in sync.
export function cleanWord(rawWord) {
  return (rawWord || '').replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').replace(/’/g, "'").toLowerCase();
}

export function splitInteractiveText(text) {
  if (!text) return [];
  const parts = [];
  const pattern = /[a-zA-Z]+(?:['’][a-zA-Z]+)*/g;
  let start = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > start) parts.push({ text: text.slice(start, match.index), word: null });
    parts.push({ text: match[0], word: cleanWord(match[0]) });
    start = match.index + match[0].length;
  }
  if (start < text.length) parts.push({ text: text.slice(start), word: null });
  return parts;
}

export function interactiveWords(text) {
  return splitInteractiveText(text).filter(part => part.word).map(part => part.word);
}
