import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { localDaySerial } from '../src/utils/challenge.js';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath, 'A browser is required for visual verification');

const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });
async function clickButton(page, text) {
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const label = await button.evaluate((element) => element.innerText);
    if (label?.includes(text)) {
      await button.click();
      return;
    }
  }
  throw new Error(`Button not found: ${text}`);
}
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:3000/?mode=dashboard', { waitUntil: 'networkidle0' });
  assert.match(await page.locator('body').map((el) => el.innerText).wait(), /当前为免费体验/);
  await clickButton(page, '开始免费体验');
  assert.match(await page.locator('body').map((el) => el.innerText).wait(), /准备日/);

  const yesterday = localDaySerial(Date.now(), 'Asia/Shanghai') - 1;
  await page.evaluate((day) => {
    const state = JSON.parse(localStorage.getItem('mind_over_smoke_state_v2'));
    state.challenge = { startDay: day, timeZone: 'Asia/Shanghai', reports: {} };
    localStorage.setItem('mind_over_smoke_state_v2', JSON.stringify(state));
  }, yesterday);
  await page.reload({ waitUntil: 'networkidle0' });
  await clickButton(page, '申报这一天');
  await clickButton(page, '确认：一口也没吸');
  assert.match(await page.locator('body').map((el) => el.innerText).wait(), /模拟符合返款\s*\$1/);
  assert.doesNotMatch(await page.locator('body').map((el) => el.innerText).wait(), /已成功返还|已到账/);
  const mobileWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(mobileWidth <= 1, `Mobile horizontal overflow: ${mobileWidth}px`);
  const mobilePath = path.join(os.tmpdir(), 'mind-over-smoke-390.png');
  await page.screenshot({ path: mobilePath, fullPage: true });

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  const desktopWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(desktopWidth <= 1, `Desktop horizontal overflow: ${desktopWidth}px`);
  const desktopPath = path.join(os.tmpdir(), 'mind-over-smoke-1280.png');
  await page.screenshot({ path: desktopPath, fullPage: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ mobilePath, desktopPath, mobileWidth, desktopWidth }));
} finally {
  await browser.close();
}
