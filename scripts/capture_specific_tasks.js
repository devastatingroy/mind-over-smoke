import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

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
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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
  await new Promise(r => setTimeout(r, 1200));

  // Loop swap until we see physical (push-ups)
  let foundPhysical = false;
  let attempts = 0;
  while (!foundPhysical && attempts < 15) {
    const content = await page.content();
    if (content.includes('俯卧撑') || content.includes('平板支撑') || content.includes('点击计数')) {
      foundPhysical = true;
      break;
    }
    const swapBtn = await findButtonByText(page, '换个任务');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }
    attempts++;
  }

  if (foundPhysical) {
    console.log('Capturing push_ups_task.png...');
    // Click 3 reps to show live counter progress
    for (let i = 0; i < 4; i++) {
      const repBtn = await findButtonByText(page, '点击计数');
      if (repBtn) await repBtn.click();
      await new Promise(r => setTimeout(r, 150));
    }
    await page.screenshot({ path: path.join(screenshotDir, 'task_push_ups.png') });
  }

  // Loop swap until we see Tang poetry
  let foundPoetry = false;
  attempts = 0;
  while (!foundPoetry && attempts < 15) {
    const content = await page.content();
    if (content.includes('唐诗心流') || content.includes('李白') || content.includes('苏轼') || content.includes('杜甫')) {
      foundPoetry = true;
      break;
    }
    const swapBtn = await findButtonByText(page, '换个任务');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }
    attempts++;
  }

  if (foundPoetry) {
    console.log('Capturing task_tang_poetry.png before answer...');
    await page.screenshot({ path: path.join(screenshotDir, 'task_tang_poetry_blank.png') });

    // Answer the poem to show recitation guide
    const options = await page.$$('div.grid button');
    if (options.length > 0) {
      await options[0].click();
      await new Promise(r => setTimeout(r, 800));
      console.log('Capturing task_tang_poetry_recitation.png with guide...');
      await page.screenshot({ path: path.join(screenshotDir, 'task_tang_poetry_recitation.png') });
    }
  }

  await browser.close();
  console.log('Specific captures complete!');
}

capture().catch(console.error);
