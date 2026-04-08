const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;
  const domain = process.env.DOMAIN || 'https://ikuuu.fyi';

  if (!email || !password) {
    console.error('EMAIL and PASSWORD environment variables are required');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to login page...');
  await page.goto(`${domain}/auth/login`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({ path: 'debug-page.png', fullPage: true });
  console.log('Page title:', await page.title());

  // Fill credentials
  console.log('Filling credentials...');
  await page.fill('#email', email);
  await page.fill('#password', password);

  // Wait for GeeTest captcha to be ready
  console.log('Waiting for GeeTest captcha to load...');
  await page.waitForFunction(() => window.Captcha && window.Captcha.isLoaded(), { timeout: 30000 });
  console.log('GeeTest captcha loaded');

  // Click the GeeTest verify button
  console.log('Clicking GeeTest verify button...');
  await page.click('.geetest_btn_click');

  // Wait for captcha verification to complete
  console.log('Waiting for captcha verification...');
  await page.waitForFunction(() => window.Captcha && window.Captcha.isReady(), { timeout: 60000 });
  console.log('Captcha verification passed');

  await page.screenshot({ path: 'debug-after-captcha.png', fullPage: true });

  // Click login button and wait for response
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
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
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
