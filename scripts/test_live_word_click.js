import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

async function testWordClick() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('1. Loading https://royfree.men/ ...');
  await page.goto('https://royfree.men/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });

  // Ensure we are on an Economist question
  for (let i = 0; i < 15; i++) {
    const isEcon = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal && (modal.innerText.includes('THE ECONOMIST PASSAGE') || modal.innerText.includes('经济学人认知阻断'));
    });
    if (isEcon) break;
    const swap = await page.$('button[title="更换当前任务"]');
    if (swap) {
      await swap.click();
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Find all interactive words
  const words = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span[title*="音标"]'));
    return spans.map(s => s.innerText.trim());
  });
  console.log('Found interactive words:', words.slice(0, 8));

  // Click a substantive word with phonetic transcription
  const clickedInfo = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span[title*="音标"]'));
    const target = spans.find(s => ['underfunded', 'shoulder', 'affinity', 'congested', 'monoxide', 'hemoglobin', 'cilia', 'bronchial', 'epithelium', 'paralysed', 'microscopic'].includes(s.innerText.toLowerCase().replace(/[^a-z]/g, ''))) || spans[1];
    if (target) {
      target.click();
      return target.innerText;
    }
    return null;
  });

  console.log('Clicked word on screen:', clickedInfo);
  await new Promise(r => setTimeout(r, 600));

  // Inspect the popup inspector card content
  const cardData = await page.evaluate(() => {
    const card = document.querySelector('.bg-\\[\\#18181B\\].text-white');
    if (!card) return null;
    return {
      fullText: card.innerText,
      word: card.querySelector('.font-serif.font-bold')?.innerText,
      phonetic: card.querySelector('.font-mono.text-emerald-400')?.innerText,
      definition: card.querySelector('p.text-stone-300')?.innerText,
      hasSpeakerButton: !!card.querySelector('button[title="点击发音"]')
    };
  });

  console.log('Inspector Card Data:', cardData);

  // Take screenshot
  await page.screenshot({
    path: path.join(screenshotDir, 'royfree_word_inspector_live.png'),
    fullPage: false
  });
  console.log('Saved screenshot to royfree_word_inspector_live.png');

  await browser.close();
}

testWordClick().catch(console.error);
