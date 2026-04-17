# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-functionality.spec.ts >> 系统核心功能 E2E 测试 >> 菜单管理功能
- Location: e2e\core-functionality.spec.ts:48:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('text=新增') to be visible

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "logo" [ref=e8]
    - heading "在线OA" [level=1] [ref=e9]
    - paragraph [ref=e10]: 高效协同 · 智能管理 · 安全可靠
    - generic [ref=e11]:
      - generic [ref=e12]:
        - img "check-circle" [ref=e13]:
          - img [ref=e14]
        - generic [ref=e16]: 流程自动化管理
      - generic [ref=e17]:
        - img "check-circle" [ref=e18]:
          - img [ref=e19]
        - generic [ref=e21]: 数据实时同步
      - generic [ref=e22]:
        - img "check-circle" [ref=e23]:
          - img [ref=e24]
        - generic [ref=e26]: 多维度统计分析
  - generic [ref=e28]:
    - generic [ref=e29]:
      - heading "欢迎登录" [level=2] [ref=e30]
      - paragraph [ref=e31]: 请使用您的账号密码登录系统
    - generic [ref=e32]:
      - generic [ref=e37]:
        - generic [ref=e38]: 用户名
        - generic [ref=e39]:
          - img "user" [ref=e41]:
            - img [ref=e42]
          - textbox "请输入用户名" [ref=e44]
      - generic [ref=e50]:
        - generic [ref=e51]: 密码
        - generic [ref=e52]:
          - img "lock" [ref=e54]:
            - img [ref=e55]
          - textbox "请输入密码" [ref=e57]
          - img "eye-invisible" [ref=e59] [cursor=pointer]:
            - img [ref=e60]
      - generic [ref=e63]:
        - generic [ref=e64] [cursor=pointer]:
          - checkbox "记住账号" [ref=e66]
          - generic [ref=e68]: 记住账号
        - generic [ref=e69] [cursor=pointer]: 忘记密码？
      - button "登 录" [ref=e75] [cursor=pointer]:
        - generic [ref=e76]: 登 录
    - generic [ref=e77]:
      - paragraph [ref=e78]: Copyright © 2026 OnLine OA Team
      - paragraph [ref=e79]: 粤ICP备2026000000号
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('系统核心功能 E2E 测试', () => {
  4   |   test('完整用户管理流程', async ({ page }) => {
  5   |     await page.goto('/login');
  6   |     await page.fill('input[placeholder*="用户名"]', 'admin');
  7   |     await page.fill('input[placeholder*="密码"]', '123456');
  8   |     await page.click('button[type="submit"]');
  9   |     await page.waitForURL('**/*', { timeout: 10000 });
  10  | 
  11  |     expect(page.url()).not.toContain('/login');
  12  | 
  13  |     await page.goto('/system/user');
  14  |     await page.waitForSelector('text=新增', { timeout: 5000 });
  15  | 
  16  |     const userList = page.locator('.ant-table-tbody');
  17  |     await expect(userList).toBeVisible();
  18  |   });
  19  | 
  20  |   test('角色管理功能', async ({ page }) => {
  21  |     await page.goto('/login');
  22  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  23  |     await page.fill('input[placeholder*="密码"]', '123456');
  24  |     await page.click('button[type="submit"]');
  25  |     await page.waitForURL('**/*', { timeout: 10000 });
  26  | 
  27  |     await page.goto('/system/role');
  28  |     await page.waitForSelector('text=新增', { timeout: 5000 });
  29  | 
  30  |     const roleList = page.locator('.ant-table-tbody');
  31  |     await expect(roleList).toBeVisible();
  32  |   });
  33  | 
  34  |   test('部门管理功能', async ({ page }) => {
  35  |     await page.goto('/login');
  36  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  37  |     await page.fill('input[placeholder*="密码"]', '123456');
  38  |     await page.click('button[type="submit"]');
  39  |     await page.waitForURL('**/*', { timeout: 10000 });
  40  | 
  41  |     await page.goto('/system/department');
  42  |     await page.waitForSelector('text=新增', { timeout: 5000 });
  43  | 
  44  |     const deptList = page.locator('.ant-table-tbody');
  45  |     await expect(deptList).toBeVisible();
  46  |   });
  47  | 
  48  |   test('菜单管理功能', async ({ page }) => {
  49  |     await page.goto('/login');
  50  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  51  |     await page.fill('input[placeholder*="密码"]', '123456');
  52  |     await page.click('button[type="submit"]');
  53  |     await page.waitForURL('**/*', { timeout: 10000 });
  54  | 
  55  |     await page.goto('/system/menu');
> 56  |     await page.waitForSelector('text=新增', { timeout: 5000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  57  | 
  58  |     const menuTree = page.locator('.ant-tree');
  59  |     await expect(menuTree).toBeVisible();
  60  |   });
  61  | 
  62  |   test('字典管理功能', async ({ page }) => {
  63  |     await page.goto('/login');
  64  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  65  |     await page.fill('input[placeholder*="密码"]', '123456');
  66  |     await page.click('button[type="submit"]');
  67  |     await page.waitForURL('**/*', { timeout: 10000 });
  68  | 
  69  |     await page.goto('/system/dict');
  70  |     await page.waitForSelector('text=新增', { timeout: 5000 });
  71  | 
  72  |     const dictList = page.locator('.ant-table-tbody');
  73  |     await expect(dictList).toBeVisible();
  74  |   });
  75  | 
  76  |   test('个人中心功能', async ({ page }) => {
  77  |     await page.goto('/login');
  78  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  79  |     await page.fill('input[placeholder*="密码"]', '123456');
  80  |     await page.click('button[type="submit"]');
  81  |     await page.waitForURL('**/*', { timeout: 10000 });
  82  | 
  83  |     await page.goto('/account/center');
  84  |     await page.waitForSelector('text=基本设置', { timeout: 5000 });
  85  | 
  86  |     await expect(page.locator('text=基本设置')).toBeVisible();
  87  |     await expect(page.locator('text=修改密码')).toBeVisible();
  88  |   });
  89  | 
  90  |   test('日志查询功能', async ({ page }) => {
  91  |     await page.goto('/login');
  92  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  93  |     await page.fill('input[placeholder*="密码"]', '123456');
  94  |     await page.click('button[type="submit"]');
  95  |     await page.waitForURL('**/*', { timeout: 10000 });
  96  | 
  97  |     await page.goto('/system/login_log');
  98  |     await page.waitForSelector('.ant-table-tbody', { timeout: 5000 });
  99  | 
  100 |     const logTable = page.locator('.ant-table-tbody');
  101 |     await expect(logTable).toBeVisible();
  102 |   });
  103 | 
  104 |   test('首页加载功能', async ({ page }) => {
  105 |     await page.goto('/login');
  106 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  107 |     await page.fill('input[placeholder*="密码"]', '123456');
  108 |     await page.click('button[type="submit"]');
  109 |     await page.waitForURL('**/*', { timeout: 10000 });
  110 | 
  111 |     expect(page.url()).not.toContain('/login');
  112 |     
  113 |     const welcomeText = page.locator('text=首页');
  114 |     await expect(welcomeText).toBeVisible();
  115 |   });
  116 | });
  117 | 
```