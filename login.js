const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

chromium.use(stealth());

(async () => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  const domain = process.env.DOMAIN || 'https://ikuuu.fyi';

  if (!email || !password) {
    console.error('EMAIL and PASSWORD environment variables are required');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();

  console.log('Navigating to login page...');
  await page.goto(`${domain}/auth/login`, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('Page title:', await page.title());

  // Fill credentials
  console.log('Filling credentials...');
  await page.fill('#email', email);
  await page.fill('#password', password);

  // Wait for GeeTest captcha to be fully ready
  console.log('Waiting for GeeTest captcha to load...');
  await page.waitForFunction(() => window.Captcha && window.Captcha.isLoaded(), { timeout: 30000 });

  // Wait for GeeTest onReady callback (captcha UI rendered)
  await page.waitForFunction(
    () => document.querySelector('.geetest_btn_click') !== null,
    { timeout: 30000 }
  );
  console.log('GeeTest captcha loaded and ready');

  // Click GeeTest verify button using real mouse events
  console.log('Clicking GeeTest verify button...');
  const btn = page.locator('.geetest_btn_click');
  const box = await btn.boundingBox();
  if (!box) {
    console.error('GeeTest button not found');
    await page.screenshot({ path: 'debug-no-btn.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
  // Move mouse naturally then click
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
  await page.waitForTimeout(200);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 100 });

  // Wait for captcha verification to complete
  console.log('Waiting for captcha verification...');
  // Check every second, take screenshot at 10s for debugging
  let passed = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => ({
      isReady: window.Captcha?.isReady(),
      error: window.Captcha?.getError(),
      tipText: document.querySelector('.geetest_tip')?.textContent,
    }));

    if (i === 5) {
      await page.screenshot({ path: 'debug-after-click.png', fullPage: true });
      console.log('Captcha state at 5s:', JSON.stringify(state));
    }

    if (state.isReady) {
      passed = true;
      console.log('Captcha verification passed!');
      break;
    }

    if (state.error) {
      console.error('Captcha error:', state.error);
      break;
    }
  }

  if (!passed) {
    await page.screenshot({ path: 'debug-captcha-fail.png', fullPage: true });
    console.error('Captcha verification did not pass');
    await browser.close();
    process.exit(1);
  }

  // Call the page's login() function directly via clicking login button
  console.log('Clicking login button...');
  const [response] = await Promise.all([
    page.waitForResponse(
      r => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 30000 }
    ),
    page.click('button.login'),
  ]);

  const result = await response.json();
  console.log('Login response:', JSON.stringify(result));

  if (result.ret !== 1) {
    console.error('Login failed:', result.msg);
    await page.screenshot({ path: 'debug-login-fail.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }

  console.log('Login successful:', result.msg);

  // Save cookies in Netscape format for curl
  const cookies = await page.context().cookies();
  let cookieFile = '# Netscape HTTP Cookie File\n';
  for (const c of cookies) {
    const d = c.domain.startsWith('.') ? c.domain : '.' + c.domain;
    const expires = c.expires > 0 ? Math.floor(c.expires) : 0;
    cookieFile += `${d}\tTRUE\t${c.path}\t${c.secure ? 'TRUE' : 'FALSE'}\t${expires}\t${c.name}\t${c.value}\n`;
  }
  fs.writeFileSync('cookie.txt', cookieFile);
  console.log('Cookies saved to cookie.txt');

  await browser.close();
})();
