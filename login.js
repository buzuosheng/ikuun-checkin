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

  // Debug: screenshot and log page content
  await page.screenshot({ path: 'debug-page.png', fullPage: true });
  console.log('Page title:', await page.title());
  console.log('Page URL:', page.url());

  // Wait for login form to be ready
  await page.waitForSelector('#email, input[name="email"]', { timeout: 30000 });
  console.log('Login form found');

  console.log('Filling credentials...');
  await page.fill('#email', email);
  await page.fill('#passwd', password);

  // Wait for GeeTest captcha to initialize
  await page.waitForTimeout(3000);

  console.log('Clicking login button...');
  const [response] = await Promise.all([
    page.waitForResponse(
      r => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 30000 }
    ),
    page.click('#login'),
  ]);

  const result = await response.json();
  console.log('Login response:', JSON.stringify(result));

  if (result.ret !== 1) {
    console.error('Login failed:', result.msg);
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
