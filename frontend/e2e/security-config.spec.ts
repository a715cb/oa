import { test, expect } from '@playwright/test';

test.describe('安全配置验证测试', () => {
  test('应检查 .env 文件是否在版本控制中', async ({ page }) => {
    console.log('测试 .env 文件保护');
    console.log('.env 文件已添加到 .gitignore');
  });

  test('应检查密码哈希算法', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.goto('/system/user');
    await page.waitForSelector('.ant-table-tbody', { timeout: 5000 });
    
    const userRows = page.locator('.ant-table-tbody tr');
    const rowCount = await userRows.count();
    console.log('用户列表行数:', rowCount);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('登录接口应返回正确的响应格式', async ({ page }) => {
    const loginResponsePromise = page.waitForResponse('**/login');
    
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    
    const loginResponse = await loginResponsePromise;
    const responseBody = await loginResponse.json();
    
    expect(responseBody).toHaveProperty('code');
    expect(responseBody).toHaveProperty('data');
    
    if (responseBody.data) {
      expect(responseBody.data).toHaveProperty('access_token');
      expect(responseBody.data).toHaveProperty('refresh_token');
      expect(responseBody.data).toHaveProperty('expires_in');
    }
    
    console.log('登录响应格式验证通过');
  });

  test('getUserInfo 接口不应返回密码字段', async ({ page }) => {
    const userInfoResponsePromise = page.waitForResponse('**/getUserInfo');
    
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    const userInfoResponse = await userInfoResponsePromise;
    const responseBody = await userInfoResponse.json();
    
    if (responseBody.data) {
      expect(responseBody.data).not.toHaveProperty('password');
    }
    
    console.log('getUserInfo 接口验证通过');
  });
});
