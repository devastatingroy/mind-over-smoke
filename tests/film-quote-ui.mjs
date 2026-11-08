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
assert.ok(browserPath, 'Edge or Chrome is required');
const outputDir = path.join(os.tmpdir(), 'mind-over-smoke-film-quote-ui');
fs.mkdirSync(outputDir, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const port = server.httpServer.address().port;
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

async function loadQuote(page, id, secondsLeft = 180) {
  await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
  await page.evaluate(({ id, secondsLeft }) => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode: 'sos', questions: [{ id }], currentIndex: 0, secondsLeft, practiceIntroDismissed: true
  })), { id, secondsLeft });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
}

try {
  for (const viewport of [
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport(viewport);
    await loadQuote(page, 'film_001');
    assert.match(await page.$eval('body', (node) => node.innerText), /Fear causes hesitation/);
    assert.equal(await page.$$eval('.fixed.inset-0 button', (buttons) => buttons.filter((button) => button.innerText.includes('换下一题')).length), 2);
    await page.screenshot({ path: path.join(outputDir, `film-study-${viewport.width}.png`) });
    await click(page, '开始 10 秒背诵');
    assert.doesNotMatch(await page.$eval('body', (node) => node.innerText), /Fear causes hesitation/);
    await page.screenshot({ path: path.join(outputDir, `film-recite-${viewport.width}.png`) });
    await page.waitForFunction(() => document.body.innerText.includes('10 秒结束'), { timeout: 15_000 });
    assert.doesNotMatch(await page.$eval('body', (node) => node.innerText), /Fear causes hesitation/);
    await click(page, '核对原句');
    assert.match(await page.$eval('body', (node) => node.innerText), /Fear causes hesitation/);
    assert.doesNotMatch(await page.$eval('body', (node) => node.innerText), /VERDICT · 判词/);
    assert.equal(await page.$eval('[data-quiz-continue="top"] button', (button) => {
      const rect = button.getBoundingClientRect();
      return button.innerText.includes('完成本次急救') && rect.top >= 0 && rect.bottom <= innerHeight &&
        button.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
    }), true, 'Film quote should also expose the top completion action after reveal');
    await page.screenshot({ path: path.join(outputDir, `film-revealed-${viewport.width}.png`) });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `Horizontal overflow at ${viewport.width}px`);
    assert.deepEqual(errors, []);
    await page.close();
  }

  const page = await browser.newPage();
  await loadQuote(page, 'film_008', 2);
  assert.match(await page.$eval('body', (node) => node.innerText), /功夫，两个字/);
  assert.match(await page.$eval('body', (node) => node.innerText), /中文原声/);
  await click(page, '开始 10 秒背诵');
  await page.reload({ waitUntil: 'networkidle0' });
  assert.match(await page.$eval('body', (node) => node.innerText), /功夫，两个字/);
  assert.match(await page.$eval('body', (node) => node.innerText), /开始 10 秒背诵/);
  await page.close();
  const longQuotePage = await browser.newPage();
  await longQuotePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await loadQuote(longQuotePage, 'film_022');
  assert.match(await longQuotePage.$eval('body', (node) => node.innerText), /You don't change the world simply/);
  assert.equal(await longQuotePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
  await longQuotePage.screenshot({ path: path.join(outputDir, 'film-long-390.png') });
  await click(longQuotePage, '开始 10 秒背诵');
  assert.doesNotMatch(await longQuotePage.$eval('body', (node) => node.innerText), /You don't change the world simply/);
  await longQuotePage.close();
  console.log('Film quote flow, 10-second recall, reload, and 390/1280px layouts verified.');
} finally {
  await browser.close();
  await server.close();
}
