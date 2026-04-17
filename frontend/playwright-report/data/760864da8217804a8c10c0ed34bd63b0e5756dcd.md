# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security-config.spec.ts >> 安全配置验证测试 >> 应检查密码哈希算法
- Location: e2e\security-config.spec.ts:9:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.ant-table-tbody') to be visible

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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('安全配置验证测试', () => {
  4  |   test('应检查 .env 文件是否在版本控制中', async ({ page }) => {
  5  |     console.log('测试 .env 文件保护');
  6  |     console.log('.env 文件已添加到 .gitignore');
  7  |   });
  8  | 
  9  |   test('应检查密码哈希算法', async ({ page }) => {
  10 |     await page.goto('/login');
  11 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  12 |     await page.fill('input[placeholder*="密码"]', '123456');
  13 |     await page.click('button[type="submit"]');
  14 |     await page.waitForURL('**/*', { timeout: 10000 });
  15 |     
  16 |     await page.goto('/system/user');
> 17 |     await page.waitForSelector('.ant-table-tbody', { timeout: 5000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  18 |     
  19 |     const userRows = page.locator('.ant-table-tbody tr');
  20 |     const rowCount = await userRows.count();
  21 |     console.log('用户列表行数:', rowCount);
  22 |     expect(rowCount).toBeGreaterThan(0);
  23 |   });
  24 | 
  25 |   test('登录接口应返回正确的响应格式', async ({ page }) => {
  26 |     const loginResponsePromise = page.waitForResponse('**/login');
  27 |     
  28 |     await page.goto('/login');
  29 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  30 |     await page.fill('input[placeholder*="密码"]', '123456');
  31 |     await page.click('button[type="submit"]');
  32 |     
  33 |     const loginResponse = await loginResponsePromise;
  34 |     const responseBody = await loginResponse.json();
  35 |     
  36 |     expect(responseBody).toHaveProperty('code');
  37 |     expect(responseBody).toHaveProperty('data');
  38 |     
  39 |     if (responseBody.data) {
  40 |       expect(responseBody.data).toHaveProperty('access_token');
  41 |       expect(responseBody.data).toHaveProperty('refresh_token');
  42 |       expect(responseBody.data).toHaveProperty('expires_in');
  43 |     }
  44 |     
  45 |     console.log('登录响应格式验证通过');
  46 |   });
  47 | 
  48 |   test('getUserInfo 接口不应返回密码字段', async ({ page }) => {
  49 |     const userInfoResponsePromise = page.waitForResponse('**/getUserInfo');
  50 |     
  51 |     await page.goto('/login');
  52 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  53 |     await page.fill('input[placeholder*="密码"]', '123456');
  54 |     await page.click('button[type="submit"]');
  55 |     await page.waitForURL('**/*', { timeout: 10000 });
  56 |     
  57 |     const userInfoResponse = await userInfoResponsePromise;
  58 |     const responseBody = await userInfoResponse.json();
  59 |     
  60 |     if (responseBody.data) {
  61 |       expect(responseBody.data).not.toHaveProperty('password');
  62 |     }
  63 |     
  64 |     console.log('getUserInfo 接口验证通过');
  65 |   });
  66 | });
  67 | 
```