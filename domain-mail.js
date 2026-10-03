const tls = require('tls');

const MAIL_TO = 'find@ikuuu.pro';
const SMTP_HOST = 'smtp.163.com';
const IMAP_HOST = 'imap.163.com';
const POLL_ATTEMPTS = 18;
const POLL_INTERVAL_MS = 5000;

const SKIP_HOSTS = new Set([
  '163.com',
  '126.com',
  'yeah.net',
  'qq.com',
  'foxmail.com',
  'gmail.com',
  'google.com',
  'github.com',
]);

function extractOrigins(text) {
  const origins = [];
  const add = (host, protocol = 'https:') => {
    const bare = host.toLowerCase().replace(/^www\./, '').replace(/\.+$/, '');
    if (!bare || SKIP_HOSTS.has(bare) || bare.endsWith('.163.com')) return;
    origins.push(`${protocol}//${bare}`);
  };

  for (const match of text.matchAll(/https?:\/\/([a-z0-9.-]+)(?::\d+)?/gi)) {
    add(match[1]);
  }
  for (const match of text.matchAll(/(?:^|[^@\w.-])((?:[a-z0-9-]+\.)+[a-z]{2,24})(?![@\w.-])/gi)) {
    add(match[1]);
  }
  return [...new Set(origins)];
}

function decodeModifiedUtf7(name) {
  return name.replace(/&([^-]*)-/g, (_, data) => {
    if (!data) return '&';
    const buf = Buffer.from(data.replace(/,/g, '/'), 'base64');
    let out = '';
    for (let i = 0; i + 1 < buf.length; i += 2) out += String.fromCharCode(buf.readUInt16BE(i));
    return out;
  });
}

function createReader(socket) {
  let buffer = Buffer.alloc(0);
  let resolveWait = null;
  let rejectWait = null;
  const pending = [];

  const fail = (error) => {
    if (!rejectWait) return;
    const reject = rejectWait;
    resolveWait = null;
    rejectWait = null;
    reject(error);
  };

  const take = () => {
    const end = buffer.indexOf('\r\n');
    if (end < 0) return null;
    const line = buffer.slice(0, end).toString('utf8');
    const literal = line.match(/\{(\d+)\}\s*$/);
    if (!literal) {
      buffer = buffer.slice(end + 2);
      return { line, literal: null };
    }
    const size = Number(literal[1]);
    const start = end + 2;
    if (buffer.length < start + size) return null;
    const bytes = buffer.slice(start, start + size);
    buffer = buffer.slice(start + size);
    return { line, literal: bytes.toString('utf8') };
  };

  const pump = () => {
    let item = take();
    while (item) {
      if (resolveWait) {
        const resolve = resolveWait;
        resolveWait = null;
        rejectWait = null;
        resolve(item);
      } else {
        pending.push(item);
      }
      item = take();
    }
  };

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    pump();
  });
  socket.on('error', fail);
  socket.on('close', () => fail(new Error('连接已关闭')));

  return function readItem() {
    if (pending.length) return Promise.resolve(pending.shift());
    return new Promise((resolve, reject) => {
      resolveWait = resolve;
      rejectWait = reject;
      pump();
    });
  };
}

function connectTls(host, port) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host });
    socket.pause();
    const fail = (error) => {
      socket.destroy();
      reject(error);
    };
    socket.setTimeout(25000, () => fail(new Error(`${host} 连接超时`)));
    socket.once('error', fail);
    socket.once('secureConnect', () => {
      socket.removeListener('error', fail);
      const readItem = createReader(socket);
      socket.resume();
      resolve({ socket, readItem });
    });
  });
}

async function readSmtp(readItem) {
  const lines = [];
  while (true) {
    const { line } = await readItem();
    lines.push(line);
    if (/^\d{3} /.test(line)) break;
  }
  const text = lines.join('\n');
  const code = Number(text.slice(0, 3));
  if (code >= 400) throw new Error(text);
  return text;
}

function smtpCommand(socket, readItem, command) {
  socket.write(`${command}\r\n`);
  return readSmtp(readItem);
}

