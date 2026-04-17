# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: jwt-token-security.spec.ts >> SEC-002/SEC-003: JWT Token 安全测试 >> 退出登录后应清除 Token
- Location: e2e\jwt-token-security.spec.ts:60:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=admin')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e5]:
    - generic [ref=e6]:
      - link "在线OA" [ref=e8] [cursor=pointer]:
        - /url: /
        - img [ref=e9]
        - heading "在线OA" [level=1] [ref=e10]
      - menu [ref=e12]:
        - menuitem "home 首页" [ref=e13] [cursor=pointer]:
          - img "home" [ref=e14]:
            - img [ref=e15]
          - link "首页" [ref=e18]:
            - /url: /
        - generic [ref=e21] [cursor=pointer]:
          - img "setting" [ref=e22]:
            - img [ref=e23]
          - text: 系统管理
        - generic [ref=e27] [cursor=pointer]:
          - img "code" [ref=e28]:
            - img [ref=e29]
          - text: 组件示例
  - generic [ref=e31]:
    - generic [ref=e34]:
      - generic [ref=e35]:
        - img "menu-fold" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
        - link "首页" [ref=e42]
      - generic [ref=e44]:
        - generic [ref=e45]:
          - button "setting" [ref=e47] [cursor=pointer]:
            - img "setting" [ref=e48]:
              - img [ref=e49]
          - button [ref=e52] [cursor=pointer]:
            - img [ref=e53]:
              - img [ref=e54]
        - generic [ref=e58] [cursor=pointer]: 超级管理员
    - generic [ref=e61]:
      - tablist [ref=e62]:
        - tab "home 首页" [selected] [ref=e66] [cursor=pointer]:
          - img "home" [ref=e67]:
            - img [ref=e68]
          - text: 首页
        - button "down" [ref=e71] [cursor=pointer]:
          - img "down" [ref=e72]:
            - img [ref=e73]
      - generic:
        - generic:
          - tabpanel "home 首页"
    - main [ref=e75]:
      - generic [ref=e78]:
        - generic [ref=e80]:
          - generic [ref=e83]: 数据分析
          - generic [ref=e85]:
            - generic [ref=e92]:
              - generic [ref=e93]:
                - generic [ref=e94]: 访问总人次
                - generic [ref=e97]: 5,670
              - generic [ref=e98]:
                - generic [ref=e99]: 访问总人次
                - generic [ref=e100]:
                  - text: "206.32"
                  - img "arrow-up" [ref=e101]:
                    - img [ref=e102]
            - generic [ref=e114]:
              - generic [ref=e115]:
                - generic [ref=e116]: 内容发布量
                - generic [ref=e119]: 5,670
              - generic [ref=e120]:
                - generic [ref=e121]: 访问总人次
                - generic [ref=e122]:
                  - text: "206"
                  - img "arrow-up" [ref=e123]:
                    - img [ref=e124]
            - generic [ref=e136]:
              - generic [ref=e137]:
                - generic [ref=e138]: 评论总量
                - generic [ref=e141]: 5,670
              - generic [ref=e142]:
                - generic [ref=e143]: 访问总人次
                - generic [ref=e144]:
                  - text: "206.32"
                  - img "arrow-up" [ref=e145]:
                    - img [ref=e146]
            - generic [ref=e158]:
              - generic [ref=e159]:
                - generic [ref=e160]: 分享总量
                - generic [ref=e163]: 5,670
              - generic [ref=e164]:
                - generic [ref=e165]: 访问总人次
                - generic [ref=e166]:
                  - text: "206.32"
                  - img "arrow-up" [ref=e167]:
                    - img [ref=e168]
        - generic [ref=e175]:
          - generic [ref=e181]:
            - generic [ref=e182]: 内容发布比例
            - generic [ref=e183]: 查看更多
          - generic [ref=e189]:
            - generic [ref=e191]:
              - generic [ref=e192]: 热门榜单
              - generic [ref=e193]: 查看更多
            - generic [ref=e199]:
              - table [ref=e201]:
                - rowgroup [ref=e208]:
                  - row "排名 名称 内容量 caret-up caret-down 点击量 caret-up caret-down" [ref=e209]:
                    - columnheader "排名" [ref=e210]
                    - columnheader "名称" [ref=e211]
                    - columnheader "内容量 caret-up caret-down" [ref=e212] [cursor=pointer]:
                      - generic [ref=e213]:
                        - generic [ref=e214]: 内容量
                        - generic [ref=e216]:
                          - generic "caret-up" [ref=e217]:
                            - img [ref=e218]
                          - generic "caret-down" [ref=e220]:
                            - img [ref=e221]
                    - columnheader "点击量 caret-up caret-down" [ref=e223] [cursor=pointer]:
                      - generic [ref=e224]:
                        - generic [ref=e225]: 点击量
                        - generic [ref=e227]:
                          - generic "caret-up" [ref=e228]:
                            - img [ref=e229]
                          - generic "caret-down" [ref=e231]:
                            - img [ref=e232]
                    - columnheader [ref=e234]
              - table [ref=e236]:
                - rowgroup [ref=e238]:
                  - row "1 放问气 5145 8595" [ref=e239]:
                    - cell "1" [ref=e240]
                    - cell "放问气" [ref=e241]
                    - cell "5145" [ref=e242]
                    - cell "8595" [ref=e243]
                  - row "2 来观住 8043 2676" [ref=e244]:
                    - cell "2" [ref=e245]
                    - cell "来观住" [ref=e246]
                    - cell "8043" [ref=e247]
                    - cell "2676" [ref=e248]
                  - row "3 可完单 9176 5645" [ref=e249]:
                    - cell "3" [ref=e250]
                    - cell "可完单" [ref=e251]
                    - cell "9176" [ref=e252]
                    - cell "5645" [ref=e253]
                  - row "4 数电包 8830 8187" [ref=e254]:
                    - cell "4" [ref=e255]
                    - cell "数电包" [ref=e256]
                    - cell "8830" [ref=e257]
                    - cell "8187" [ref=e258]
                  - row "5 列明老 1683 2779" [ref=e259]:
                    - cell "5" [ref=e260]
                    - cell "列明老" [ref=e261]
                    - cell "1683" [ref=e262]
                    - cell "2779" [ref=e263]
                  - row "6 强当圆 6765 4234" [ref=e264]:
                    - cell "6" [ref=e265]
                    - cell "强当圆" [ref=e266]
                    - cell "6765" [ref=e267]
                    - cell "4234" [ref=e268]
                  - row "7 得色基 5004 6017" [ref=e269]:
                    - cell "7" [ref=e270]
                    - cell "得色基" [ref=e271]
                    - cell "5004" [ref=e272]
                    - cell "6017" [ref=e273]
        - generic [ref=e280]: 内容时段分析
    - generic [ref=e286]:
      - text: Copyright © 2026
      - link "OnLine OA Team" [ref=e287] [cursor=pointer]:
        - /url: http://localhost:5173
      - separator [ref=e288]
      - link "粤ICP备2026000000号" [ref=e289] [cursor=pointer]:
        - /url: https://beian.miit.gov.cn
      - separator [ref=e290]
      - text: v 1.0.0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('SEC-002/SEC-003: JWT Token 安全测试', () => {
  4  |   test('登录页面应正常加载', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
  7  |     await expect(page).toHaveTitle(/登录/);
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
> 67 |     await page.locator('text=admin').click();
     |                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
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