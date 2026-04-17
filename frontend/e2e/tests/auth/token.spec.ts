import { test, expect } from '../../fixtures/base';

test.describe('Token 安全 E2E 测试', () => {
  test('成功登录后应在 localStorage 中存储 Token', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    // 验证 localStorage 中存储了 Token
    const storage = await page.evaluate(() => ({
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token')
    }));
    
    expect(storage.accessToken).toBeTruthy();
    expect(storage.accessToken!.length).toBeGreaterThan(0);
  });

  test('Token 不应通过 URL 参数传递', async ({ page }) => {
    await page.goto('/login?token=fake_token_here');
    
    // URL 中的 token 参数应该被忽略或清除
    const urlParams = await page.evaluate(() => {
      return new URLSearchParams(window.location.search).get('token');
    });
    
    // 验证 token 参数未被使用
    expect(urlParams).toBeNull();
  });

  test('使用无效 Token 访问应被重定向到登录', async ({ page }) => {
    // 手动设置无效 Token
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'invalid_token_12345');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 等待重定向到登录页
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('登出后应清除所有 Token', async ({ authenticatedPage: page }) => {
    // 退出登录
    await page.locator('.user-menu, .user-dropdown, text=admin').click();
    await page.locator('text=退出登录').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // 验证 Token 已被清除
    const storage = await page.evaluate(() => ({
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token')
    }));
    
    expect(storage.accessToken).toBeNull();
    expect(storage.refreshToken).toBeNull();
  });

  test('登录接口应返回正确的响应格式', async ({ page }) => {
    const loginResponsePromise = page.waitForResponse('**/login');
    
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    
    const loginResponse = await loginResponsePromise;
    const responseBody = await loginResponse.json();
    
    // 验证响应结构
    expect(responseBody).toHaveProperty('code');
    expect(responseBody).toHaveProperty('data');
    
    if (responseBody.data) {
      expect(responseBody.data).toHaveProperty('access_token');
      expect(responseBody.data).toHaveProperty('refresh_token');
      expect(responseBody.data).toHaveProperty('expires_in');
    }
  });

  test('getUserInfo 接口不应返回密码字段', async ({ page }) => {
    const userInfoResponsePromise = page.waitForResponse('**/getUserInfo');
    
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    const userInfoResponse = await userInfoResponsePromise;
    const responseBody = await userInfoResponse.json();
    
    if (responseBody.data) {
      expect(responseBody.data).not.toHaveProperty('password');
      expect(responseBody.data).not.toHaveProperty('password_hash');
    }
  });

  test('API 请求应携带 Authorization 头', async ({ authenticatedPage: page }) => {
    const apiResponsePromise = page.waitForResponse('**/adminapi/**');
    
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    const apiResponse = await apiResponsePromise;
    const requestHeaders = apiResponse.request().headers();
    
    // 验证请求包含 Authorization 头
    expect(requestHeaders.authorization || requestHeaders.Authorization).toBeTruthy();
  });
});
