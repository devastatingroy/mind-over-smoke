import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\8fc734ca-d8ea-4e72-a03a-06b5f3cfd2fa\\screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

async function findButtonByText(page, text) {
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const t = await page.evaluate(el => el.innerText, b);
    if (t && t.includes(text)) {
      return b;
    }
  }
  return null;
}

async function runSimulation() {
  console.log(`Using browser: ${executablePath}`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Set mobile device viewport for true mobile phone feeling (iPhone 14 Pro size)
  await page.setViewport({
    width: 412,
    height: 892,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('Navigating to http://127.0.0.1:3000/ ...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 1: Home View
  console.log('Taking 01_home_screen.png...');
  await page.screenshot({
    path: path.join(screenshotDir, '01_home_screen.png')
  });

  // Click Panic Button
  console.log('Clicking SOS Panic Button...');
  const panicBtn = await findButtonByText(page, '紧急阻断做题');
  if (panicBtn) {
    await panicBtn.click();
  }
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 2: Question View
  console.log('Taking 02_quiz_question_view.png...');
  await page.screenshot({
    path: path.join(screenshotDir, '02_quiz_question_view.png')
  });

  // Answer Q1: Click first option
  console.log('Answering Question 1...');
  const optionButtons = await page.$$('div.grid button');
  if (optionButtons.length > 0) {
    await optionButtons[0].click();
  }
  await new Promise(r => setTimeout(r, 1200));

  // Click "存入武器库" to save vocab if present
  const saveVocabBtn = await findButtonByText(page, '存入武器库');
  if (saveVocabBtn) {
    console.log('Clicking 存入武器库...');
    await saveVocabBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Screenshot 3: Punchline & Vocab
  console.log('Taking 03_punchline_and_vocab.png...');
  await page.screenshot({
    path: path.join(screenshotDir, '03_punchline_and_vocab.png')
  });

  // Helper to click next
  async function advanceQuestion() {
    const nextBtn = await findButtonByText(page, '继续下一题') || await findButtonByText(page, '完成本次认知阻断');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Answer Q2
  console.log('Answering Question 2...');
  await advanceQuestion();
  const q2Options = await page.$$('div.grid button');
  if (q2Options.length > 0) {
    await q2Options[0].click();
    await new Promise(r => setTimeout(r, 800));
  }

  // Answer Q3
  console.log('Answering Question 3...');
  await advanceQuestion();
  const q3Options = await page.$$('div.grid button');
  if (q3Options.length > 0) {
    await q3Options[0].click();
    await new Promise(r => setTimeout(r, 800));
  }

  // Click "完成本次认知阻断"
  console.log('Finishing session...');
  await advanceQuestion();
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 4: Finished & +$1 reward
  console.log('Taking 04_session_finished_reward.png...');
  await page.screenshot({
    path: path.join(screenshotDir, '04_session_finished_reward.png')
  });

  // Click "返回仪表盘"
  console.log('Clicking 返回仪表盘...');
  const returnBtn = await findButtonByText(page, '返回仪表盘');
  if (returnBtn) {
    await returnBtn.click();
  }
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 5: Updated Dashboard
  console.log('Taking 05_updated_dashboard.png...');
  await page.evaluate(() => window.scrollTo(0, 180));
  await page.screenshot({
    path: path.join(screenshotDir, '05_updated_dashboard.png')
  });

  // Screenshot 6: Health timeline & biological tracker
  console.log('Taking 06_health_tracker.png...');
  await page.evaluate(() => window.scrollTo(0, 520));
  await page.screenshot({
    path: path.join(screenshotDir, '06_health_tracker.png')
  });

  // Open Vocab Modal
  console.log('Opening Vocab Modal...');
  const vocabIconBtn = await page.$('button[title="词汇与讽刺金句本"]');
  if (vocabIconBtn) {
    await vocabIconBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('Taking 07_vocab_modal.png...');
    await page.screenshot({
      path: path.join(screenshotDir, '07_vocab_modal.png')
    });
  }

  console.log('Simulation complete! All screenshots saved successfully.');
  await browser.close();
}

runSimulation().catch(err => {
  console.error('Error during simulation:', err);
  process.exit(1);
});
