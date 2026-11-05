import assert from 'node:assert/strict';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

// Run with the local Vite server on http://127.0.0.1:5173/.

const questions = JSON.parse(fs.readFileSync('src/data/questions.json', 'utf8'));
const translations = JSON.parse(fs.readFileSync('src/data/tang_translation.json', 'utf8'));
const physical = JSON.parse(fs.readFileSync('src/data/physical_tasks.json', 'utf8'));
const breathing = JSON.parse(fs.readFileSync('src/data/breathing_tasks.json', 'utf8'));

assert.equal(questions.length, 100);
assert(questions.every(q => q.type === 'cloze' && q.options.length === 4));
assert.deepEqual([0, 1, 2, 3].map(index => questions.filter(q => q.options[index] === q.blank).length), [25, 25, 25, 25]);
assert.equal(translations.filter(q => q.mode === 'zh_to_en').length, 50);
assert(translations.filter(q => q.mode === 'zh_to_en').every(q => !q.options));
assert(physical.some(q => q.id === 'phys_1'));
assert(physical.every(q => q.id !== 'phys_2'));

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await puppeteer.launch({ executablePath: edgePath, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932 });

async function loadTask(task) {
  await page.goto('http://127.0.0.1:5173/?mode=dashboard', { waitUntil: 'networkidle0' });
  await page.evaluate(question => {
    sessionStorage.setItem('mind_over_smoke_active_session_v2', JSON.stringify({
      mode: 'sos', questions: [question], currentIndex: 0, secondsLeft: 180
    }));
  }, task);
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.fixed.inset-0');
}

async function button(text) {
  const [match] = await page.$$('button').then(async buttons => {
    const items = await Promise.all(buttons.map(async element => ({
      element, label: await page.evaluate(node => node.textContent.trim(), element)
    })));
    return items.filter(item => item.label.includes(text)).map(item => item.element);
  });
  assert(match, `Missing button: ${text}`);
  return match;
}

try {
  const q2 = questions.find(q => q.id === 'q2');
  await loadTask(q2);
  await (await button('surplus')).click();
  await page.waitForSelector('[role="alert"]');
  assert((await page.$eval('[role="alert"]', node => node.textContent)).includes('回答错误'));
  assert.equal(await page.$eval('.fixed.inset-0', node => node.textContent.includes('继续下一项阻断')), false);
  assert.equal(await page.$eval('.fixed.inset-0', node => node.textContent.includes('标准答案')), false);
  await (await button('deficit')).click();
  await page.waitForFunction(() => document.querySelector('.fixed.inset-0')?.textContent.includes('完成本次急救'));
  assert.equal(await page.$('[role="alert"]'), null);

  const q4 = questions.find(q => q.id === 'q4');
  await loadTask(q4);
  await (await button('prudent')).click();
  await page.waitForSelector('[role="alert"]');
  assert.equal(await page.$eval('.fixed.inset-0', node => node.textContent.includes('答案已揭晓')), false);
  await (await button('点击看正确答案')).click();
  await page.waitForFunction(() => document.querySelector('.fixed.inset-0')?.textContent.includes('myopic'));

  await loadTask(questions.find(q => q.id === 'q3'));
  assert.equal(await page.$eval('.fixed.inset-0', node => node.textContent.includes('True or False')), false);

  const trans2 = translations.find(q => q.id === 'trans_2');
  await loadTask(trans2);
  assert(await page.$('textarea#translation-answer'));
  assert.equal(await page.$eval('.fixed.inset-0', (node, answer) => node.textContent.includes(answer), trans2.correct_answer), false);
  await page.type('textarea#translation-answer', 'I will cross the great sea when the wind comes.');
  await (await button('提交并对照参考译文')).click();
  await page.waitForFunction(answer => document.querySelector('.fixed.inset-0')?.textContent.includes(answer), {}, trans2.correct_answer);
  assert((await page.$eval('.fixed.inset-0', node => node.textContent)).includes('你的译文'));

  const trans4 = translations.find(q => q.id === 'trans_4');
  await loadTask(trans4);
  await (await button('点击看参考译文')).click();
  await page.waitForFunction(answer => document.querySelector('.fixed.inset-0')?.textContent.includes(answer), {}, trans4.correct_answer);

  await loadTask({ id: 'phys_2', category: 'physical', type: 'physical', title: '30 秒标准平板支撑' });
  assert.equal(await page.$eval('.fixed.inset-0', node => node.textContent.includes('平板支撑')), false);
  assert(breathing.length > 0);

  console.log('Question bank and mobile UI flow verified.');
} finally {
  await browser.close();
}
