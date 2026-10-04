# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- 站点域名从 `https://ikuuu.fyi` 更换为 `https://ikuuu.pw`
- 签到前自动确认登录页；旧域名变成最新域名公告时，改用公告里的新 `ikuuu.*` 地址
- 候选域名都失败时，用 `ikuuu26login@163.com` 向 `find@ikuuu.pro` 索取最新官网
- 发信邮箱改为读取 Secret `MAIL_USER`
- 163 邮箱先打开收件箱再取新邮件编号，并且只从邮件正文提取官网地址
- 登录方式从 `curl` 改为 Playwright 无头浏览器，适配 GeeTest V4 验证码
- Node.js 版本从 20 升级到 22

### Added

- `login.js` — Playwright 登录脚本，使用 stealth 插件 + headed 模式(xvfb) + 真实鼠标事件绕过 GeeTest V4 验证
- `playwright-extra`、`puppeteer-extra-plugin-stealth` 依赖

### Fixed

- 修复 ikuuu 登录接口新增 GeeTest V4 验证码后，`curl` 登录返回"系统无法接受您的验证结果"的问题
