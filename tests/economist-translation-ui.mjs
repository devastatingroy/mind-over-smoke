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

const outputDir = 'C:\\Users\\11300\\.codex\\visualizations\\2026\\11\\06\\01a1ae50-6dea-7720-8ef1-be6a5ad774f6';
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

async function loadTask(page, id) {
  await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
  await page.evaluate((taskId) => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode: 'sos', questions: [{ id: taskId }], currentIndex: 0, secondsLeft: 180
  })), id);
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
}

try {
  const { generateSessionTasks, taskStats } = await server.ssrLoadModule('/src/utils/taskManager.js');
  assert.equal(taskStats.economist, 130);
  assert.equal(taskStats.economistTranslation, 30);
  let translationCount = 0;
  for (let i = 0; i < 600; i++) {
    const session = generateSessionTasks('sos');
    assert.equal(session.length, 3);
    assert.equal(session.filter((task) => task.category === 'physical').length, 1);
    assert.equal(session.filter((task) => task.category === 'reflection').length, 1);
    if (session.some((task) => task.category === 'economist' && task.type === 'zh_to_en')) translationCount++;
  }
  assert.ok(translationCount > 60 && translationCount < 180, `Unexpected new-form exposure: ${translationCount}/600`);
  for (let i = 0; i < 100; i++) {
    const practice = generateSessionTasks('practice');
    assert.equal(practice.length, 5);
    assert.equal(practice.filter((task) => task.category === 'reflection').length, 1);
    assert.ok(practice.some((task) => task.category === 'economist'));
    assert.equal(new Set(practice.map((task) => task.id)).size, 5);
  }

  for (const viewport of [
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 1280, height: 800, deviceScaleFactor: 1 }
  ]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport(viewport);
    await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
    await loadTask(page, 'econ_trans_01');
    assert.match(await page.$eval('body', (element) => element.innerText), /原创论断英译/);
    assert.ok(await page.$('#economist-translation-answer'));
    await clickButton(page, '查看表达提示');
    assert.match(await page.$eval('body', (element) => element.innerText), /calling/);
    await page.screenshot({ path: path.join(outputDir, `economist-before-${viewport.width}.png`) });
    await page.type('#economist-translation-answer', 'A cigarette is not real income.');
    await clickButton(page, '提交并对照参考译文');
    const answered = await page.$eval('body', (element) => element.innerText);
    assert.match(answered, /你的译文/);
    assert.match(answered, /关键表达/);
    assert.match(answered, /Calling a pack/);
    assert.doesNotMatch(answered, /回答正确/);
    const clickable = await page.$('p [title="点击查看音标与释义"]');
    assert.ok(clickable, 'Reference translation should offer offline word lookup');
    await clickable.click();
    assert.ok(await page.$('[aria-label="关闭单词释义"]'));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `Horizontal overflow at ${viewport.width}: ${overflow}`);
    await page.screenshot({ path: path.join(outputDir, `economist-after-${viewport.width}.png`) });
    await page.evaluate(() => {
      const scrollPane = document.querySelector('.fixed.inset-0 .overflow-y-auto');
      scrollPane.scrollTop = scrollPane.scrollHeight;
    });
    await page.screenshot({ path: path.join(outputDir, `economist-feedback-${viewport.width}.png`) });

    await loadTask(page, 'econ_trans_02');
    assert.equal(await page.$eval('#economist-translation-answer', (element) => element.value), '');
    await clickButton(page, '暂时想不出？看参考译文');
    assert.match(await page.$eval('body', (element) => element.innerText), /已跳过作答/);
    await loadTask(page, 'q1');
    assert.ok(await page.$('button[title="点击展开/收起完整中文对照翻译"]'));
    await loadTask(page, 'trans_2');
    assert.ok(await page.$('#translation-answer'));
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, browser: 'headless Edge/Chrome emulation', overflow }));
    await page.close();
  }
  console.log(JSON.stringify({ economistTranslationIn600Sos: translationCount, outputDir }));
} finally {
  await browser.close();
  await server.close();
}
