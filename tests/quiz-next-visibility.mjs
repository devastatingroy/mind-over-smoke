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
    { width: 360, height: 600, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    for (const questionId of ['q30', 'trans_48']) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(new URL('?mode=dashboard', appUrl).toString(), { waitUntil: 'networkidle0' });
    await page.evaluate((id) => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
      mode: 'sos', questions: [{ id }, { id: 'phys_1' }, { id: 'reflection_0' }],
      currentIndex: 0, secondsLeft: 0, practiceIntroDismissed: true
    })), questionId);
    await page.goto(appUrl, { waitUntil: 'networkidle0' });
    await page.evaluate((id) => {
      const label = id === 'q30' ? 'inertia' : '我想到了 · 揭晓原诗对照';
      const option = [...document.querySelectorAll('button')].find((button) => button.innerText.includes(label));
      if (!option) throw new Error(`Answer action missing for ${id}`);
      option.click();
    }, questionId);
    await page.waitForFunction(() => document.querySelector('[data-quiz-continue="top"] button'));
    const layout = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 > div');
      const body = [...modal.querySelectorAll('div')].find((element) => element.classList.contains('overflow-y-auto'));
      const next = modal.querySelector('[data-quiz-continue="top"] button');
      const bottom = modal.querySelector('[data-quiz-continue="bottom"] button');
      const rect = next.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        nextTop: rect.top, nextBottom: rect.bottom, viewportHeight: innerHeight,
        nextCenterX: centerX, nextCenterY: centerY,
        bottomExists: Boolean(bottom),
        maxHeightRule: [...document.styleSheets].flatMap((sheet) => {
          try { return [...sheet.cssRules].flatMap((rule) => rule.cssText.includes('.quiz-modal-panel') ? [rule.cssText] : []); }
          catch { return []; }
        }).join(' '),
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
    const screenshot = path.join(os.tmpdir(), `mind-over-smoke-next-${questionId}-${viewport.width}.png`);
    await page.screenshot({ path: screenshot });
    console.log(JSON.stringify({ questionId, viewport: `${viewport.width}x${viewport.height}`, layout, screenshot }));
    assert.ok(layout.nextVisible, 'Continue button should be visible immediately after the correct answer');
    assert.ok(layout.bottomExists, 'Bottom continue button should remain available');
    assert.match(layout.maxHeightRule, /94svh/, 'Panel should use the small viewport height');
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
      assert.ok(await page.$eval('[data-quiz-continue="top"] button', (button) => {
        const rect = button.getBoundingClientRect();
        return button.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
      }), 'Top continue action should remain reachable after scrolling the answer');
    }
    if (viewport.hasTouch) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await page.touchscreen.tap(layout.nextCenterX, layout.nextCenterY);
    }
    else await page.mouse.click(layout.nextCenterX, layout.nextCenterY);
    await page.waitForFunction(() => document.body.innerText.includes('2/3'), { timeout: 5_000 }).catch(async (error) => {
      console.log(JSON.stringify({ questionId, viewport: `${viewport.width}x${viewport.height}`, afterTap: await page.evaluate(() => document.querySelector('.fixed.inset-0')?.innerText.slice(0, 350)) }));
      throw error;
    });
    await page.close();
    }
  }
} finally {
  await browser.close();
  if (server) await server.close();
}
