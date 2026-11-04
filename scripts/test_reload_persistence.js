import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('1. Loading application at http://127.0.0.1:3000/?mode=sos ...');
  await page.goto('http://127.0.0.1:3000/?mode=sos', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.fixed.inset-0', { timeout: 8000 });

  // Get current question title / text before reload
  const initialData = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    return {
      title: modal.querySelector('blockquote, h3, .font-serif.text-stone-800, .font-serif.text-stone-700')?.innerText || '',
      category: modal.querySelector('.font-sans.text-stone-900.font-medium')?.innerText || '',
      progress: modal.querySelector('.font-mono.text-stone-500')?.innerText || ''
    };
  });
  console.log('Initial question state:', initialData);

  // Wait 3 seconds to let timer decrease slightly
  console.log('Waiting 3s ...');
  await new Promise(r => setTimeout(r, 3000));

  // Perform a full browser page reload
  console.log('2. Performing full browser page reload (simulating network blip or refresh) ...');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.fixed.inset-0', { timeout: 8000 });

  const afterReloadData = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    return {
      title: modal.querySelector('blockquote, h3, .font-serif.text-stone-800, .font-serif.text-stone-700')?.innerText || '',
      category: modal.querySelector('.font-sans.text-stone-900.font-medium')?.innerText || '',
      progress: modal.querySelector('.font-mono.text-stone-500')?.innerText || ''
    };
  });
  console.log('After reload question state:', afterReloadData);

  // Verify that the task title and progress match
  if (initialData.title === afterReloadData.title && initialData.progress === afterReloadData.progress) {
    console.log('✅ SUCCESS: Exactly the same task was restored after reload! No jumping to next question!');
  } else {
    console.error('❌ MISMATCH: Task changed after reload!');
    console.error('Before:', initialData);
    console.error('After:', afterReloadData);
    process.exit(1);
  }

  // 3. Complete task 1 and advance to task 2
  console.log('3. Completing task 1 to advance to task 2 ...');
  await page.evaluate(() => {
    // If physical task, click instant complete
    const directDone = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('直接打卡') || b.innerText.includes('全部做完'));
    if (directDone) {
      directDone.click();
      return;
    }
    // If choice task, click first option
    const option = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('选择') || b.classList.contains('font-serif'));
    if (option) {
      option.click();
    }
  });

  await new Promise(r => setTimeout(r, 800));

  // Click '继续下一项阻断'
  await page.evaluate(() => {
    const next = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('继续下一项阻断'));
    if (next) next.click();
  });

  await new Promise(r => setTimeout(r, 800));

  const task2Data = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    return {
      title: modal.querySelector('blockquote, h3, .font-serif.text-stone-800, .font-serif.text-stone-700')?.innerText || '',
      category: modal.querySelector('.font-sans.text-stone-900.font-medium')?.innerText || '',
      progress: modal.querySelector('.font-mono.text-stone-500')?.innerText || ''
    };
  });
  console.log('Task 2 state:', task2Data);

  // Reload again while on Task 2
  console.log('4. Performing full reload on Task 2 ...');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.fixed.inset-0', { timeout: 8000 });

  const task2AfterReload = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    return {
      title: modal.querySelector('blockquote, h3, .font-serif.text-stone-800, .font-serif.text-stone-700')?.innerText || '',
      category: modal.querySelector('.font-sans.text-stone-900.font-medium')?.innerText || '',
      progress: modal.querySelector('.font-mono.text-stone-500')?.innerText || ''
    };
  });
  console.log('Task 2 after reload:', task2AfterReload);

  if (task2Data.title === task2AfterReload.title && task2Data.progress === task2AfterReload.progress) {
    console.log('✅ SUCCESS: Task 2 state completely preserved across page reload!');
  } else {
    console.error('❌ MISMATCH on Task 2 reload!');
    process.exit(1);
  }

  await browser.close();
  console.log('All tests passed with 100% reload survival!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
