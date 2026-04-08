# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- 登录方式从 `curl` 改为 Playwright 无头浏览器，适配 GeeTest V4 验证码
- Node.js 版本从 20 升级到 22

### Added

- `login.js` — Playwright 登录脚本，使用 stealth 插件 + headed 模式(xvfb) + 真实鼠标事件绕过 GeeTest V4 验证
- `playwright-extra`、`puppeteer-extra-plugin-stealth` 依赖

### Fixed

- 修复 ikuuu 登录接口新增 GeeTest V4 验证码后，`curl` 登录返回"系统无法接受您的验证结果"的问题
