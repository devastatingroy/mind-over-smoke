import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const browserPath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].find(fs.existsSync);
assert.ok(browserPath, 'Edge or Chrome is required');

const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  const writes = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.method() !== 'GET') writes.push({ method: request.method(), url: request.url(), body: request.postData() || '' });
  });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const response = await page.goto(`https://royfree.men/?mode=dashboard&reflection-check=${Date.now()}`, { waitUntil: 'networkidle0', timeout: 45_000 });
  assert.equal(response.status(), 200);
  try {
    await page.waitForSelector('#reflection-title', { timeout: 15_000 });
  } catch (error) {
    console.error(JSON.stringify({ url: page.url(), errors, title: await page.title(), body: (await page.$eval('body', (element) => element.innerText)).slice(0, 500) }));
    throw error;
  }
  const question = await page.$eval('#reflection-title', (heading) => heading.parentElement.parentElement.innerText);
  assert.match(question, /生活的一角/);
  assert.match(question, /在你能自己安排的时间里/);
  const outputDir = 'C:\\Users\\11300\\.codex\\visualizations\\2026\\11\\06\\01a1ae34-17a9-79b2-836f-06326e8b580a';
  fs.mkdirSync(outputDir, { recursive: true });
  await page.screenshot({ path: path.join(outputDir, 'reflection-live-mobile-390.png'), fullPage: true });
  const noteButton = await page.$$('button');
  for (const button of noteButton) {
    if ((await button.evaluate((element) => element.innerText)) === '记下一句') {
      await button.click();
      break;
    }
  }
  await page.type('#reflection-note', '线上验证短句');
  const saveButtons = await page.$$('button');
  for (const button of saveButtons) {
    if ((await button.evaluate((element) => element.innerText)) === '保存这一句') {
      await button.click();
      break;
    }
  }
  assert.match(await page.$eval('body', (element) => element.innerText), /线上验证短句/);
  await page.reload({ waitUntil: 'networkidle0' });
  assert.match(await page.$eval('body', (element) => element.innerText), /线上验证短句/);
  assert.deepEqual(writes.filter((request) => !request.url.includes('/cdn-cgi/rum')), [], 'reflection should not send application writes');
  assert.ok(writes.every((request) => !request.body.includes('线上验证短句')), 'reflection text should not be sent in requests');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: response.status(), question: question.trim().split('\n').slice(0, 3), applicationWrites: writes.filter((request) => !request.url.includes('/cdn-cgi/rum')).length, cloudflareRumRequests: writes.length, outputDir }));
} finally {
  await browser.close();
}
