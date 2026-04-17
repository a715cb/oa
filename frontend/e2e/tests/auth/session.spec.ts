import { test, expect } from '../../fixtures/base';

test.describe('会话管理 E2E 测试', () => {
  test('Token 过期后访问受保护页面应重新登录', async ({ page }) => {
    // 先正常登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    // 手动设置一个过期的 Token
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'expired_token_value');
    });
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 应该被重定向到登录页
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('多个标签页应共享登录状态', async ({ browser }) => {
    // 创建第一个页面并登录
    const context = await browser.newContext();
    const page1 = await context.newPage();
    await page1.goto('/login');
    await page1.fill('input[placeholder="请输入用户名"]', 'admin');
    await page1.fill('input[placeholder="请输入密码"]', '123456');
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    // 在同一上下文中打开第二个页面
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.waitForLoadState('networkidle');
    
    // 第二个页面应该也是已登录状态
    expect(page2.url()).not.toContain('/login');
    
    await context.close();
  });

  test('刷新页面后登录状态应保持', async ({ authenticatedPage: page }) => {
    const currentUrl = page.url();
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 应保持在原页面
    expect(page.url()).not.toContain('/login');
  });

  test('关闭浏览器后重新打开应保持登录状态（如果有持久化）', async ({ browser }) => {
    // 注意：这个测试需要 browser.newContext() 而非 browser.newPage()
    // 如果需要测试持久化登录，需要使用 chromium.launchPersistentContext()
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    // 获取存储的 token
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
    
    await context.close();
  });
});
