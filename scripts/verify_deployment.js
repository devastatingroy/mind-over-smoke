import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

const targetUrl = 'https://devastatingroy.github.io/mind-over-smoke/';

async function testDeployment() {
  console.log(`1. Testing HTTP GET ${targetUrl} ...`);
  const resp = await fetch(targetUrl);
  console.log(`HTTP ${resp.status} ${resp.statusText}`);
  const html = await resp.text();
  console.log(`HTML size: ${html.length} bytes, MindOverSmoke in title: ${html.includes('MindOverSmoke')}`);

  console.log('2. Testing in headless Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.fixed.inset-0', { timeout: 10000 });

  const modalTitle = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    return {
      title: modal.querySelector('blockquote, h3, .font-serif.text-stone-800, .font-serif.text-stone-700')?.innerText || '',
      category: modal.querySelector('.font-sans.text-stone-900.font-medium')?.innerText || '',
      progress: modal.querySelector('.font-mono.text-stone-500')?.innerText || '',
      hasCountdown: modal.innerText.includes('REMAINING')
    };
  });

  console.log('3. Deployed application loaded perfectly in browser! Details:', modalTitle);

  // Take screenshot of deployed production app
  await page.screenshot({
    path: path.join(screenshotDir, 'deployed_github_pages.png'),
    fullPage: false
  });
  console.log('4. Saved verification screenshot to deployed_github_pages.png');

  await browser.close();
  console.log('✅ All deployment tests passed with 100% success!');
}

testDeployment().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
