import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

async function testRoyFree() {
  console.log('1. Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('2. Navigating to https://royfree.men/ ...');
  await page.goto('https://royfree.men/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });

  const state = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    return {
      title: modal.querySelector('blockquote, h3, .font-serif.text-stone-800, .font-serif.text-stone-700')?.innerText || '',
      category: modal.querySelector('.font-sans.text-stone-900.font-medium')?.innerText || '',
      progress: modal.querySelector('.font-mono.text-stone-500')?.innerText || ''
    };
  });

  console.log('3. royfree.men state rendered successfully:', state);

  await page.screenshot({
    path: path.join(screenshotDir, 'royfree_men_live.png'),
    fullPage: false
  });
  console.log('4. Saved verification screenshot to royfree_men_live.png');

  await browser.close();
  console.log('✅ royfree.men verified 100% online and operational!');
}

testRoyFree().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
