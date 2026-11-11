import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const browserPath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].find(fs.existsSync);
assert.ok(browserPath);
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const url = `http://127.0.0.1:${server.httpServer.address().port}/`;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });

async function click(page, label) {
  const buttons = await page.$$('.fixed.inset-0 button');
  for (const button of buttons) {
    if ((await button.evaluate((node) => node.innerText)).includes(label)) {
      await button.click();
      return;
    }
  }
  throw new Error(`Missing button: ${label}`);
}

async function load(page, ids, mode = 'sos') {
  await page.goto(`${url}?mode=dashboard`, { waitUntil: 'networkidle0' });
  await page.evaluate(({ ids, mode }) => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode, questions: ids.map((id) => ({ id })), currentIndex: 0, secondsLeft: 180, practiceIntroDismissed: true
  })), { ids, mode });
  await page.goto(url, { waitUntil: 'networkidle0' });
}

const session = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')));

try {
  for (const viewport of [
    { width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport(viewport);
    await load(page, ['phys_1', 'reflection_0', 'q30']);
    await click(page, '换下一题');
    await click(page, '换下一题');
    const afterSkip = await session(page);
    assert.equal(afterSkip.currentIndex, 0);
    assert.deepEqual(afterSkip.history.map(({ outcome }) => outcome), ['skipped', 'skipped', 'live']);
    await click(page, '完成第 1 轮');
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /第 2 \/ 3 轮/);
    await click(page, '上一题');
    assert.match(await page.$eval('[aria-label="回顾上一题"]', (node) => node.innerText), /已跳过/);
    const reviewScreenshot = path.join(os.tmpdir(), `mind-over-smoke-review-${viewport.width}.png`);
    await page.screenshot({ path: reviewScreenshot });
    await click(page, '上一题');
    assert.match(await page.$eval('[aria-label="回顾上一题"]', (node) => node.innerText), /做 10 个俯卧撑/);
    await click(page, '返回当前题');
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /第 2 \/ 3 轮/);
    assert.equal((await session(page)).currentIndex, 0);
    const layout = await page.evaluate(() => {
      const nav = document.querySelector('[aria-label="题目回顾"]');
      const rect = nav.getBoundingClientRect();
      return { navVisible: rect.top >= 0 && rect.bottom <= innerHeight, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    assert.ok(layout.navVisible && layout.overflow <= 1);
    const screenshot = path.join(os.tmpdir(), `mind-over-smoke-history-${viewport.width}.png`);
    await page.screenshot({ path: screenshot });
    await click(page, '上一题');
    await page.reload({ waitUntil: 'networkidle0' });
    assert.doesNotMatch(await page.$eval('.fixed.inset-0', (node) => node.innerText), /回顾中/);
    await click(page, '上一题');
    assert.match(await page.$eval('[aria-label="回顾上一题"]', (node) => node.innerText), /已跳过/);
    assert.equal((await session(page)).history.length, 3);

    await load(page, ['reflection_0', 'phys_1', 'q30']);
    await click(page, '想过了，继续下一项');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex === 1);
    await click(page, '上一题');
    assert.match(await page.$eval('[aria-label="回顾上一题"]', (node) => node.innerText), /已完成/);
    assert.equal((await session(page)).currentIndex, 1);
    await click(page, '返回当前题');
    assert.equal((await session(page)).currentIndex, 1);

    await load(page, ['visual_1', 'reflection_0', 'q30', 'phys_1', 'breathe_1'], 'practice');
    await click(page, '想好了，继续下一项');
    await click(page, '上一题');
    assert.match(await page.$eval('[aria-label="回顾上一题"]', (node) => node.innerText), /已完成/);
    assert.equal((await session(page)).currentIndex, 1);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, browser: 'simulated Chrome', screenshot, reviewScreenshot, layout }));
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