async function sendMail(user, pass) {
  const { socket, readItem } = await connectTls(SMTP_HOST, 465);
  try {
    await readSmtp(readItem);
    await smtpCommand(socket, readItem, 'EHLO ikuun-checkin');
    await smtpCommand(socket, readItem, 'AUTH LOGIN');
    await smtpCommand(socket, readItem, Buffer.from(user).toString('base64'));
    await smtpCommand(socket, readItem, Buffer.from(pass).toString('base64'));
    await smtpCommand(socket, readItem, `MAIL FROM:<${user}>`);
    await smtpCommand(socket, readItem, `RCPT TO:<${MAIL_TO}>`);
    await smtpCommand(socket, readItem, 'DATA');
    const body = [
      `From: <${user}>`,
      `To: <${MAIL_TO}>`,
      'Subject: latest official site',
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${Date.now()}@163.com>`,
      '',
      'Please reply with the latest official site.',
      '.',
    ].join('\r\n');
    socket.write(`${body}\r\n`);
    await readSmtp(readItem);
    socket.write('QUIT\r\n');
  } finally {
    socket.end();
  }
}

async function imapCommand(socket, readItem, tag, command) {
  socket.write(`${tag} ${command}\r\n`);
  const untagged = [];
  while (true) {
    const item = await readItem();
    if (item.line.startsWith(`${tag} `)) {
      if (!item.line.startsWith(`${tag} OK`)) throw new Error(item.line);
      return untagged;
    }
    untagged.push(item);
  }
}

function quoteImap(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function withImap(user, pass, run) {
  const { socket, readItem } = await connectTls(IMAP_HOST, 993);
  try {
    const greeting = await readItem();
    if (!greeting.line.includes('OK')) throw new Error(greeting.line);
    await imapCommand(socket, readItem, 'a1', `LOGIN ${quoteImap(user)} ${quoteImap(pass)}`);
    await imapCommand(socket, readItem, 'a2', 'ID ("name" "ikuun-checkin" "version" "1.0" "vendor" "ikuun-checkin")');
    return await run((tag, command) => imapCommand(socket, readItem, tag, command));
  } finally {
    socket.end();
  }
}

function mailboxNames(listItems) {
  const names = [];
  for (const item of listItems) {
    const quoted = [...item.line.matchAll(/"((?:\\.|[^"])*)"/g)].map((match) => match[1].replace(/\\"/g, '"'));
    if (quoted.length) names.push(quoted[quoted.length - 1]);
  }
  return names;
}

function isReplyMailbox(name) {
  const decoded = decodeModifiedUtf7(name).toLowerCase();
  return decoded === 'inbox' || /junk|spam|垃圾/.test(decoded);
}

async function inboxUidNext(user, pass) {
  return withImap(user, pass, async (command) => {
    const status = await command('a3', 'STATUS INBOX (UIDNEXT)');
    const line = status.map((item) => item.line).join('\n');
    const match = line.match(/UIDNEXT (\d+)/i);
    if (!match) throw new Error(`没有读到 UIDNEXT: ${line}`);
    return Number(match[1]);
  });
}

async function replyTextSince(user, pass, uid) {
  return withImap(user, pass, async (command) => {
    const listed = await command('a3', 'LIST "" "*"');
    const boxes = mailboxNames(listed).filter(isReplyMailbox);
    const selected = boxes.length ? boxes : ['INBOX'];
    let text = '';
    let tag = 4;
    for (const box of selected) {
      try {
        await command(`a${tag++}`, `SELECT ${quoteImap(box)}`);
      } catch (error) {
        console.log('Skip mailbox', decodeModifiedUtf7(box), error.message);
        continue;
      }
      const found = await command(`a${tag++}`, `UID SEARCH UID ${uid}:*`);
      const searchLine = found.map((item) => item.line).join(' ');
      const uids = searchLine.replace(/^\*\s+SEARCH\s*/i, '').trim().split(/\s+/).filter(Boolean);
      for (const messageUid of uids.slice(-5)) {
        const fetched = await command(`a${tag++}`, `UID FETCH ${messageUid} (BODY.PEEK[HEADER.FIELDS (FROM)] BODY.PEEK[TEXT])`);
        const header = fetched.map((item) => `${item.line}\n${item.literal || ''}`).join('\n');
        const from = header.match(/^From:.*$/im);
        if (!from || !/ikuuu\.pro/i.test(from[0])) {
          console.log('Skip mail from:', from ? from[0].slice(0, 120) : '(no From)');
          continue;
        }
        text += `\n${header}`;
      }
    }
    return text;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function originsFromAutoReply() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_AUTH;
  if (!user || !pass) {
    console.log('MAIL_USER 或 MAIL_AUTH 未设置，跳过自动回复邮箱');
    return [];
  }

  console.log(`Asking ${MAIL_TO} from ${user}`);
  const uidNext = await inboxUidNext(user, pass);
  await sendMail(user, pass);
  console.log('Waiting for the auto-reply');

  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS);
    const text = await replyTextSince(user, pass, uidNext);
    const origins = extractOrigins(text);
    if (origins.length) {
      console.log('Auto-reply domains:', origins.join(', '));
      return origins;
    }
    console.log(`No auto-reply yet (${attempt}/${POLL_ATTEMPTS})`);
  }
  throw new Error(`发给 ${MAIL_TO} 之后，90 秒内没有收到带来官网地址的回信`);
}

module.exports = { extractOrigins, decodeModifiedUtf7, originsFromAutoReply };
