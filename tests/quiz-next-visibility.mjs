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

const server = process.env.MOS_LIVE_URL ? null : await createServer({ server: { host: '127.0.0.1', port: 0 } });
if (server) await server.listen();
const appUrl = process.env.MOS_LIVE_URL || `http://127.0.0.1:${server.httpServer.address().port}/`;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });

try {
  for (const viewport of [
    { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(new URL('?mode=dashboard', appUrl).toString(), { waitUntil: 'networkidle0' });
    await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
      mode: 'sos', questions: [{ id: 'q30' }, { id: 'phys_1' }, { id: 'reflection_0' }],
      currentIndex: 0, secondsLeft: 68, practiceIntroDismissed: true
    })));
    await page.goto(appUrl, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('button')].find((button) => button.innerText.includes('inertia') && button.innerText.includes('选择'));
      if (!option) throw new Error('Correct answer option missing');
      option.click();
    });
    await page.waitForFunction(() => document.body.innerText.includes('回答正确'));
    const layout = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 > div');
      const body = [...modal.querySelectorAll('div')].find((element) => element.classList.contains('overflow-y-auto'));
      const next = [...modal.querySelectorAll('button')].find((button) => button.innerText.includes('继续下一项阻断'));
      const rect = next.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        nextTop: rect.top, nextBottom: rect.bottom, viewportHeight: innerHeight,
        nextCenterX: centerX, nextCenterY: centerY,
        modalBottom: modal.getBoundingClientRect().bottom,
        bodyTop: body.getBoundingClientRect().top,
        bodyBottom: body.getBoundingClientRect().bottom,
        bodyClientHeight: body.clientHeight, bodyScrollHeight: body.scrollHeight,
        scrollTop: body.scrollTop,
        nextVisible: rect.top >= 0 && rect.bottom <= Math.min(innerHeight, modal.getBoundingClientRect().bottom) &&
          next.contains(document.elementFromPoint(centerX, centerY)),
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    const screenshot = path.join(os.tmpdir(), `mind-over-smoke-next-${viewport.width}.png`);
    await page.screenshot({ path: screenshot });
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, layout, screenshot }));
    assert.ok(layout.nextVisible, 'Continue button should be visible immediately after the correct answer');
    assert.ok(layout.horizontalOverflow <= 1, 'Answer layout should not overflow horizontally');
    if (layout.bodyScrollHeight > layout.bodyClientHeight) {
      if (viewport.hasTouch) {
        const startY = layout.bodyBottom - 60;
        await page.touchscreen.touchStart(viewport.width / 2, startY);
        await page.touchscreen.touchMove(viewport.width / 2, Math.max(layout.bodyTop + 30, startY - 130));
        await page.touchscreen.touchEnd();
      } else {
        await page.evaluate(() => {
          const body = document.querySelector('.fixed.inset-0 > div > .overflow-y-auto');
          body.scrollTop = body.scrollHeight;
        });
      }
      await page.waitForFunction(() => document.querySelector('.fixed.inset-0 > div > .overflow-y-auto').scrollTop > 0);
      assert.ok(await page.$eval('.fixed.inset-0 > div > .overflow-y-auto', (body) => body.scrollTop > 0), 'Answer details should remain scrollable');
    }
    if (viewport.hasTouch) await page.touchscreen.tap(layout.nextCenterX, layout.nextCenterY);
    else await page.mouse.click(layout.nextCenterX, layout.nextCenterY);
    await page.waitForFunction(() => document.body.innerText.includes('2/3'));
    await page.close();
  }
} finally {
  await browser.close();
  if (server) await server.close();
}
