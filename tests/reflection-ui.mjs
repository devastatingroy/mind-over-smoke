import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath, 'Edge or Chrome is required');

const outputDir = process.env.MOS_SCREENSHOT_DIR || path.join(os.tmpdir(), 'mind-over-smoke-reflection-ui');
fs.mkdirSync(outputDir, { recursive: true });

const server = await createServer({ server: { host: '127.0.0.1', port: 0, strictPort: false } });
await server.listen();
const port = server.httpServer.address().port;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });

async function clickButton(page, label) {
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.evaluate((element) => element.innerText);
    if (text?.includes(label)) {
      await button.click();
      return;
    }
  }
  throw new Error(`Button not found: ${label}`);
}

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
  await page.click('[data-panel="reflection"] summary');
  const initialAspect = await page.$eval('#reflection-title + span', (element) => element.textContent.trim());
  assert.ok(['工作', '身体', '关系', '休息', '成长'].includes(initialAspect));
  assert.match(await page.$eval('body', (element) => element.innerText), /在你能自己安排的时间里/);
  assert.equal(await page.$('#reflection-note'), null);
  await page.screenshot({ path: path.join(outputDir, 'reflection-mobile-390.png'), fullPage: true });

  await clickButton(page, '换一个方面');
  const changedAspect = await page.$eval('#reflection-title + span', (element) => element.textContent.trim());
  assert.notEqual(changedAspect, initialAspect);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click('[data-panel="reflection"] summary');
  assert.equal(await page.$eval('#reflection-title + span', (element) => element.textContent.trim()), changedAspect);

  await clickButton(page, '记下一句');
  await page.type('#reflection-note', '今天想给这一部分留一点时间。');
  await page.screenshot({ path: path.join(outputDir, 'reflection-mobile-writing-390.png'), fullPage: true });
  await clickButton(page, '保存这一句');
  assert.match(await page.$eval('body', (element) => element.innerText), /已保存在此浏览器/);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click('[data-panel="reflection"] summary');
  assert.match(await page.$eval('body', (element) => element.innerText), /今天想给这一部分留一点时间/);
  await clickButton(page, '回看记录');
  assert.match(await page.$eval('ul', (element) => element.innerText), /今天想给这一部分留一点时间/);
  page.once('dialog', async (dialog) => { await dialog.accept(); });
  await clickButton(page, '删除');
  assert.doesNotMatch(await page.$eval('body', (element) => element.innerText), /今天想给这一部分留一点时间/);
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(mobileOverflow <= 1, `Mobile horizontal overflow: ${mobileOverflow}`);

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outputDir, 'reflection-desktop-1280.png'), fullPage: true });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(desktopOverflow <= 1, `Desktop horizontal overflow: ${desktopOverflow}`);
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
  assert.ok(await page.$('.fixed.inset-0'), 'SOS opens by default');
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /1\/3/);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ mobile: '390×844 simulated Edge', desktop: '1280×800 simulated Edge', mobileOverflow, desktopOverflow, outputDir }));
} finally {
  await browser.close();
  await server.close();
}
