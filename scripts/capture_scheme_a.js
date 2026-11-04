import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
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

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
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

  // 1. Capture Dashboard / Home
  console.log('Capturing home dashboard...');
  await page.goto('http://127.0.0.1:3000/?mode=dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotDir, 'scheme_a_home.png') });

  // 2. Open SOS Emergency Modal
  console.log('Opening SOS Emergency Modal...');
  const sosBtn = await findButtonByText(page, '启动 3 分钟急救干预');
  if (sosBtn) await sosBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // Loop to capture different tasks in Scheme A style
  for (let round = 0; round < 6; round++) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('TRANSLATION') || text.includes('英译唐诗')) {
      console.log('Capturing scheme_a_translation.png...');
      await page.screenshot({ path: path.join(screenshotDir, 'scheme_a_translation.png') });
    } else if (text.includes('SOMATIC') || text.includes('俯卧撑')) {
      console.log('Capturing scheme_a_physical.png...');
      await page.screenshot({ path: path.join(screenshotDir, 'scheme_a_physical.png') });
    } else if (text.includes('POETRY') || text.includes('唐诗心流')) {
      console.log('Capturing scheme_a_poetry.png...');
      await page.screenshot({ path: path.join(screenshotDir, 'scheme_a_poetry.png') });
    }

    const swapBtn = await findButtonByText(page, '换任务');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }
  }

  await browser.close();
  console.log('Scheme A captures finished!');
}

capture().catch(console.error);
