# AGENTS.md

## 项目概述

ikuun-checkin 是一个运行在 GitHub Actions 上的自动签到工具，用于每日自动登录 ikuuu VPN 并完成签到，签到结果通过 Server酱 推送通知。

## 架构

整个流程分为两步：

1. **Playwright 登录**（`login.js`）— 使用无头浏览器模拟真实用户登录，通过 GeeTest V4 验证码，登录成功后导出 cookies 为 `cookie.txt`
2. **curl 签到**（`main.yml`）— 使用导出的 cookies 调用签到接口，记录日志并推送通知

## 文件职责

| 文件 | 用途 |
|------|------|
| `login.js` | Playwright 登录脚本，处理 GeeTest V4 验证码，导出 cookies |
| `.github/workflows/main.yml` | GitHub Actions 工作流，定时触发登录和签到 |
| `run.log` | 签到结果日志，自动提交到仓库 |
| `request.md` | 登录请求抓包记录，用于调试和参考 |
| `CHANGELOG.md` | 变更记录 |

## 关键技术约束

### GeeTest V4 验证码

ikuuu 登录接口使用 GeeTest V4 行为验证码（captchaId: `cc96d05ba8b60f9112f76e18526fcb73`），纯 curl 无法通过验证。必须使用浏览器环境让 GeeTest JS SDK 完成验证。

### 反检测策略

当前采用三重策略绕过 GeeTest 的自动化检测：

- **`playwright-extra` + `puppeteer-extra-plugin-stealth`** — 隐藏浏览器自动化指纹
- **`headless: false` + `xvfb-run`** — 使用 headed 模式运行，xvfb 提供虚拟显示
- **`--disable-blink-features=AutomationControlled`** — 移除 Chrome 自动化标志

### 鼠标事件模拟

GeeTest 验证按钮会忽略 JS 合成事件（`dispatchEvent`），必须使用 Playwright 的 `page.mouse.move()` + `page.mouse.click()` 发送 CDP 级别的真实鼠标事件。

## 登录页表单选择器

| 元素 | 选择器 |
|------|--------|
| 邮箱输入框 | `#email` |
| 密码输入框 | `#password`（注意：id 是 `password`，但提交到服务端的字段名是 `passwd`） |
| GeeTest 验证按钮 | `.geetest_btn_click` |
| 登录按钮 | `button.login` |
| 验证码状态检查 | `window.Captcha.isReady()` / `window.Captcha.isLoaded()` |

## Secrets 配置

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置：

| Secret | 说明 |
|--------|------|
| `EMAIL` | ikuuu 账号邮箱 |
| `PASSWORD` | ikuuu 账号密码 |
| `TOKEN` | GitHub Personal Access Token，用于推送日志 |
| `SENDKEY` | Server酱 SendKey，用于签到结果推送通知 |

## 定时任务

Cron 表达式 `0 16 * * *`（UTC），即北京时间每天 **00:00** 自动运行。

## 开发注意事项

- **域名变更**：ikuuu 域名可能变化，当前为 `https://ikuuu.fyi`，在 `main.yml` 的 `DOMAIN` 环境变量中配置
- **选择器变更**：如果登录页改版，需重新抓取表单元素的选择器并更新 `login.js`
- **验证码策略变更**：如果 GeeTest 升级或更换验证码服务商，需要相应调整验证流程
- **登录成功判断**：当前通过页面跳转到 `/user` 判断登录成功，如果网站改变跳转逻辑需同步更新
- **敏感数据**：不要在代码或文档中硬编码账号密码，所有凭证通过 GitHub Secrets 管理
- **`cookie.txt` 已在 `.gitignore` 中**：cookies 文件不会被提交到仓库
