import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000/?mode=sos', { waitUntil: 'networkidle0' });
  const swapBtn = await page.$('button[title="更换当前任务"]');
  if (swapBtn) await swapBtn.click();
  await new Promise(r => setTimeout(r, 800));
  
  const spans = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('span[title*="音标"]')).map(s => s.innerText);
  });
  console.log('Words found on screen:', spans);
  await browser.close();
}

run();
