/**
 * E2E 测试架构完整说明
 * 
 * 本目录包含基于 Playwright 的端到端测试套件
 * 用于测试 Vue3 + Ant Design Vue 前端 + ThinkPHP 后端应用
 */

## 目录结构

```
e2e/
├── config/                          # 测试配置
│   ├── index.ts                    # 统一配置导出
│   └── constants.ts                # 常量定义（角色、URL、性能阈值）
│
├── fixtures/                        # Playwright 夹具
│   ├── base.ts                     # 基础夹具（登录、导航）
│   └── roles.ts                    # 角色夹具（多角色上下文）
│
├── page-objects/                    # 页面对象模型 (POM)
│   ├── base/
│   │   └── BasePage.ts             # 页面对象基类
│   ├── auth/
│   │   └── LoginPage.ts            # 登录页面
│   ├── system/
│   │   ├── UserPage.ts             # 用户管理页面
│   │   ├── RolePage.ts             # 角色管理页面
│   │   ├── DepartmentPage.ts       # 部门管理页面
│   │   ├── MenuPage.ts             # 菜单管理页面
│   │   └── DictPage.ts             # 字典管理页面
│   ├── account/
│   │   └── CenterPage.ts           # 个人中心页面
│   └── home/
│       └── HomePage.ts             # 首页
│
├── tests/                           # 测试用例（按模块组织）
│   ├── auth/                        # 认证相关测试
│   │   ├── login.spec.ts           # 登录流程测试
│   │   ├── logout.spec.ts          # 登出流程测试
│   │   ├── session.spec.ts         # 会话管理测试
│   │   └── token.spec.ts           # Token 安全测试
│   ├── system/                      # 系统管理测试
│   │   └── user.spec.ts            # 用户管理测试
│   ├── account/                     # 个人账户测试
│   │   └── profile.spec.ts         # 个人信息测试
│   ├── permissions/                 # 权限测试
│   │   └── rbac.spec.ts            # RBAC 权限测试
│   └── performance/                 # 性能测试
│       └── page-load.spec.ts       # 页面加载性能
│
├── helpers/                         # 辅助函数
│   ├── auth.ts                     # 认证辅助
│   └── data.ts                     # 测试数据生成
│
├── setup/                           # 测试环境设置
│   ├── global-setup.ts             # 全局设置
│   └── global-teardown.ts          # 全局清理
│
└── types/                          # TypeScript 类型定义
    └── test.ts                     # 测试相关类型
```

## 快速开始

### 前置条件

1. 确保前端开发服务器运行在 http://localhost:5173
2. 确保后端 API 服务运行在 http://127.0.0.1:8000
3. Chromium 浏览器将自动检测并安装（首次运行或版本不匹配时）

### 浏览器管理

项目已实现 **先检测后安装** 的 Chromium 管理机制：

- **本地开发**：运行测试时自动检测 Chromium 是否已安装，仅在未安装时执行安装
- **CI/CD 环境**：使用 `npm run test:e2e:ci` 跳过浏览器检查（由 CI 工作流单独管理）
- **手动安装**：执行 `npm run test:e2e:install-browser` 可单独检查并安装浏览器

```bash
# 检查并安装 Chromium 浏览器（仅当需要时）
npm run test:e2e:install-browser

# 运行测试（自动检测浏览器）
npm run test:e2e

# 跳过浏览器检测运行测试（用于已安装环境）
powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1 --SkipBrowserCheck
```

### 运行测试

```bash
# 运行所有测试
npm run test:e2e

# 以 UI 模式运行（可视化调试）
npm run test:e2e:ui

# 运行特定模块测试
npm run test:e2e:auth      # 认证测试
npm run test:e2e:system    # 系统管理测试
npm run test:e2e:perf      # 性能测试

# 无头模式运行（CI 环境）
npm run test:e2e:headless

# 移动端模拟测试
npm run test:e2e:mobile

# CI 模式运行
npm run test:e2e:ci
```

### 查看测试报告

```bash
npm run test:e2e:report
```

## 多角色测试

项目支持以下角色测试场景：

| 角色 | 用户名 | 密码 | 用途 |
|------|--------|------|------|
| 超级管理员 | admin | 123456 | 完整系统管理权限 |
| 普通用户 | user | 123456 | 受限权限 |
| 新用户 | newuser | 123456 | 首次登录场景 |

## 测试覆盖范围

### 认证流程
- 正常登录/登出
- 错误密码处理
- 表单验证
- Token 管理
- 会话保持

### 权限管理
- 管理员完整权限
- 普通用户受限权限
- 新用户首次登录
- 角色交叉验证

### 系统管理
- 用户 CRUD
- 角色管理
- 部门管理
- 菜单管理
- 字典管理

### 性能监控
- FCP（首次内容绘制）< 3s
- 完全加载 < 5s
- DOM 交互 < 2s
- 资源数量 < 100
- 页面大小 < 10MB

## 截图与视频

测试失败时自动捕获：
- 全屏截图（PNG）
- 操作视频（WebM）
- 轨迹文件（Trace ZIP）

查看轨迹文件：
```bash
npx playwright show-trace test-results/xxx/trace.zip
```

## CI/CD 集成

GitHub Actions 配置位于 `.github/workflows/e2e-tests.yml`

工作流程：
1. 检出代码
2. 安装依赖
3. 安装 Playwright 浏览器
4. 启动后端服务
5. 启动前端服务
6. 运行 E2E 测试
7. 上传测试报告
8. 发布 JUnit 结果

## 编写新测试

1. 在 `e2e/tests/` 相应目录下创建 `.spec.ts` 文件
2. 使用 `import { test, expect } from '../../fixtures/base'` 导入夹具
3. 使用页面对象模式封装页面交互
4. 遵循 AAA 模式：Arrange -> Act -> Assert

示例：
```typescript
import { test, expect } from '../../fixtures/base';

test.describe('功能测试', () => {
  test('测试用例', async ({ authenticatedPage: page }) => {
    // Arrange - 准备
    await page.goto('/path');
    
    // Act - 操作
    await page.click('button');
    
    // Assert - 验证
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## 配置说明

### playwright.config.ts

主要配置项：
- `testDir`: 测试目录
- `timeout`: 全局超时
- `retries`: 失败重试
- `workers`: 并行进程
- `reporter`: 报告格式
- `projects`: 浏览器/设备配置

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| BASE_URL | 前端服务地址 | http://localhost:5173 |
| CI | CI 环境标识 | false |
| HEADLESS | 无头模式 | false |

## 最佳实践

1. **使用页面对象模式**：封装页面交互逻辑
2. **保持测试独立性**：每个测试应能独立运行
3. **使用有意义的选择器**：优先使用 data-testid
4. **合理设置超时**：避免过短导致误报
5. **定期清理测试数据**：避免测试间相互影响
