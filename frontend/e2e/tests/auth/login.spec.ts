import { test, expect } from '../../fixtures/base';
import { ROLES } from '../../config/constants';

test.describe('登录流程 E2E 测试', () => {
  test('成功登录 - 管理员角色', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', ROLES.ADMIN.username);
    await page.fill('input[placeholder="请输入密码"]', ROLES.ADMIN.password);
    await page.click('button[type="submit"]');
    
    // 等待登录成功
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    // 验证 URL 不再是登录页
    expect(page.url()).not.toContain('/login');
    
    // 验证页面包含首页元素
    await expect(page.locator('text=首页')).toBeVisible({ timeout: 5000 });
  });

  test('成功登录后应跳转到首页', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', ROLES.ADMIN.username);
    await page.fill('input[placeholder="请输入密码"]', ROLES.ADMIN.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    expect(page.url()).toContain('/');
    expect(page.url()).not.toContain('/login');
  });

  test('登录页面应正常加载', async ({ page }) => {
    await page.goto('/login');
    
    // 验证登录页面元素
    await expect(page).toHaveTitle(/登录/);
    await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=欢迎登录')).toBeVisible();
  });

  test('空用户名应显示错误提示', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    // 验证表单验证错误
    await expect(page.locator('text=请输入用户名')).toBeVisible({ timeout: 5000 });
  });

  test('空密码应显示错误提示', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=请输入密码')).toBeVisible({ timeout: 5000 });
  });

  test('错误密码应显示错误提示', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', ROLES.ADMIN.username);
    await page.fill('input[placeholder="请输入密码"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    // 等待错误提示
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('记住账号功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'testuser');
    await page.locator('.ant-checkbox-wrapper').click();
    await page.fill('input[placeholder="请输入密码"]', 'wrong');
    await page.click('button[type="submit"]');
    
    // 登录失败后重新加载，用户名应保持
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const usernameValue = await page.locator('input[placeholder="请输入用户名"]').inputValue();
    expect(usernameValue).toBe('testuser');
  });
});
