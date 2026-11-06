import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

const executablePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(executablePath, 'A browser is required');

const server = await preview({ preview: { port: 4178, strictPort: true } });
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
try {
  for (const viewport of [
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport(viewport);
    await page.goto('http://127.0.0.1:4178/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
      mode: 'sos', questions: [{ id: 'q1' }], currentIndex: 0, secondsLeft: 180
    })));
    await page.reload({ waitUntil: 'networkidle0' });

    const reveal = await page.$('button[title="暂时想不出？点击看正确答案"]') ||
      await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(button => button.innerText.includes('暂时想不出？点击看正确答案')));
    assert.ok(await reveal.evaluate(element => !!element), `Reveal button missing: ${(await page.evaluate(() => document.body.innerText)).slice(0, 500)}`);
    await reveal.click();
    const verdict = await page.waitForSelector('blockquote [title="点击查看音标与释义"]');
    assert.ok(verdict);
    const financial = await page.evaluateHandle(() => [...document.querySelectorAll('blockquote [title="点击查看音标与释义"]')]
      .find(element => element.textContent.trim().toLowerCase() === 'financial'));
    assert.ok(await financial.evaluate(element => !!element));
    await financial.click();
    const card = await page.waitForSelector('[aria-label="关闭单词释义"]');
    const definition = await card.evaluate(button => button.parentElement.innerText);
    assert.match(definition, /financial|金融|财务/i);
    assert.doesNotMatch(definition, /词典暂未收录/);
    const box = await card.evaluate(button => {
      const rect = button.parentElement.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, width: rect.width };
    });
    assert.ok(box.top >= 0 && box.bottom <= viewport.height + 1, `Inspector out of view: ${JSON.stringify(box)}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `Horizontal overflow: ${overflow}`);
    assert.deepEqual(errors, []);
    const screenshot = path.join(os.tmpdir(), `mind-over-smoke-dictionary-${viewport.width}.png`);
    await page.screenshot({ path: screenshot });

    for (const token of ['write', 'down']) {
      const target = await page.evaluateHandle(word => [...document.querySelectorAll('blockquote [title="点击查看音标与释义"]')]
        .find(element => element.textContent.trim().toLowerCase() === word), token);
      assert.ok(await target.evaluate(element => !!element), `${token} should be individually clickable`);
      await target.click();
      const actual = await page.$eval('[aria-label="关闭单词释义"]', button => button.parentElement.innerText);
      assert.match(actual.toLowerCase(), new RegExp(`^${token}\\b`));
      assert.doesNotMatch(actual, /词典暂未收录/);
    }
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, mode: 'Edge headless emulation', definition, box, overflow, screenshot }));
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
