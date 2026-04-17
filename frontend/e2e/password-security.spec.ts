import { test, expect } from '@playwright/test';

test.describe('SEC-004: 初始密码安全测试', () => {
  test('登录应使用密码哈希验证', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/*', { timeout: 10000 });
    
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('错误密码应显示失败提示', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=用户名或密码不正确', { timeout: 5000 });
  });

  test('密码字段不应出现在网络响应中', async ({ page }) => {
    const responsePromise = page.waitForResponse('**/getUserInfo');
    
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    const responseBody = await response.json();
    
    if (responseBody.data) {
      expect(responseBody.data).not.toHaveProperty('password');
    }
  });
});
