import assert from 'node:assert/strict';
import fs from 'node:fs';
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
const port = server.httpServer.address().port;
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });
const screenshotDir = process.env.MOS_SCREENSHOT_DIR;

function family(task) {
  if (task.category === 'translation') return `poetry_${task.mode}`;
  if (task.category === 'economist') return task.type === 'zh_to_en' ? 'economist_zh_to_en' : 'economist_cloze';
  return task.category;
}

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

const readSession = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')));

async function loadSession(page, ids, currentIndex = 0, secondsLeft = 120) {
  await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
  await page.evaluate(({ ids, currentIndex, secondsLeft }) => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode: 'sos', questions: ids.map((id) => ({ id })), currentIndex, secondsLeft, practiceIntroDismissed: true
  })), { ids, currentIndex, secondsLeft });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
}

async function swapAndExpect(page, index, expectedFamily) {
  const before = await readSession(page);
  await click(page, '换下一题');
  await page.waitForFunction(({ index, previousId }) => {
    const active = JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2'));
    return active.questions[index].id !== previousId;
  }, {}, { index, previousId: before.questions[index].id });
  const active = await readSession(page);
  assert.equal(family(active.questions[index]), expectedFamily);
  assert.equal(active.currentIndex, index, 'Skipping must not change the completed count');
  return active;
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
    await click(page, '开始 3 分钟急救');
    const opening = await readSession(page);
    assert.equal(opening.questions.length, 3);
    assert.equal(opening.questions.filter((task) => task.category === 'physical').length, 1);
    assert.equal(opening.questions.filter((task) => task.category === 'reflection').length, 1);

    await loadSession(page, ['phys_1', 'reflection_0', 'econ_trans_03'], 0, 180);
    const initialInterceptions = await page.evaluate(() => JSON.parse(localStorage.getItem('mind_over_smoke_state_v2')).totalCravingsIntercepted);
    for (const expected of [
      'reflection', 'breathing', 'film_quote', 'visual_imagery', 'poetry_en_to_zh',
      'poetry_zh_to_en', 'economist_cloze', 'economist_zh_to_en', 'physical'
    ]) await swapAndExpect(page, 0, expected);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mind_over_smoke_state_v2')).totalCravingsIntercepted), initialInterceptions);
    await page.reload({ waitUntil: 'networkidle0' });
    assert.equal(family((await readSession(page)).questions[0]), 'physical');

    await loadSession(page, ['phys_1', 'reflection_0', 'q30'], 2, 120);
    const prefix = (await readSession(page)).questions.slice(0, 2).map((task) => task.id);
    for (const expected of ['economist_zh_to_en', 'physical', 'reflection', 'breathing']) {
      const active = await swapAndExpect(page, 2, expected);
      assert.deepEqual(active.questions.slice(0, 2).map((task) => task.id), prefix);
      assert.ok(active.secondsLeft <= 120 && active.secondsLeft > 0);
      if (screenshotDir && expected === 'physical') await page.screenshot({ path: path.join(screenshotDir, `sos-last-physical-${viewport.width}.png`) });
    }
    const beforeTick = await readSession(page);
    await page.waitForFunction((seconds) => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).secondsLeft < seconds, {}, beforeTick.secondsLeft);
    assert.equal((await readSession(page)).questions[2].id, beforeTick.questions[2].id, 'Timer tick must not restore an old task');
    await page.reload({ waitUntil: 'networkidle0' });
    assert.equal(family((await readSession(page)).questions[2]), 'breathing');

    await loadSession(page, ['phys_1', 'q30', 'reflection_0'], 2);
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /换下一题/);
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `sos-last-reflection-${viewport.width}.png`) });
    await click(page, '换一个方面');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions[2].id !== 'reflection_0');
    assert.equal(family((await readSession(page)).questions[2]), 'reflection');
    await swapAndExpect(page, 2, 'breathing');

    await loadSession(page, ['reflection_0', 'phys_1', 'econ_trans_03'], 0);
    await click(page, '想过了，继续下一项');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex === 1);
    assert.equal(family((await readSession(page)).questions[1]), 'breathing', 'Advance overwrites the future seed');
    await click(page, '完成第 1 轮');
    await click(page, '完成第 2 轮');
    await click(page, '完成 3 轮镇静呼吸');
    await click(page, '继续下一项阻断');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex === 2);
    assert.equal(family((await readSession(page)).questions[2]), 'film_quote');
    await page.reload({ waitUntil: 'networkidle0' });
    assert.equal(family((await readSession(page)).questions[2]), 'film_quote');
    for (const expected of ['visual_imagery', 'poetry_en_to_zh', 'poetry_zh_to_en', 'economist_cloze', 'economist_zh_to_en']) await swapAndExpect(page, 2, expected);
    await click(page, '暂时想不出？看参考译文');
    await page.evaluate(() => {
      const finish = [...document.querySelectorAll('.fixed.inset-0 button')].find((button) => button.innerText.includes('完成本次急救'));
      finish.click();
      finish.click();
    });
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /SESSION COMPLETE/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mind_over_smoke_state_v2')).totalCravingsIntercepted), initialInterceptions + 1);

    await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
    await click(page, '日常精读 · 5 项');
    const practice = await readSession(page);
    assert.equal(practice.questions.length, 5);
    assert.equal(practice.questions.filter((task) => task.category === 'reflection').length, 1);
    await loadSession(page, ['visual_1', 'reflection_0', 'q30'], 0);
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /出门的三个镜头/);
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `visual-imagery-${viewport.width}.png`) });
    await click(page, '想好了，继续下一项');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex === 1);
    await page.goto(`http://127.0.0.1:${port}/?mode=dashboard`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
      mode: 'practice', questions: [{ id: 'judgment_5' }, { id: 'reflection_0' }, { id: 'q30' }, { id: 'phys_1' }, { id: 'visual_1' }],
      currentIndex: 0, secondsLeft: 120, practiceIntroDismissed: true
    })));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /点击率涨了，是封面的功劳吗/);
    assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /例如：不能/);
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `observation-judgment-${viewport.width}.png`) });
    await click(page, '想好了，继续下一项');
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex === 1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `Horizontal overflow at ${viewport.width}: ${overflow}`);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ viewport: `${viewport.width}x${viewport.height}`, browser: 'simulated Chrome', overflow, pageErrors: errors.length }));
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
