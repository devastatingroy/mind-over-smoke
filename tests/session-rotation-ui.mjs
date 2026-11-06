import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath);
const outputDir = 'C:\\Users\\11300\\.codex\\visualizations\\2026\\11\\06\\01a1b070-bb4a-7fb3-9292-3e94d008f027';
fs.mkdirSync(outputDir, { recursive: true });
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const port = server.httpServer.address().port;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });

async function click(page, label) {
  const scope = await page.$('.fixed.inset-0') || page;
  for (const button of await scope.$$('button')) {
    if ((await button.evaluate((node) => node.innerText))?.includes(label)) {
      await button.click();
      return;
    }
  }
  throw new Error(`Missing button: ${label}`);
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
    await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
    await click(page, '启动 3 分钟急救干预');
    const newSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')));
    assert.equal(newSession.questions.length, 3);
    assert.equal(newSession.questions.filter((task) => task.category === 'physical').length, 1);
    assert.equal(newSession.questions.filter((task) => task.category === 'reflection').length, 1);

    await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
      mode: 'sos', questions: [{ id: 'reflection_0' }, { id: 'phys_1' }, { id: 'econ_trans_13' }],
      currentIndex: 0, secondsLeft: 180, practiceIntroDismissed: true
    })));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    const modal = '.fixed.inset-0';
    assert.match(await page.$eval(modal, (node) => node.innerText), /你真的没有其他事可做了吗？/);
    assert.match(await page.$eval(modal, (node) => node.innerText), /留给工作的时间够用吗/);
    await page.screenshot({ path: path.join(outputDir, `reflection-task-${viewport.width}.png`) });
    await click(page, '换一个方面');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions[0].id !== 'reflection_0');
    const swappedId = await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions[0].id);
    assert.notEqual(swappedId, 'reflection_0');
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions[0].id), swappedId);
    await click(page, '想过了，继续下一项');
    assert.match(await page.$eval(modal, (node) => node.innerText), /2\/3/);
    await click(page, '我已一口气全部做完');
    await click(page, '继续下一项阻断');
    assert.match(await page.$eval(modal, (node) => node.innerText), /3\/3/);
    assert.ok(await page.$('#economist-translation-answer'));
    await click(page, '暂时想不出？看参考译文');
    assert.match(await page.$eval(modal, (node) => node.innerText), /参考译文/);
    await click(page, '完成本次急救');
    assert.match(await page.$eval(modal, (node) => node.innerText), /成功/);
    await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
    await click(page, '日常精读（5项）');
    const practiceSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')));
    assert.equal(practiceSession.questions.length, 5);
    assert.equal(practiceSession.questions.filter((task) => task.category === 'reflection').length, 1);
    const reflectionIndex = practiceSession.questions.findIndex((task) => task.category === 'reflection');
    await page.evaluate((index) => {
      const session = JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2'));
      session.currentIndex = index;
      sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify(session));
    }, reflectionIndex);
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    assert.match(await page.$eval(modal, (node) => node.innerText), /你真的没有其他事可做了吗？/);
    assert.match(await page.$eval(modal, (node) => node.innerText), new RegExp(`${reflectionIndex + 1}/5`));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `Horizontal overflow at ${viewport.width}: ${overflow}`);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ viewport: `${viewport.width}×${viewport.height}`, browser: 'headless Edge/Chrome simulation', overflow, errors: errors.length }));
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
