import { test, expect } from '../../fixtures/base';

test.describe('登出流程 E2E 测试', () => {
  test('退出登录后应跳转到登录页', async ({ authenticatedPage: page }) => {
    // 点击用户菜单
    await page.locator('.user-menu, .user-dropdown, text=admin').click();
    
    // 点击退出登录
    await page.locator('text=退出登录').click();
    
    // 等待跳转到登录页
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('退出登录后应清除本地存储的 token', async ({ authenticatedPage: page }) => {
    // 退出登录
    await page.locator('.user-menu, .user-dropdown, text=admin').click();
    await page.locator('text=退出登录').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // 验证 localStorage 中的 token 已被清除
    const storage = await page.evaluate(() => {
      return {
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token')
      };
    });
    
    expect(storage.accessToken).toBeNull();
    expect(storage.refreshToken).toBeNull();
  });

  test('退出登录后再次访问受保护页面应重定向', async ({ authenticatedPage: page }) => {
    // 退出登录
    await page.locator('.user-menu, .user-dropdown, text=admin').click();
    await page.locator('text=退出登录').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // 尝试访问系统管理页面
    await page.goto('/system/user');
    
    // 应重定向到登录页
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('刷新页面后登录状态应保持', async ({ authenticatedPage: page }) => {
    const currentUrl = page.url();
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 验证仍保持在原页面（不是登录页）
    expect(page.url()).not.toContain('/login');
  });

  test('已登录用户访问登录页应重定向', async ({ authenticatedPage: page }) => {
    // 访问登录页
    await page.goto('/login');
    
    // 等待可能的重定向
    await page.waitForTimeout(2000);
    
    // 应被重定向到首页或其他页面
    expect(page.url()).not.toContain('/login');
  });
});
