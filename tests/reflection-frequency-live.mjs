import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath, 'Edge or Chrome is required');

const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

async function click(label) {
  const modal = await page.$('.fixed.inset-0');
  const buttons = await modal.$$('button');
  for (const button of buttons) {
    if ((await button.evaluate((element) => element.innerText))?.includes(label)) {
      await button.click();
      return;
    }
  }
  throw new Error(`Button not found: ${label}`);
}

try {
  const response = await page.goto(`https://royfree.men/?reflection-frequency-check=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 45_000 });
  assert.equal(response.status(), 200);
  assert.match(await page.content(), /index-g4cTiLiC\.js/, 'production HTML should reference this release');
  await page.waitForSelector('.fixed.inset-0 section[aria-label="生活的一角"]');
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /1\/3/);
  await click('换下一题');
  assert.ok(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'));
  await (await page.$('button[title="关闭并返回看板"]')).click();
  await page.reload({ waitUntil: 'networkidle0' });
  assert.equal(await page.$('.fixed.inset-0 section[aria-label="生活的一角"]'), null, 'SOS should not auto-repeat today');
  await (await page.$('button[title="关闭并返回看板"]')).click();
  const practice = await page.$$('button');
  const practiceButton = await Promise.all(practice.map(async (button) => ({ button, text: await button.evaluate((element) => element.innerText) })));
  const start = practiceButton.find(({ text }) => text?.includes('日常精读（5题＋1问）'))?.button;
  assert.ok(start);
  await start.click();
  await page.waitForSelector('.fixed.inset-0 section[aria-label="生活的一角"]');
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /思考问题/);
  await click('直接开始刷题');
  assert.match(await page.$eval('.fixed.inset-0', (element) => element.innerText), /1\/5/);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ production: 'https://royfree.men/', releaseAsset: 'index-g4cTiLiC.js', viewport: '390×844 simulated Edge', sos: 'first prompt, next task, once daily', practice: 'one optional prompt before five tasks', pageErrors: errors.length }));
} finally {
  await browser.close();
}
