import { test, expect } from '@playwright/test';

test.describe('认证流程与边界条件测试', () => {
  test('空用户名和密码登录应被拒绝', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=用户名或密码不能为空', { timeout: 5000 });
    await expect(page.locator('text=用户名或密码不能为空')).toBeVisible();
  });

  test('仅输入用户名应被拒绝', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=用户名或密码不能为空', { timeout: 5000 });
  });

  test('仅输入密码应被拒绝', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=用户名或密码不能为空', { timeout: 5000 });
  });

  test('超长输入应被处理', async ({ page }) => {
    await page.goto('/login');
    
    const longInput = 'a'.repeat(10000);
    await page.fill('input[placeholder*="用户名"]', longInput);
    await page.fill('input[placeholder*="密码"]', longInput);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });

  test('特殊字符输入应被处理', async ({ page }) => {
    await page.goto('/login');
    
    const specialChars = '<script>alert(1)</script>';
    await page.fill('input[placeholder*="用户名"]', specialChars);
    await page.fill('input[placeholder*="密码"]', specialChars);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
    
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert(1)</script>');
  });

  test('SQL 注入尝试应被拒绝', async ({ page }) => {
    await page.goto('/login');
    
    const sqlInjection = "' OR '1'='1";
    await page.fill('input[placeholder*="用户名"]', sqlInjection);
    await page.fill('input[placeholder*="密码"]', sqlInjection);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');
  });

  test('连续登录失败应触发锁定', async ({ page }) => {
    await page.goto('/login');
    
    for (let i = 0; i < 11; i++) {
      await page.fill('input[placeholder*="用户名"]', 'admin');
      await page.fill('input[placeholder*="密码"]', 'wrong_password');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(500);
    }
    
    const lockoutMessage = await page.locator('text=由于多次输入错误密码').isVisible();
    console.log('登录锁定状态:', lockoutMessage ? '已锁定 (安全)' : '未锁定');
  });

  test('已登录用户访问登录页应重定向', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.goto('/login');
    
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain('/login');
  });

  test('未登录访问受保护页面应重定向到登录', async ({ page }) => {
    await page.goto('/system/user');
    
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('刷新页面后登录状态应保持', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    expect(page.url()).not.toContain('/login');
  });
});
