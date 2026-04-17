# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jwt-token-security.spec.ts >> SEC-002/SEC-003: JWT Token 安全测试 >> 登录页面应正常加载
- Location: e2e\jwt-token-security.spec.ts:4:3

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /登录/
Received string:  "在线OA"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    8 × unexpected value "在线OA"

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
  3  | test.describe('SEC-002/SEC-003: JWT Token 安全测试', () => {
  4  |   test('登录页面应正常加载', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
> 7  |     await expect(page).toHaveTitle(/登录/);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  8  |     await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible();
  9  |     await expect(page.locator('input[placeholder*="密码"]')).toBeVisible();
  10 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('成功登录后应返回 Token', async ({ page, context }) => {
  14 |     await page.goto('/login');
  15 |     
  16 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  17 |     await page.fill('input[placeholder*="密码"]', '123456');
  18 |     await page.click('button[type="submit"]');
  19 |     
  20 |     await page.waitForURL('**/*', { timeout: 10000 });
  21 |     
  22 |     const currentUrl = page.url();
  23 |     expect(currentUrl).not.toContain('/login');
  24 |     
  25 |     const cookies = await context.cookies();
  26 |     const storage = await page.evaluate(() => {
  27 |       return {
  28 |         localStorage: JSON.stringify(localStorage),
  29 |         accessToken: localStorage.getItem('access_token'),
  30 |         refreshToken: localStorage.getItem('refresh_token')
  31 |       };
  32 |     });
  33 |     
  34 |     console.log('登录后存储状态:', storage);
  35 |   });
  36 | 
  37 |   test('Token 不应通过 URL 参数传递', async ({ page }) => {
  38 |     await page.goto('/login?token=fake_token_here');
  39 |     
  40 |     const urlParams = await page.evaluate(() => {
  41 |       const params = new URLSearchParams(window.location.search);
  42 |       return params.get('token');
  43 |     });
  44 |     
  45 |     expect(urlParams).toBeNull();
  46 |   });
  47 | 
  48 |   test('使用无效 Token 访问受保护页面应被重定向', async ({ page }) => {
  49 |     await page.evaluate(() => {
  50 |       localStorage.setItem('oa_office_access_token', 'Bearer invalid_token_here');
  51 |     });
  52 |     
  53 |     await page.goto('/');
  54 |     
  55 |     await page.waitForURL('**/login', { timeout: 10000 });
  56 |     
  57 |     expect(page.url()).toContain('/login');
  58 |   });
  59 | 
  60 |   test('退出登录后应清除 Token', async ({ page }) => {
  61 |     await page.goto('/login');
  62 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  63 |     await page.fill('input[placeholder*="密码"]', '123456');
  64 |     await page.click('button[type="submit"]');
  65 |     await page.waitForURL('**/*', { timeout: 10000 });
  66 |     
  67 |     await page.locator('text=admin').click();
  68 |     await page.locator('text=退出登录').click();
  69 |     
  70 |     await page.waitForURL('**/login', { timeout: 10000 });
  71 |     
  72 |     const storage = await page.evaluate(() => {
  73 |       return {
  74 |         accessToken: localStorage.getItem('access_token'),
  75 |         refreshToken: localStorage.getItem('refresh_token')
  76 |       };
  77 |     });
  78 |     
  79 |     expect(storage.accessToken).toBeNull();
  80 |     expect(storage.refreshToken).toBeNull();
  81 |   });
  82 | });
  83 | 
```