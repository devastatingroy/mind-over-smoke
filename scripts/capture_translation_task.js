import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = edgePath;
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

async function findButtonByText(page, text) {
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const t = await page.evaluate(el => el.innerText, b);
    if (t && t.includes(text)) {
      return b;
    }
  }
  return null;
}

async function captureTranslation() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 412,
    height: 892,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  let found = false;
  // Look across tasks or swap until translation task is found
  for (let i = 0; i < 30; i++) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('英译唐诗解密') || text.includes('经典英译本') || text.includes('许渊冲')) {
      found = true;
      break;
    }
    const swapBtn = await findButtonByText(page, '换个任务');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
  }

  if (found) {
    console.log('Capturing task_tang_translation.png...');
    await page.screenshot({ path: path.join(screenshotDir, 'task_tang_translation.png') });

    // Click the first option to answer
    const options = await page.$$('div.grid button');
    if (options.length > 0) {
      await options[0].click();
      await new Promise(r => setTimeout(r, 800));
      console.log('Capturing task_tang_translation_answered.png...');
      await page.screenshot({ path: path.join(screenshotDir, 'task_tang_translation_answered.png') });
    }
  } else {
    console.log('Translation task not found in 20 swaps');
  }

  await browser.close();
}

captureTranslation().catch(console.error);
