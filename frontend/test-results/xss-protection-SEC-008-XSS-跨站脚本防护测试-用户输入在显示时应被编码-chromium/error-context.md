# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: xss-protection.spec.ts >> SEC-008: XSS 跨站脚本防护测试 >> 用户输入在显示时应被编码
- Location: e2e\xss-protection.spec.ts:74:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=新增')

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
  3   | test.describe('SEC-008: XSS 跨站脚本防护测试', () => {
  4   |   test('菜单搜索高亮应转义 HTML', async ({ page }) => {
  5   |     await page.goto('/login');
  6   |     await page.fill('input[placeholder*="用户名"]', 'admin');
  7   |     await page.fill('input[placeholder*="密码"]', '123456');
  8   |     await page.click('button[type="submit"]');
  9   |     await page.waitForURL('**/*', { timeout: 10000 });
  10  |     
  11  |     await page.goto('/system/menu');
  12  |     await page.waitForSelector('input[placeholder*="搜索"]', { timeout: 5000 });
  13  |     
  14  |     const xssPayload = '<img src=x onerror=alert("XSS")>';
  15  |     await page.fill('input[placeholder*="搜索"]', xssPayload);
  16  |     
  17  |     const filterDropdown = page.locator('input[placeholder*="搜索"]');
  18  |     await filterDropdown.press('Enter');
  19  |     
  20  |     await page.waitForTimeout(1000);
  21  |     
  22  |     const pageContent = await page.content();
  23  |     expect(pageContent).not.toContain('<img src=x onerror=alert("XSS")>');
  24  |     
  25  |     const escapedContent = pageContent.includes('&lt;img') || pageContent.includes('&lt;img');
  26  |     console.log('XSS 转义状态:', escapedContent ? '已转义 (安全)' : '未转义 (危险)');
  27  |   });
  28  | 
  29  |   test('部门搜索高亮应转义 HTML', async ({ page }) => {
  30  |     await page.goto('/login');
  31  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  32  |     await page.fill('input[placeholder*="密码"]', '123456');
  33  |     await page.click('button[type="submit"]');
  34  |     await page.waitForURL('**/*', { timeout: 10000 });
  35  |     
  36  |     await page.goto('/system/department');
  37  |     await page.waitForSelector('input[placeholder*="搜索"]', { timeout: 5000 });
  38  |     
  39  |     const xssPayload = '<script>alert("XSS")</script>';
  40  |     await page.fill('input[placeholder*="搜索"]', xssPayload);
  41  |     await page.keyboard.press('Enter');
  42  |     
  43  |     await page.waitForTimeout(1000);
  44  |     
  45  |     const pageContent = await page.content();
  46  |     expect(pageContent).not.toContain('<script>alert("XSS")</script>');
  47  |   });
  48  | 
  49  |   test('Modal 内容应安全渲染', async ({ page }) => {
  50  |     await page.goto('/login');
  51  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  52  |     await page.fill('input[placeholder*="密码"]', '123456');
  53  |     await page.click('button[type="submit"]');
  54  |     await page.waitForURL('**/*', { timeout: 10000 });
  55  |     
  56  |     await page.goto('/system/user');
  57  |     await page.waitForSelector('text=新增', { timeout: 5000 });
  58  |     
  59  |     await page.evaluate(() => {
  60  |       const originalAlert = window.alert;
  61  |       window.alert = (msg: string) => {
  62  |         window.__xss_triggered__ = true;
  63  |         originalAlert(msg);
  64  |       };
  65  |     });
  66  |     
  67  |     await page.locator('text=新增').click();
  68  |     await page.waitForTimeout(2000);
  69  |     
  70  |     const xssTriggered = await page.evaluate(() => (window as any).__xss_triggered__);
  71  |     expect(xssTriggered).toBeFalsy();
  72  |   });
  73  | 
  74  |   test('用户输入在显示时应被编码', async ({ page }) => {
  75  |     await page.goto('/login');
  76  |     await page.fill('input[placeholder*="用户名"]', 'admin');
  77  |     await page.fill('input[placeholder*="密码"]', '123456');
  78  |     await page.click('button[type="submit"]');
  79  |     await page.waitForURL('**/*', { timeout: 10000 });
  80  |     
  81  |     const maliciousInput = '<b>test</b>';
  82  |     
  83  |     await page.goto('/system/dict');
> 84  |     await page.locator('text=新增').click();
      |                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  85  |     
  86  |     await page.waitForSelector('input[placeholder*="名称"]', { timeout: 5000 });
  87  |     await page.fill('input[placeholder*="名称"]', maliciousInput);
  88  |     
  89  |     await page.locator('button:has-text("确定")').click();
  90  |     
  91  |     await page.waitForTimeout(1000);
  92  |     
  93  |     const hasBoldTag = await page.content().then(content => 
  94  |       content.includes('<b>') && !content.includes('&lt;b&gt;')
  95  |     );
  96  |     
  97  |     console.log('HTML 编码状态:', hasBoldTag ? '未编码' : '已编码 (安全)');
  98  |   });
  99  | });
  100 | 
```