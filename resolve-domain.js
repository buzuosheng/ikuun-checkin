const fs = require('fs');
const { originsFromAutoReply } = require('./domain-mail');

const CAPTCHA_ID = 'cc96d05ba8b60f9112f76e18526fcb73';
const MAX_PROBES = 12;
const HEADER = `# 按从上到下的顺序尝试。
# 当前地址如果变成「最新域名」公告，会读取公告里的 ikuuu.* 地址再试。
# 这些都失败时，用 163 邮箱向 find@ikuuu.pro 发信，读取自动回复里的官网。
# 公告和回信里都没有的新地址，把一行 https 地址加在最上面。
`;

function readOrigins() {
  const origins = [];
  if (process.env.DOMAIN) origins.push(normalizeOrigin(process.env.DOMAIN));
  if (fs.existsSync('domains.txt')) {
    for (const line of fs.readFileSync('domains.txt', 'utf8').split('\n')) {
      const text = line.trim();
      if (!text || text.startsWith('#')) continue;
      origins.push(normalizeOrigin(text));
    }
  }
  return [...new Set(origins)];
}

function normalizeOrigin(value) {
  const url = new URL(value.includes('://') ? value : `https://${value}`);
  if (url.protocol !== 'https:') {
    throw new Error(`只接受 https 地址: ${value}`);
  }
  return url.origin;
}

function bareHost(host) {
  return host.toLowerCase().replace(/^www\./, '');
}

function isIkuuuHost(host) {
  return /^ikuuu\.[a-z0-9-]{2,24}$/.test(bareHost(host));
}

function writeIfChanged(path, content) {
  const previous = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : null;
  if (previous === content) return;
  fs.writeFileSync(path, content);
}

function remember(origin) {
  const origins = [origin, ...readOrigins().filter((item) => item !== origin)];
  writeIfChanged('domains.txt', `${HEADER}${origins.join('\n')}\n`);
  writeIfChanged('domain.txt', `${origin}\n`);

  const workflow = '.github/workflows/main.yml';
  if (!fs.existsSync(workflow)) return;
  const source = fs.readFileSync(workflow, 'utf8');
  const updated = source.replace(/DOMAIN:\s*https:\/\/\S+/, `DOMAIN: ${origin}`);
  writeIfChanged(workflow, updated);
}

async function inspect(page) {
  return page.evaluate((captchaId) => {
    const raw = document.documentElement ? document.documentElement.innerHTML : '';
    let decoded = '';
    const match = raw.match(/var originBody = "([A-Za-z0-9+/=]+)"/);
    if (match) {
      try {
        decoded = atob(match[1]);
      } catch (e) {}
    }
    const html = decoded || raw;
    const liveLogin = !!(document.querySelector('#email') && document.querySelector('#password'));
    const markedLogin = html.includes('id="email"')
      && html.includes('id="password"')
      && html.includes(captchaId);
    const links = [...document.querySelectorAll('a')].map((anchor) => anchor.href).filter(Boolean);
    return {
      login: liveLogin || markedLogin,
      notice: document.title.includes('最新域名') || !!document.querySelector('#domain-list'),
      links,
      title: document.title,
      url: location.href,
    };
  }, CAPTCHA_ID);
}

async function resolveDomain(page) {
  const queue = readOrigins();
  const trusted = new Set(queue.map((origin) => bareHost(new URL(origin).host)));
  const mailHosts = new Set();
  const seen = new Set();
  let askedMail = false;

  if (queue.length === 0) {
    throw new Error('domains.txt 里没有地址，也没有 DOMAIN');
  }

  while (seen.size < MAX_PROBES) {
    if (queue.length === 0) {
      if (askedMail) break;
      askedMail = true;
      try {
        for (const origin of await originsFromAutoReply()) {
          const host = bareHost(new URL(origin).host);
          trusted.add(host);
          mailHosts.add(host);
          queue.push(origin);
        }
      } catch (error) {
        console.log('Mail lookup failed:', error.message);
      }
      continue;
    }
    const origin = queue.shift();
    if (seen.has(origin)) continue;
    seen.add(origin);

    let host;
    try {
      host = new URL(origin).host;
    } catch (e) {
      console.log('Skip invalid origin:', origin);
      continue;
    }
    if (!trusted.has(bareHost(host)) && !isIkuuuHost(host)) {
      console.log('Skip untrusted host:', host);
      continue;
    }

    console.log('Probing', `${origin}/auth/login`);
    try {
      await page.goto(`${origin}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('#email, #domain-list a', { timeout: 12000 }).catch(() => {});
    } catch (e) {
      console.log('Probe failed:', origin, e.message.split('\n')[0]);
      continue;
    }

    const info = await inspect(page);
    let finalUrl;
    try {
      finalUrl = new URL(page.url());
    } catch (e) {
      continue;
    }
    const fromMail = mailHosts.has(bareHost(host));
    const finalAllowed = trusted.has(bareHost(finalUrl.host)) || isIkuuuHost(finalUrl.host);
    console.log(`Probe result title="${info.title}" url=${info.url} login=${info.login} notice=${info.notice}`);
    if (!finalAllowed && !(fromMail && info.login)) {
      console.log('Reject redirect to', finalUrl.host);
      continue;
    }

    if (info.login) {
      const resolved = finalUrl.origin;
      console.log('Resolved domain:', resolved);
      remember(resolved);
      return resolved;
    }

    if (info.notice) {
      const found = [];
      for (const link of info.links) {
        try {
          const url = new URL(link);
          if (!isIkuuuHost(url.host)) continue;
          const next = url.origin;
          if (!seen.has(next)) found.push(next);
        } catch (e) {}
      }
      if (found.length === 0) {
        console.log('Notice page listed no ikuuu domain');
      } else {
        console.log('Notice page domains:', found.join(', '));
        queue.unshift(...found);
      }
    }
  }

  throw new Error('没有找到可用的登录页。自动回复也没有给出可用地址时，把新的 https 地址加到 domains.txt 最上面后再运行。');
}

module.exports = { resolveDomain };

if (require.main === module) {
  const { chromium } = require('playwright-extra');
  const stealth = require('puppeteer-extra-plugin-stealth');
  chromium.use(stealth());
  (async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
      const origin = await resolveDomain(page);
      console.log(origin);
    } finally {
      await browser.close();
    }
  })().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
