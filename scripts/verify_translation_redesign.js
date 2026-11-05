import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\11300\\.gemini\\antigravity\\brain\\ad3ab0a1-f2ef-4182-bbd6-c308a5127682\\screenshots';

async function verify() {
  console.log('Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Navigating to https://royfree.men/?t=' + Date.now());
  const res = await page.goto(`https://royfree.men/?t=${Date.now()}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  console.log('HTTP Status:', res.status());

  // Wait for either modal or home screen
  await page.waitForSelector('button', { timeout: 10000 });

  // If modal is not open, click SOS button
  const hasModal = await page.$('.fixed.inset-0');
  if (!hasModal) {
    console.log('Clicking 3分钟急救阻断 button...');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('3分钟急救') || text.includes('急救阻断')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  // Find translation task by swapping if needed
  let foundTranslation = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('TRANSLATION') || text.includes('逆向还原') || text.includes('挑选英译')) {
      foundTranslation = true;
      console.log(`Found translation challenge at attempt ${attempt}!`);
      break;
    }
    // Swap task
    const swapBtn = await page.$('button[title*="更换"]');
    if (swapBtn) {
      await swapBtn.click();
      await new Promise(r => setTimeout(r, 800));
    } else {
      break;
    }
  }

  // Save screenshot of the new translation challenge UI
  const pathInitial = path.join(screenshotDir, 'translation_redesign_initial.png');
  await page.screenshot({ path: pathInitial, fullPage: false });
  console.log('Saved translation challenge screenshot:', pathInitial);

  // Check if there is an English word to click
  const interactiveWords = await page.$$('.select-text span, blockquote span');
  if (interactiveWords.length > 0) {
    console.log('Clicking word to test inspector...');
    await interactiveWords[0].click();
    await new Promise(r => setTimeout(r, 600));
    const pathInspector = path.join(screenshotDir, 'translation_word_inspector.png');
    await page.screenshot({ path: pathInspector, fullPage: false });
    console.log('Saved word inspector screenshot:', pathInspector);
  }

  // Click [看答案与双语解析]
  console.log('Clicking [看答案] reveal button...');
  const clickedReveal = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const btn = allBtns.find(b => b.textContent.includes('看答案') || b.textContent.includes('双语解析') || b.textContent.includes('汉学解析'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (clickedReveal) {
    console.log('Clicked reveal button successfully! Waiting for animation...');
    await new Promise(r => setTimeout(r, 1200));
    const pathRevealed = path.join(screenshotDir, 'translation_redesign_revealed.png');
    await page.screenshot({ path: pathRevealed, fullPage: false });
    console.log('Saved revealed screenshot:', pathRevealed);
  } else {
    console.log('Reveal button not found, clicking first option...');
    const optBtn = await page.$('.grid button, .space-y-2 button');
    if (optBtn) {
      await optBtn.click();
      await new Promise(r => setTimeout(r, 1200));
      const pathAnswered = path.join(screenshotDir, 'translation_redesign_answered.png');
      await page.screenshot({ path: pathAnswered, fullPage: false });
      console.log('Saved answered screenshot:', pathAnswered);
    }
  }

  await browser.close();
  console.log('✅ Translation redesign test completed successfully!');
}

verify().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
