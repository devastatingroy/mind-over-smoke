import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const browserPath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].find(fs.existsSync);
assert.ok(browserPath);
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const siteUrl = process.env.MOS_LIVE_URL || 'https://royfree.men/';
const dashboardUrl = new URL('?mode=dashboard', siteUrl).toString();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

async function click(label) {
  const scope = await page.$('.fixed.inset-0') || page;
  for (const button of await scope.$$('button')) {
    if ((await button.evaluate((node) => node.innerText))?.includes(label)) {
      await button.click();
      return;
    }
  }
  throw new Error(`Button not found: ${label}`);
}

try {
  const response = await page.goto(new URL(`?release-check=${Date.now()}`, siteUrl).toString(), { waitUntil: 'networkidle0', timeout: 45_000 });
  assert.equal(response.status(), 200);
  const session = await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')));
  assert.equal(session.questions.length, 3);
  assert.equal(session.questions.filter((task) => task.category === 'physical').length, 1);
  assert.equal(session.questions.filter((task) => task.category === 'reflection').length, 1);
  const reflectionIndex = session.questions.findIndex((task) => task.category === 'reflection');
  await page.evaluate((index) => {
    const saved = JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2'));
    saved.currentIndex = index;
    sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify(saved));
  }, reflectionIndex);
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /你真的没有其他事可做了吗？/);
  await click('换一个方面');
  await page.waitForFunction((id) => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions.some((task) => task.category === 'reflection' && task.id !== id), {}, session.questions[reflectionIndex].id);

  await page.goto(dashboardUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode: 'sos', questions: [{ id: 'phys_1' }, { id: 'reflection_0' }, { id: 'econ_trans_03' }],
    currentIndex: 0, secondsLeft: 180, practiceIntroDismissed: true
  })));
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  for (const category of ['reflection', 'breathing', 'film_quote']) {
    await click('换下一题');
    await page.waitForFunction((expected) => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions[0].category === expected, {}, category);
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex), 0);
  }

  await page.goto(dashboardUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode: 'sos', questions: [{ id: 'phys_1' }, { id: 'reflection_0' }, { id: 'q30' }],
    currentIndex: 2, secondsLeft: 120, practiceIntroDismissed: true
  })));
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  await click('换下一题');
  await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).questions[2].type === 'zh_to_en');
  assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')).currentIndex), 2);

  await page.goto(dashboardUrl, { waitUntil: 'networkidle0' });
  await click('日常精读（5项）');
  const practice = await page.evaluate(() => JSON.parse(sessionStorage.getItem('mind_over_smoke_active_session_v2')));
  assert.equal(practice.questions.length, 5);
  assert.equal(practice.questions.filter((task) => task.category === 'reflection').length, 1);

  await page.goto(dashboardUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
    mode: 'sos', questions: [{ id: 'econ_trans_28' }], currentIndex: 0, secondsLeft: 180
  })));
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  assert.ok(await page.$('#economist-translation-answer'));
  assert.match(await page.$eval('.fixed.inset-0', (node) => node.innerText), /忠实顾客/);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ production: siteUrl, viewport: '390×844 simulated Chrome', sos: 'three completions', skipCycle: 'reflection -> breathing -> film quote; last slot crosses format', practice: 'five items including reflection', newQuestion: 'econ_trans_28', pageErrors: errors.length }));
} finally {
  await browser.close();
}
