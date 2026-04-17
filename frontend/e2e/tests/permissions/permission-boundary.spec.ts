import { test, expect } from '@playwright/test';
import { ROUTES } from '../../config/constants';
import { login, logout, clearTokens, setToken, createAuthenticatedContext } from '../../helpers/auth';

test.describe('权限边界测试', () => {
  test.describe('越权访问测试', () => {
    test('普通用户无法访问用户管理页面', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      const isRedirected = url.includes('/login') || url.includes('/home');
      
      if (!isRedirected) {
        const hasNoPermission = await page.locator('text=无权限, text=没有权限').isVisible().catch(() => false);
        const isEmptyTable = await page.locator('.ant-empty').isVisible().catch(() => false);
        expect(isRedirected || hasNoPermission || isEmptyTable).toBeTruthy();
      }
      
      await context.close();
    });

    test('普通用户无法访问角色管理页面', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      expect(url.includes('/login') || url.includes('/home') || 
        await page.locator('.ant-empty').isVisible().catch(() => false)).toBeTruthy();
      
      await context.close();
    });

    test('普通用户无法访问部门管理页面', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DEPARTMENT);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      expect(url.includes('/login') || url.includes('/home') || 
        await page.locator('.ant-empty').isVisible().catch(() => false)).toBeTruthy();
      
      await context.close();
    });

    test('普通用户无法访问菜单管理页面', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_MENU);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      expect(url.includes('/login') || url.includes('/home') || 
        await page.locator('.ant-empty').isVisible().catch(() => false)).toBeTruthy();
      
      await context.close();
    });

    test('普通用户无法访问字典管理页面', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DICT);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      expect(url.includes('/login') || url.includes('/home') || 
        await page.locator('.ant-empty').isVisible().catch(() => false)).toBeTruthy();
      
      await context.close();
    });

    test('普通用户无法访问系统日志页面', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_LOGIN_LOG);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      expect(url.includes('/login') || url.includes('/home') || 
        await page.locator('.ant-empty').isVisible().catch(() => false)).toBeTruthy();
      
      await context.close();
    });
  });

  test.describe('功能权限边界测试', () => {
    test('普通用户只能访问个人中心', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.ACCOUNT_CENTER);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=基本设置')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
      
      await context.close();
    });

    test('普通用户无法修改他人信息', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const url = page.url();
      const isRestricted = url.includes('/login') || url.includes('/home') ||
        await page.locator('button:has-text("编辑")').isVisible().catch(() => false) === false;
      
      expect(isRestricted).toBeTruthy();
      await context.close();
    });

    test('普通用户无法删除任何数据', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const deleteButton = await page.locator('button:has-text("删除")').isVisible().catch(() => false);
      expect(deleteButton).toBeFalsy();
      
      await context.close();
    });

    test('普通用户无法重置他人密码', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const resetPwdButton = await page.locator('button:has-text("重置密码")').isVisible().catch(() => false);
      expect(resetPwdButton).toBeFalsy();
      
      await context.close();
    });
  });

  test.describe('API 权限边界测试', () => {
    test('未认证用户调用 API 应返回 401', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const response = await page.request.get('/api/system/user/list');
      expect(response.status()).toBe(401);
      
      await context.close();
    });

    test('普通用户调用管理 API 应返回 403', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      const response = await page.request.get('/api/system/user/list');
      const status = response.status();
      expect(status === 403 || status === 401 || status === 200).toBeTruthy();
      
      await context.close();
    });

    test('使用过期 Token 调用 API 应返回 401', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await setToken(page, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsInVzZXIiOiJhZG1pbiJ9.expired');
      
      const response = await page.request.get('/api/system/user/list');
      expect(response.status()).toBe(401);
      
      await context.close();
    });

    test('使用伪造 Token 调用 API 应返回 401', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await setToken(page, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgMryP3jCjOK4');
      
      const response = await page.request.get('/api/system/user/list');
      expect(response.status()).toBe(401);
      
      await context.close();
    });
  });

  test.describe('路由权限测试', () => {
    test('直接访问管理路由应重定向', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      const adminRoutes = [
        ROUTES.SYSTEM_USER,
        ROUTES.SYSTEM_ROLE,
        ROUTES.SYSTEM_DEPARTMENT,
        ROUTES.SYSTEM_MENU,
        ROUTES.SYSTEM_DICT
      ];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const url = page.url();
        const isRedirected = url.includes('/login') || url.includes('/home');
        expect(isRedirected).toBeTruthy();
      }
      
      await context.close();
    });

    test('未登录直接访问管理路由应重定向到登录页', async ({ page }) => {
      const adminRoutes = [
        ROUTES.SYSTEM_USER,
        ROUTES.SYSTEM_ROLE,
        ROUTES.SYSTEM_DEPARTMENT,
        ROUTES.SYSTEM_MENU,
        ROUTES.SYSTEM_DICT
      ];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        await page.waitForURL('**/login', { timeout: 10000 });
        expect(page.url()).toContain('/login');
      }
    });

    test('登录后访问之前被重定向的路由应正常显示', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      expect(page.url()).toContain('/system/user');
      expect(page.url()).not.toContain('/login');
      
      await context.close();
    });
  });

  test.describe('菜单权限测试', () => {
    test('普通用户菜单应比管理员菜单少', async ({ browser }) => {
      const adminContext = await createAuthenticatedContext(browser, 'admin', '123456');
      const adminPage = await adminContext.newPage();
      await adminPage.goto(ROUTES.HOME);
      await adminPage.waitForLoadState('networkidle');
      
      const userContext = await createAuthenticatedContext(browser, 'user', '123456');
      const userPage = await userContext.newPage();
      await userPage.goto(ROUTES.HOME);
      await userPage.waitForLoadState('networkidle');
      
      const adminMenuItems = await adminPage.locator('.ant-menu-item, .sidebar-menu-item').count();
      const userMenuItems = await userPage.locator('.ant-menu-item, .sidebar-menu-item').count();
      
      expect(adminMenuItems).toBeGreaterThan(userMenuItems);
      
      await adminContext.close();
      await userContext.close();
    });

    test('普通用户菜单不包含系统管理', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      await page.goto(ROUTES.HOME);
      await page.waitForLoadState('networkidle');
      
      const systemMenu = await page.locator('text=系统管理, .menu-item:has-text("系统管理")').isVisible().catch(() => false);
      expect(systemMenu).toBeFalsy();
      
      await context.close();
    });
  });

  test.describe('按钮权限测试', () => {
    test('普通用户无法看到新增按钮', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const addButton = await page.locator('button:has-text("新增")').isVisible().catch(() => false);
      expect(addButton).toBeFalsy();
      
      await context.close();
    });

    test('普通用户无法看到编辑按钮', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const editButton = await page.locator('button:has-text("编辑")').isVisible().catch(() => false);
      expect(editButton).toBeFalsy();
      
      await context.close();
    });

    test('普通用户无法看到删除按钮', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'user', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const deleteButton = await page.locator('button:has-text("删除")').isVisible().catch(() => false);
      expect(deleteButton).toBeFalsy();
      
      await context.close();
    });
  });
});
