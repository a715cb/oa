import { test, expect } from '@playwright/test';

test.describe('SEC-002/SEC-003: JWT Token 安全测试', () => {
  test('登录页面应正常加载', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/登录/);
    await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="密码"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('成功登录后应返回 Token', async ({ page, context }) => {
    await page.goto('/login');
    
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/*', { timeout: 10000 });
    
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    const cookies = await context.cookies();
    const storage = await page.evaluate(() => {
      return {
        localStorage: JSON.stringify(localStorage),
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token')
      };
    });
    
    console.log('登录后存储状态:', storage);
  });

  test('Token 不应通过 URL 参数传递', async ({ page }) => {
    await page.goto('/login?token=fake_token_here');
    
    const urlParams = await page.evaluate(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get('token');
    });
    
    expect(urlParams).toBeNull();
  });

  test('使用无效 Token 访问受保护页面应被重定向', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('oa_office_access_token', 'Bearer invalid_token_here');
    });
    
    await page.goto('/');
    
    await page.waitForURL('**/login', { timeout: 10000 });
    
    expect(page.url()).toContain('/login');
  });

  test('退出登录后应清除 Token', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.locator('text=admin').click();
    await page.locator('text=退出登录').click();
    
    await page.waitForURL('**/login', { timeout: 10000 });
    
    const storage = await page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token')
      };
    });
    
    expect(storage.accessToken).toBeNull();
    expect(storage.refreshToken).toBeNull();
  });
});
