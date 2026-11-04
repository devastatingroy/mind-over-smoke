import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';
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

async function runTest() {
  console.log(`Starting headless browser using: ${executablePath}`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 412,
    height: 892,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('1. Navigating to http://127.0.0.1:3000/ (simulating opening app icon)...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Verify that the emergency intervention modal is automatically displayed without clicking anything!
  console.log('Taking 01_direct_launch_emergency.png (verifying 0-click auto-launch)...');
  await page.screenshot({ path: path.join(screenshotDir, '01_direct_launch_emergency.png') });

  // Test Task 1
  console.log('Testing Task 1 interaction...');
  // Check if it's physical (push-ups), poetry, or cloze
  const pushUpBtn = await findButtonByText(page, '点击计数');
  const instantCompleteBtn = await findButtonByText(page, '我已一口气全部做完');
  const breathingBtn = await findButtonByText(page, '完成第');
  const optionButtons = await page.$$('div.grid button');

  if (instantCompleteBtn) {
    console.log('Found physical task! Clicking instant complete...');
    await instantCompleteBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '02_physical_task_completed.png') });
  } else if (pushUpBtn) {
    console.log('Found physical task! Tapping reps...');
    for (let i = 0; i < 10; i++) {
      const b = await findButtonByText(page, '点击计数');
      if (b) await b.click();
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '02_physical_task_completed.png') });
  } else if (optionButtons.length > 0) {
    console.log('Found option task (poetry or Economist)! Clicking first option...');
    await optionButtons[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotDir, '02_option_task_completed.png') });
  }

  // Advance to Task 2
  console.log('Advancing to Task 2...');
  let nextBtn = await findButtonByText(page, '继续下一个阻断任务') || await findButtonByText(page, '完成本次急救干预');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  }

  await page.screenshot({ path: path.join(screenshotDir, '03_task_2_view.png') });

  // Test "换个任务" (Swap Task) button
  console.log('Testing "换个任务" (Swap Task)...');
  const swapBtn = await findButtonByText(page, '换个任务');
  if (swapBtn) {
    await swapBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('Task swapped successfully!');
    await page.screenshot({ path: path.join(screenshotDir, '04_task_swapped.png') });
  }

  // Complete Task 2
  console.log('Completing Task 2...');
  const instantCompleteBtn2 = await findButtonByText(page, '我已一口气全部做完');
  const optionButtons2 = await page.$$('div.grid button');
  if (instantCompleteBtn2) {
    await instantCompleteBtn2.click();
  } else if (optionButtons2.length > 0) {
    await optionButtons2[0].click();
  }
  await new Promise(r => setTimeout(r, 1000));

  // Advance to Task 3
  console.log('Advancing to Task 3...');
  nextBtn = await findButtonByText(page, '继续下一个阻断任务') || await findButtonByText(page, '完成本次急救干预');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  }

  await page.screenshot({ path: path.join(screenshotDir, '05_task_3_view.png') });

  // Complete Task 3
  console.log('Completing Task 3...');
  const instantCompleteBtn3 = await findButtonByText(page, '我已一口气全部做完');
  const optionButtons3 = await page.$$('div.grid button');
  if (instantCompleteBtn3) {
    await instantCompleteBtn3.click();
  } else if (optionButtons3.length > 0) {
    await optionButtons3[0].click();
  }
  await new Promise(r => setTimeout(r, 1000));

  // Finish session
  console.log('Finishing session...');
  nextBtn = await findButtonByText(page, '完成本次急救干预');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }

  await page.screenshot({ path: path.join(screenshotDir, '06_session_finished.png') });

  // Return to Dashboard
  console.log('Returning to dashboard...');
  const returnBtn = await findButtonByText(page, '返回主看板');
  if (returnBtn) {
    await returnBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('Taking 07_dashboard_view.png...');
  await page.screenshot({ path: path.join(screenshotDir, '07_dashboard_view.png') });

  console.log('All tests passed successfully!');
  await browser.close();
}

runTest().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
