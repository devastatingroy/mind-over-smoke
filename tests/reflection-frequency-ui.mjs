import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath, 'Edge or Chrome is required');
const outputDir = 'C:\\Users\\11300\\.codex\\visualizations\\2026\\11\\06\\01a1ae34-17a9-79b2-836f-06326e8b580a';
fs.mkdirSync(outputDir, { recursive: true });

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const url = `http://127.0.0.1:${server.httpServer.address().port}/`;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });

async function button(page, label) {
  const modal = await page.$('.fixed.inset-0');
  for (const item of modal ? await modal.$$('button') : await page.$$('button')) {
    const text = await item.evaluate((element) => element.innerText);
    if (text?.includes(label)) return item;
  }
  throw new Error(`Button not found: ${label}`);
}

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${url}?mode=dashboard`, { waitUntil: 'networkidle0' });
  await (await button(page, '日常精读（5题＋1问）')).click();
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /思考问题/);
  assert.ok(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'));
  const originalAspect = await page.$eval('.fixed.inset-0 section[aria-label="生活的一角"]', (element) => element.innerText);
  await page.evaluate(() => history.replaceState(null, '', location.pathname));
  await page.screenshot({ path: path.join(outputDir, 'reflection-practice-mobile-390.png'), fullPage: false });
  await page.reload({ waitUntil: 'networkidle0' });
  assert.match(await page.$eval('.fixed.inset-0 section[aria-label="生活的一角"]', (element) => element.innerText), /在你能自己安排的时间里/);
  await (await button(page, '换一个方面')).click();
  const changedAspect = await page.$eval('.fixed.inset-0 section[aria-label="生活的一角"]', (element) => element.innerText);
  assert.notEqual(changedAspect, originalAspect);
  await page.reload({ waitUntil: 'networkidle0' });
  assert.equal(await page.$eval('.fixed.inset-0 section[aria-label="生活的一角"]', (element) => element.innerText), changedAspect);
  await (await button(page, '记下一句')).click();
  await page.type('#session-reflection-note', '练习中记下的一句。');
  await (await button(page, '保存这一句')).click();
  await (await button(page, '直接开始刷题')).click();
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /1\/5/);
  assert.equal(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'), null);
  await page.reload({ waitUntil: 'networkidle0' });
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /1\/5/);
  await (await page.$('button[title="关闭并返回看板"]')).click();

  await (await button(page, '启动 3 分钟急救干预')).click();
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /1\/3/);
  assert.ok(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'));
  await page.screenshot({ path: path.join(outputDir, 'reflection-sos-mobile-390.png'), fullPage: false });
  await (await button(page, '换下一题')).click();
  assert.ok(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'));
  await (await page.$('button[title="关闭并返回看板"]')).click();
  await (await button(page, '启动 3 分钟急救干预')).click();
  assert.equal(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'), null);
  await (await button(page, '看看生活问题')).click();
  assert.ok(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'));
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(mobileOverflow <= 1, `Mobile overflow: ${mobileOverflow}`);

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(outputDir, 'reflection-sos-desktop-1280.png'), fullPage: false });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(desktopOverflow <= 1, `Desktop overflow: ${desktopOverflow}`);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ mobile: '390×844 simulated Edge', desktop: '1280×800 simulated Edge', mobileOverflow, desktopOverflow, outputDir }));
} finally {
  await browser.close();
  await server.close();
}
