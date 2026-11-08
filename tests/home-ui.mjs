import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';
import { localDaySerial } from '../src/utils/challenge.js';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath, 'Edge or Chrome is required');

const outputDir = process.env.MOS_SCREENSHOT_DIR;
if (outputDir) fs.mkdirSync(outputDir, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const port = server.httpServer.address().port;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });

try {
  for (const viewport of [
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport(viewport);
    const base = `http://127.0.0.1:${port}/`;
    await page.goto(`${base}?mode=dashboard`, { waitUntil: 'networkidle0' });

    assert.match(await page.$eval('main', (element) => element.innerText), /开始 3 分钟急救/);
    assert.doesNotMatch(await page.$eval('main', (element) => element.innerText), /生理修复|测试与急救演示工具箱|池化/);
    assert.equal(await page.$eval('[data-panel="challenge"]', (element) => element.open), false);
    assert.equal(await page.$eval('[data-panel="reflection"]', (element) => element.open), false);
    assert.ok((await page.$eval('main', (element) => element.getBoundingClientRect().height)) < 750);
    if (outputDir) await page.screenshot({ path: path.join(outputDir, `home-default-${viewport.width}.png`) });

    await page.click('[data-panel="challenge"] summary');
    assert.match(await page.$eval('[data-panel="challenge"]', (element) => element.innerText), /没有收取 \$20/);
    await page.click('[data-panel="challenge"] summary');
    await page.click('[data-panel="reflection"] summary');
    assert.match(await page.$eval('[data-panel="reflection"]', (element) => element.innerText), /在你能自己安排的时间里/);
    await page.click('[data-panel="reflection"] summary');

    const yesterday = localDaySerial(Date.now(), 'Asia/Shanghai') - 1;
    await page.evaluate((day) => {
      const state = JSON.parse(localStorage.getItem('mind_over_smoke_state_v2'));
      state.challenge = { startDay: day, timeZone: 'Asia/Shanghai', reports: {} };
      localStorage.setItem('mind_over_smoke_state_v2', JSON.stringify(state));
    }, yesterday);
    await page.reload({ waitUntil: 'networkidle0' });
    assert.match(await page.$eval('[data-panel="challenge"] summary', (element) => element.innerText), /第 1 天待申报/);
    if (outputDir) await page.screenshot({ path: path.join(outputDir, `home-report-due-${viewport.width}.png`) });
    await page.click('[data-panel="challenge"] summary');
    await page.click('main button');
    assert.ok(await page.$('.fixed.inset-0'), 'SOS can reopen from the home screen');
    await page.click('button[title="关闭并返回看板"]');
    assert.equal(await page.$('.fixed.inset-0'), null);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `Horizontal overflow at ${viewport.width}px: ${overflow}`);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, overflow, pageErrors: errors.length }));
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
