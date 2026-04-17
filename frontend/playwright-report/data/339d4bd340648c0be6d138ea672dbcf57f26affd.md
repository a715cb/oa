# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-security.spec.ts >> SEC-004: 初始密码安全测试 >> 登录应使用密码哈希验证
- Location: e2e\password-security.spec.ts:4:3

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
          - textbox "请输入用户名" [ref=e44]: admin
          - button "close-circle" [ref=e46] [cursor=pointer]:
            - img "close-circle" [ref=e47]:
              - img [ref=e48]
      - generic [ref=e54]:
        - generic [ref=e55]: 密码
        - generic [ref=e56]:
          - img "lock" [ref=e58]:
            - img [ref=e59]
          - textbox "请输入密码" [ref=e61]: "123456"
          - img "eye-invisible" [ref=e63] [cursor=pointer]:
            - img [ref=e64]
      - generic [ref=e67]:
        - generic [ref=e68] [cursor=pointer]:
          - checkbox "记住账号" [ref=e70]
          - generic [ref=e72]: 记住账号
        - generic [ref=e73] [cursor=pointer]: 忘记密码？
      - button "loading 登 录" [active] [ref=e79]:
        - img "loading" [ref=e81]:
          - img [ref=e82]
        - generic [ref=e84]: 登 录
    - generic [ref=e85]:
      - paragraph [ref=e86]: Copyright © 2026 OnLine OA Team
      - paragraph [ref=e87]: 粤ICP备2026000000号
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('SEC-004: 初始密码安全测试', () => {
  4  |   test('登录应使用密码哈希验证', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
  7  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  8  |     await page.fill('input[placeholder*="密码"]', '123456');
  9  |     await page.click('button[type="submit"]');
  10 |     
  11 |     await page.waitForURL('**/*', { timeout: 10000 });
  12 |     
  13 |     const currentUrl = page.url();
> 14 |     expect(currentUrl).not.toContain('/login');
     |                            ^ Error: expect(received).not.toContain(expected) // indexOf
  15 |   });
  16 | 
  17 |   test('错误密码应显示失败提示', async ({ page }) => {
  18 |     await page.goto('/login');
  19 |     
  20 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  21 |     await page.fill('input[placeholder*="密码"]', 'wrong_password');
  22 |     await page.click('button[type="submit"]');
  23 |     
  24 |     await page.waitForSelector('text=用户名或密码不正确', { timeout: 5000 });
  25 |   });
  26 | 
  27 |   test('密码字段不应出现在网络响应中', async ({ page }) => {
  28 |     const responsePromise = page.waitForResponse('**/getUserInfo');
  29 |     
  30 |     await page.goto('/login');
  31 |     await page.fill('input[placeholder*="用户名"]', 'admin');
  32 |     await page.fill('input[placeholder*="密码"]', '123456');
  33 |     await page.click('button[type="submit"]');
  34 |     
  35 |     const response = await responsePromise;
  36 |     const responseBody = await response.json();
  37 |     
  38 |     if (responseBody.data) {
  39 |       expect(responseBody.data).not.toHaveProperty('password');
  40 |     }
  41 |   });
  42 | });
  43 | 
```