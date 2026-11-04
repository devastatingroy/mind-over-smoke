import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotPath = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots\\knee_friendly_task.png';

async function run() {
  const browser = await puppeteer.launch({ executablePath: edgePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  
  for (let i = 0; i < 20; i++) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('平板支撑') || text.includes('空击') || text.includes('仰卧卷腹')) {
      await page.screenshot({ path: screenshotPath });
      console.log('Successfully captured knee friendly task:', text.slice(0, 80));
      break;
    }
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const t = await page.evaluate(el => el.innerText, b);
      if (t && t.includes('换个任务')) {
        await b.click();
        await new Promise(r => setTimeout(r, 400));
        break;
      }
    }
  }
  await browser.close();
}

run().catch(console.error);
