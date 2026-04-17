import { test, expect } from '@playwright/test';

test.describe('系统核心功能 E2E 测试', () => {
  test('完整用户管理流程', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    expect(page.url()).not.toContain('/login');

    await page.goto('/system/user');
    await page.waitForSelector('text=新增', { timeout: 5000 });

    const userList = page.locator('.ant-table-tbody');
    await expect(userList).toBeVisible();
  });

  test('角色管理功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    await page.goto('/system/role');
    await page.waitForSelector('text=新增', { timeout: 5000 });

    const roleList = page.locator('.ant-table-tbody');
    await expect(roleList).toBeVisible();
  });

  test('部门管理功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    await page.goto('/system/department');
    await page.waitForSelector('text=新增', { timeout: 5000 });

    const deptList = page.locator('.ant-table-tbody');
    await expect(deptList).toBeVisible();
  });

  test('菜单管理功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    await page.goto('/system/menu');
    await page.waitForSelector('text=新增', { timeout: 5000 });

    const menuTree = page.locator('.ant-tree');
    await expect(menuTree).toBeVisible();
  });

  test('字典管理功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    await page.goto('/system/dict');
    await page.waitForSelector('text=新增', { timeout: 5000 });

    const dictList = page.locator('.ant-table-tbody');
    await expect(dictList).toBeVisible();
  });

  test('个人中心功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    await page.goto('/account/center');
    await page.waitForSelector('text=基本设置', { timeout: 5000 });

    await expect(page.locator('text=基本设置')).toBeVisible();
    await expect(page.locator('text=修改密码')).toBeVisible();
  });

  test('日志查询功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    await page.goto('/system/login_log');
    await page.waitForSelector('.ant-table-tbody', { timeout: 5000 });

    const logTable = page.locator('.ant-table-tbody');
    await expect(logTable).toBeVisible();
  });

  test('首页加载功能', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });

    expect(page.url()).not.toContain('/login');
    
    const welcomeText = page.locator('text=首页');
    await expect(welcomeText).toBeVisible();
  });
});
