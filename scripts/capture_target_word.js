import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto('http://127.0.0.1:3000/?mode=sos', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.fixed.inset-0', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 800));

  // Loop swap until we find an Economist question
  for (let i = 0; i < 15; i++) {
    const spanCount = await page.evaluate(() => document.querySelectorAll('span[title*="音标"]').length);
    if (spanCount > 0) {
      break;
    }
    const swapBtn = await page.$('button[title="更换当前任务"]');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // Toggle translation
  const transBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.innerText.includes('中文翻译') || (b.title && b.title.includes('翻译')));
  });
  if (transBtn) {
    await transBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Click catastrophic or any good word
  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span[title*="音标"]'));
    if (!spans.length) return null;
    const target = spans.find(s => ['catastrophic', 'liabilities', 'hefty', 'economics', 'perspective'].includes(s.innerText.toLowerCase().replace(/[^a-z]/g, ''))) || spans[0];
    target.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(screenshotDir, 'task_economist_phonetics.png'),
    fullPage: false
  });
  console.log('Saved task_economist_phonetics.png');

  // Now answer the question by clicking the first option
  const optionBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.innerText.includes('选择'));
  });
  if (optionBtn) {
    await optionBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(screenshotDir, 'task_economist_answered.png'),
      fullPage: false
    });
    console.log('Saved task_economist_answered.png');
  }

  await browser.close();
}

run().catch(console.error);
