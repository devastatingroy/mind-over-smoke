import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

async function run() {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to http://127.0.0.1:3000/?mode=sos ...');
  await page.goto('http://127.0.0.1:3000/?mode=sos', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.fixed.inset-0', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 1000));

  // Find Economist task
  for (let attempt = 0; attempt < 15; attempt++) {
    const isEcon = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal && (modal.innerText.includes('THE ECONOMIST PASSAGE') || modal.innerText.includes('经济学人认知阻断'));
    });

    if (isEcon) {
      console.log(`Found Economist cognitive task on attempt ${attempt + 1}!`);
      break;
    }

    const swapBtn = await page.$('button[title="更换当前任务"]');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // 1. Click translation button [ 译 · 中文翻译 ]
  const transBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.innerText.includes('中文翻译') || (b.title && b.title.includes('翻译')));
  });

  if (transBtn) {
    console.log('Clicking translation toggle button...');
    await transBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // 2. Click a word that exists in phonetic dictionary
  const clicked = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span')).filter(s => s.title && s.title.includes('音标'));
    if (!spans.length) return null;
    
    // List of known dictionary keys
    const dictKeys = [
      'paradox', 'biological', 'depreciation', 'longevity', 'alleviate', 'deficit',
      'engineered', 'preceding', 'arsonist', 'firefighter', 'prudent', 'compromise',
      'instinctively', 'ventilation', 'unaltered', 'carcinogens', 'myopic', 'hefty',
      'catastrophic', 'liabilities', 'quintessential', 'accessory', 'rebellious', 'exile',
      'monoxide', 'hemoglobin', 'affinity', 'congested', 'fallacy', 'cessation',
      'manifestation', 'tactile', 'illusion', 'impede', 'volatile', 'cravings',
      'dopamine', 'receptors', 'constricting', 'peripheral', 'epidermal', 'nourishment',
      'complexion', 'dermatologists', 'candidly', 'hedonic', 'treadmill', 'serenity',
      'cilia', 'bronchial', 'epithelium', 'respiratory', 'microscopic', 'paralysed',
      'defenseless', 'airborne', 'bacteria', 'vitality', 'dividend', 'extinguish'
    ];

    const match = spans.find(s => dictKeys.includes(s.innerText.toLowerCase().replace(/[^a-z]/g, '')));
    if (match) {
      match.click();
      return match.innerText;
    }
    // fallback
    spans[2].click();
    return spans[2].innerText;
  });

  console.log('Clicked academic word:', clicked);
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(screenshotDir, 'task_economist_phonetics.png'),
    fullPage: false
  });
  console.log('Saved task_economist_phonetics.png');

  await browser.close();
  console.log('Completed all screenshot captures successfully!');
}

run().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
