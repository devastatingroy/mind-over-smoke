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

async function capturePushUpsDirect() {
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
  await new Promise(r => setTimeout(r, 1000));

  // Find physical task across task 1, 2, 3
  for (let round = 0; round < 3; round++) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('俯卧撑') || text.includes('躯体动作') || text.includes('点击计数')) {
      console.log(`Found physical task on Task ${round + 1}!`);
      // If it's not push-ups specifically, swap it until it is
      while (!text.includes('10 个俯卧撑')) {
        const swapBtn = await findButtonByText(page, '换个任务');
        if (!swapBtn) break;
        await swapBtn.click();
        await new Promise(r => setTimeout(r, 300));
        const newText = await page.evaluate(() => document.body.innerText);
        if (newText.includes('10 个俯卧撑')) break;
      }

      // Click rep counter 4 times
      for (let k = 0; k < 4; k++) {
        const repBtn = await findButtonByText(page, '点击计数');
        if (repBtn) await repBtn.click();
        await new Promise(r => setTimeout(r, 150));
      }
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(screenshotDir, '08_push_ups_in_action.png') });
      console.log('Saved 08_push_ups_in_action.png!');

      // Complete all 10 reps
      const instantBtn = await findButtonByText(page, '我已一口气全部做完');
      if (instantBtn) {
        await instantBtn.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(screenshotDir, '09_push_ups_completed.png') });
        console.log('Saved 09_push_ups_completed.png!');
      }
      break;
    } else {
      // Advance to next task
      const options = await page.$$('div.grid button');
      if (options.length > 0) {
        await options[0].click();
        await new Promise(r => setTimeout(r, 600));
      }
      const nextBtn = await findButtonByText(page, '继续下一个阻断任务');
      if (nextBtn) {
        await nextBtn.click();
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }

  await browser.close();
}

capturePushUpsDirect().catch(console.error);
