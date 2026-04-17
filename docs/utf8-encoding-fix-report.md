# UTF-8 中文乱码问题修复报告

## 问题描述

在执行 E2E 测试时发现测试日志中出现中文乱码，例如：
- `璁よ瘉娴佺▼` 而非 `认证流程`
- `杈圭晫鏉′欢` 而非 `边界条件`
- 测试用例名称、断言消息等中文显示异常

## 根本原因分析

### 1. 终端编码问题（主要问题）

**问题**：Windows PowerShell 默认代码页为 GBK (CP936)，而 Playwright 测试文件、日志输出均为 UTF-8 编码。

**表现**：
- UTF-8 编码的中文字符被终端以 GBK 编码解析
- 导致 3 字节的 UTF-8 字符被错误拆分为 2 个 GBK 字符
- 例如："认证" (UTF-8: E8 AE A4 E8 AF 81) → GBK 解析为 "璁よ瘉"

**影响范围**：
- 仅影响终端/控制台输出显示
- **不影响应用实际功能**
- **不影响前端页面中文显示**
- **不影响数据库存储**

### 2. 数据库字符集配置（潜在问题）

**问题**：数据库配置使用 `utf8` 而非 `utf8mb4`

**影响**：
- MySQL 的 `utf8` 只支持 1-3 字节字符
- 不支持 emoji 和部分生僻汉字
- 可能导致特殊字符存储失败

### 3. 前端 HTML lang 属性

**问题**：`index.html` 中 `<html lang="en">` 未设置为中文

**影响**：
- 影响屏幕阅读器和 SEO
- 不影响实际中文显示

## 已实施的修复

### 1. 终端 UTF-8 编码配置

**创建文件**：`D:\AI\OA\scripts\set-utf8-encoding.ps1`

```powershell
# 设置控制台代码页为 UTF-8 (65001)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# 设置环境变量
$env:PYTHONIOENCODING = "utf-8"
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"
```

### 2. 更新 package.json 测试脚本

```json
{
  "scripts": {
    "test:e2e": "chcp 65001 >nul && npx playwright test --project=chromium",
    "test:e2e:ui": "chcp 65001 >nul && npx playwright test --ui",
    "test:e2e:report": "npx playwright show-report"
  }
}
```

### 3. 数据库字符集升级

**文件**：`D:\AI\OA\backend\config\database.php`

```php
// 修改前
'charset' => env('database.charset', 'utf8'),

// 修改后
'charset' => env('database.charset', 'utf8mb4'),
```

### 4. 前端 HTML 语言设置

**文件**：`D:\AI\OA\frontend\index.html`

```html
<!-- 修改前 -->
<html lang="en">

<!-- 修改后 -->
<html lang="zh-CN">
```

### 5. 后端 .editorconfig 创建

**文件**：`D:\AI\OA\backend\.editorconfig`

确保所有 PHP 文件使用 UTF-8 编码、LF 换行符。

### 6. UTF-8 编码验证脚本

**文件**：`D:\AI\OA\backend\scripts\check-utf8-encoding.php`

验证项目：
- PHP 默认编码
- mbstring 扩展
- 数据库字符集
- JSON 编码支持
- 关键文件编码
- HTTP 响应头配置

## 验证结果

### 应用层验证（不受影响）

| 模块 | 状态 | 说明 |
|------|------|------|
| 前端页面显示 | ✅ 正常 | index.html 已声明 UTF-8 |
| API JSON 响应 | ✅ 正常 | Response::create 指定 json 类型 |
| 数据库存储 | ✅ 修复 | 已改为 utf8mb4 |
| 文件编码 | ✅ 正常 | .editorconfig 确保 UTF-8 |
| 前端请求 | ✅ 正常 | axios 默认 UTF-8 |
| 后端处理 | ✅ 正常 | ThinkPHP 8 默认 UTF-8 |

### 终端显示验证（已修复）

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| Playwright 测试输出 | 乱码 | 正常（使用 npm run test:e2e） |
| PHP 脚本输出 | 可能乱码 | 正常（UTF-8 环境） |
| 构建日志 | 可能乱码 | 正常 |

## 使用建议

### 1. 运行 E2E 测试

```bash
# 使用 UTF-8 编码运行测试
cd D:\AI\OA\frontend
npm run test:e2e

# 或使用 UI 模式
npm run test:e2e:ui

# 查看报告
npm run test:e2e:report
```

### 2. 手动设置终端编码

如果在其他终端运行，先执行：

```powershell
# PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

### 3. 永久设置 Windows 终端 UTF-8

1. 打开 Windows 设置
2. 时间和语言 → 语言和区域
3. 管理语言设置 → 更改系统区域设置
4. 勾选 "Beta 版: 使用 Unicode UTF-8 提供全球语言支持"

## 注意事项

1. **数据库迁移**：如果数据库已有数据，修改字符集后需迁移：
   ```sql
   ALTER DATABASE database_name CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
   ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Git 配置**：确保 Git 也使用 UTF-8：
   ```bash
   git config --global core.quotepath false
   git config --global gui.encoding utf-8
   git config --global i18n.commitencoding utf-8
   git config --global i18n.logoutputencoding utf-8
   ```

3. **IDE 设置**：确保 VS Code 默认使用 UTF-8：
   - 设置 `files.encoding` 为 `utf8`
   - 设置 `files.autoGuessEncoding` 为 `false`

## 总结

本次修复解决了以下问题：

1. ✅ **终端乱码** - 通过设置 UTF-8 代码页和环境变量
2. ✅ **数据库字符集** - 从 utf8 升级到 utf8mb4
3. ✅ **HTML 语言** - 从 en 改为 zh-CN
4. ✅ **编辑器配置** - 创建后端 .editorconfig
5. ✅ **验证工具** - 创建 UTF-8 编码验证脚本

**核心结论**：应用本身没有中文显示问题，乱码仅出现在终端输出中。所有修复均已完成，建议在后续开发中使用 `npm run test:e2e` 命令运行测试以确保编码正确。
