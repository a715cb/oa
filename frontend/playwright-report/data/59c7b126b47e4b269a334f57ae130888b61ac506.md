# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-boundary.spec.ts >> 认证流程与边界条件测试 >> 已登录用户访问登录页应重定向
- Location: e2e\auth-boundary.spec.ts:82:3

# Error details

```
Error: expect(received).not.toContain(expected) // indexOf

Expected substring: not "/login"
Received string:        "http://localhost:5173/login"
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
  3   | test.describe('认证流程与边界条件测试', () => {
  4   |   test('空用户名和密码登录应被拒绝', async ({ page }) => {
  5   |     await page.goto('/login');
  6   |     await page.click('button[type="submit"]');
  7   |     
  8   |     await page.waitForSelector('text=用户名或密码不能为空', { timeout: 5000 });
  9   |     await expect(page.locator('text=用户名或密码不能为空')).toBeVisible();
  10  |   });
  11  | 
  12  |   test('仅输入用户名应被拒绝', async ({ page }) => {
  13  |     await page.goto('/login');
  14  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  15  |     await page.click('button[type="submit"]');
  16  |     
  17  |     await page.waitForSelector('text=用户名或密码不能为空', { timeout: 5000 });
  18  |   });
  19  | 
  20  |   test('仅输入密码应被拒绝', async ({ page }) => {
  21  |     await page.goto('/login');
  22  |     await page.fill('input[placeholder*="密码"]', '123456');
  23  |     await page.click('button[type="submit"]');
  24  |     
  25  |     await page.waitForSelector('text=用户名或密码不能为空', { timeout: 5000 });
  26  |   });
  27  | 
  28  |   test('超长输入应被处理', async ({ page }) => {
  29  |     await page.goto('/login');
  30  |     
  31  |     const longInput = 'a'.repeat(10000);
  32  |     await page.fill('input[placeholder*="用户名"]', longInput);
  33  |     await page.fill('input[placeholder*="密码"]', longInput);
  34  |     await page.click('button[type="submit"]');
  35  |     
  36  |     await page.waitForTimeout(3000);
  37  |     expect(page.url()).toContain('/login');
  38  |   });
  39  | 
  40  |   test('特殊字符输入应被处理', async ({ page }) => {
  41  |     await page.goto('/login');
  42  |     
  43  |     const specialChars = '<script>alert(1)</script>';
  44  |     await page.fill('input[placeholder*="用户名"]', specialChars);
  45  |     await page.fill('input[placeholder*="密码"]', specialChars);
  46  |     await page.click('button[type="submit"]');
  47  |     
  48  |     await page.waitForTimeout(3000);
  49  |     expect(page.url()).toContain('/login');
  50  |     
  51  |     const pageContent = await page.content();
  52  |     expect(pageContent).not.toContain('<script>alert(1)</script>');
  53  |   });
  54  | 
  55  |   test('SQL 注入尝试应被拒绝', async ({ page }) => {
  56  |     await page.goto('/login');
  57  |     
  58  |     const sqlInjection = "' OR '1'='1";
  59  |     await page.fill('input[placeholder*="用户名"]', sqlInjection);
  60  |     await page.fill('input[placeholder*="密码"]', sqlInjection);
  61  |     await page.click('button[type="submit"]');
  62  |     
  63  |     await page.waitForTimeout(3000);
  64  |     expect(page.url()).toContain('/login');
  65  |   });
  66  | 
  67  |   test('连续登录失败应触发锁定', async ({ page }) => {
  68  |     await page.goto('/login');
  69  |     
  70  |     for (let i = 0; i < 11; i++) {
  71  |       await page.fill('input[placeholder*="用户名"]', 'admin');
  72  |       await page.fill('input[placeholder*="密码"]', 'wrong_password');
  73  |       await page.click('button[type="submit"]');
  74  |       
  75  |       await page.waitForTimeout(500);
  76  |     }
  77  |     
  78  |     const lockoutMessage = await page.locator('text=由于多次输入错误密码').isVisible();
  79  |     console.log('登录锁定状态:', lockoutMessage ? '已锁定 (安全)' : '未锁定');
  80  |   });
  81  | 
  82  |   test('已登录用户访问登录页应重定向', async ({ page }) => {
  83  |     await page.goto('/login');
  84  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  85  |     await page.fill('input[placeholder*="密码"]', '123456');
  86  |     await page.click('button[type="submit"]');
  87  |     await page.waitForURL('**/*', { timeout: 10000 });
  88  |     
  89  |     await page.goto('/login');
  90  |     
  91  |     await page.waitForTimeout(2000);
> 92  |     expect(page.url()).not.toContain('/login');
      |                            ^ Error: expect(received).not.toContain(expected) // indexOf
  93  |   });
  94  | 
  95  |   test('未登录访问受保护页面应重定向到登录', async ({ page }) => {
  96  |     await page.goto('/system/user');
  97  |     
  98  |     await page.waitForURL('**/login', { timeout: 10000 });
  99  |     expect(page.url()).toContain('/login');
  100 |   });
  101 | 
  102 |   test('刷新页面后登录状态应保持', async ({ page }) => {
  103 |     await page.goto('/login');
  104 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  105 |     await page.fill('input[placeholder*="密码"]', '123456');
  106 |     await page.click('button[type="submit"]');
  107 |     await page.waitForURL('**/*', { timeout: 10000 });
  108 |     
  109 |     await page.reload();
  110 |     await page.waitForTimeout(3000);
  111 |     
  112 |     expect(page.url()).not.toContain('/login');
  113 |   });
  114 | });
  115 | 
```