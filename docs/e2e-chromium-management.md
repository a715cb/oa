# E2E 测试 Chromium 浏览器管理机制

## 概述

本项目实现了 **先检测后安装** 的 Chromium 浏览器管理机制，避免每次运行测试时重复安装已存在的浏览器。

## 实现原理

### 检测流程

1. 检查 `%LOCALAPPDATA%\ms-playwright` 目录是否存在
2. 查找 `chromium-*` 模式的子目录
3. 如果找到，跳过安装
4. 如果未找到，执行 `npx playwright install chromium`

### 文件说明

| 文件 | 用途 | 调用方式 |
|------|------|----------|
| `scripts/check-playwright.bat` | 独立检测/安装脚本 | `npm run test:e2e:install-browser` |
| `scripts/run-tests.ps1` | 测试运行脚本（内置检测） | `npm run test:e2e:*` |

## 使用方式

### 本地开发

```bash
# 运行测试（自动检测浏览器）
npm run test:e2e

# 单独检查/安装浏览器
npm run test:e2e:install-browser

# 跳过浏览器检测（用于已安装环境）
powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1 --SkipBrowserCheck
```

### CI/CD 环境

```bash
# CI 模式（跳过浏览器检查，由工作流管理）
npm run test:e2e:ci
```

## 不同环境的行为

| 环境 | 浏览器检测 | 安装行为 |
|------|-----------|----------|
| 本地开发（首次） | 未找到 | 自动安装 |
| 本地开发（已安装） | 找到 | 跳过安装 |
| CI/CD | 跳过检测 | 由工作流步骤安装 |

## 注意事项

1. **Windows 环境**：使用 `.bat` 文件以避免 PowerShell 编码问题
2. **Linux/macOS CI**：GitHub Actions 工作流中单独处理浏览器安装
3. **版本匹配**：当前机制只检查是否存在 chromium-* 目录，不验证具体版本号
4. **缓存清理**：如需重新安装，可删除 `%LOCALAPPDATA%\ms-playwright` 目录

## 故障排查

### Chromium 检测失败

1. 检查缓存目录：`%LOCALAPPDATA%\ms-playwright`
2. 确认存在 `chromium-*` 目录
3. 运行 `npm run test:e2e:install-browser` 手动安装

### PowerShell 脚本错误

如果 `run-tests.ps1` 出现解析错误，请使用 `.bat` 文件：
```bash
scripts\check-playwright.bat
```

## 相关配置

### package.json 脚本

```json
{
  "scripts": {
    "test:e2e": "powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1",
    "test:e2e:ci": "powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1 --Headless --Project chromium --SkipBrowserCheck",
    "test:e2e:install-browser": "scripts\\check-playwright.bat"
  }
}
```

### GitHub Actions 缓存

```yaml
- name: Check Playwright browser cache
  id: playwright-cache
  run: |
    if [ -d "$HOME/.cache/ms-playwright/chromium-*" ]; then
      echo "cache-hit=true" >> $GITHUB_OUTPUT
    else
      echo "cache-hit=false" >> $GITHUB_OUTPUT
    fi

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps chromium
```
