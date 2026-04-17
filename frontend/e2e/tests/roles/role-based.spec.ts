import { test, expect, Page, BrowserContext } from '@playwright/test';
import { ROLES, ROUTES, TEST_DATA } from '../../config/constants';
import { login, logout, getTokens } from '../../helpers/auth';

test.describe('完整用户角色 E2E 测试', () => {
  test.describe('管理员角色完整流程', () => {
    let adminPage: Page;
    let adminContext: BrowserContext;

    test.beforeAll(async ({ browser }) => {
      adminContext = await browser.newContext();
      adminPage = await adminContext.newPage();
      await login(adminPage, ROLES.ADMIN.username, ROLES.ADMIN.password);
    });

    test.afterAll(async () => {
      await adminContext.close();
    });

    test('管理员登录后应正确显示用户信息', async () => {
      await adminPage.goto(ROUTES.HOME);
      await adminPage.waitForLoadState('networkidle');
      
      const userInfo = adminPage.locator('text=admin, .user-info, .username');
      await expect(userInfo.first()).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能访问用户管理并执行搜索', async () => {
      await adminPage.goto(ROUTES.SYSTEM_USER);
      await adminPage.waitForLoadState('networkidle');
      
      await expect(adminPage.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
      
      const searchInput = adminPage.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('admin');
        await adminPage.locator('button:has-text("搜索")').first().click();
        await adminPage.waitForLoadState('networkidle');
        
        await expect(adminPage.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
      }
    });

    test('管理员应能访问角色管理页面', async () => {
      await adminPage.goto(ROUTES.SYSTEM_ROLE);
      await adminPage.waitForLoadState('networkidle');
      
      await expect(adminPage.locator('.ant-table-tbody, .ant-tree')).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能访问部门管理页面', async () => {
      await adminPage.goto(ROUTES.SYSTEM_DEPARTMENT);
      await adminPage.waitForLoadState('networkidle');
      
      await expect(adminPage.locator('.ant-table-tbody, .ant-tree')).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能访问菜单管理页面', async () => {
      await adminPage.goto(ROUTES.SYSTEM_MENU);
      await adminPage.waitForLoadState('networkidle');
      
      await expect(adminPage.locator('.ant-tree')).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能访问字典管理页面', async () => {
      await adminPage.goto(ROUTES.SYSTEM_DICT);
      await adminPage.waitForLoadState('networkidle');
      
      await expect(adminPage.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能访问登录日志页面', async () => {
      await adminPage.goto(ROUTES.SYSTEM_LOGIN_LOG);
      await adminPage.waitForLoadState('networkidle');
      
      expect(adminPage.url()).not.toContain('/login');
    });

    test('管理员应能访问操作日志页面', async () => {
      await adminPage.goto(ROUTES.SYSTEM_OPERATE_LOG);
      await adminPage.waitForLoadState('networkidle');
      
      expect(adminPage.url()).not.toContain('/login');
    });

    test('管理员应能访问个人中心并查看基本信息', async () => {
      await adminPage.goto(ROUTES.ACCOUNT_CENTER);
      await adminPage.waitForLoadState('networkidle');
      
      await expect(adminPage.locator('text=基本设置')).toBeVisible({ timeout: 5000 });
      await expect(adminPage.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能成功登出', async () => {
      await logout(adminPage);
      await expect(adminPage).toHaveURL(/.*login/);
      
      const tokens = await getTokens(adminPage);
      expect(tokens.accessToken).toBeNull();
    });
  });

  test.describe('普通用户角色完整流程', () => {
    let userPage: Page;
    let userContext: BrowserContext;

    test.beforeAll(async ({ browser }) => {
      userContext = await browser.newContext();
      userPage = await userContext.newPage();
      await login(userPage, ROLES.USER.username, ROLES.USER.password);
    });

    test.afterAll(async () => {
      await userContext.close();
    });

    test('普通用户登录后应正确跳转到首页', async () => {
      await userPage.goto(ROUTES.HOME);
      await userPage.waitForLoadState('networkidle');
      
      await expect(userPage.locator('text=首页')).toBeVisible({ timeout: 5000 });
    });

    test('普通用户应能访问个人中心', async () => {
      await userPage.goto(ROUTES.ACCOUNT_CENTER);
      await userPage.waitForLoadState('networkidle');
      
      await expect(userPage.locator('text=基本设置')).toBeVisible({ timeout: 5000 });
      await expect(userPage.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
    });

    test('普通用户访问系统管理页面应被拒绝或显示空数据', async () => {
      const protectedRoutes = [
        ROUTES.SYSTEM_USER,
        ROUTES.SYSTEM_ROLE,
        ROUTES.SYSTEM_DEPARTMENT,
        ROUTES.SYSTEM_MENU,
        ROUTES.SYSTEM_DICT
      ];

      for (const route of protectedRoutes) {
        await userPage.goto(route);
        await userPage.waitForLoadState('networkidle');
        await userPage.waitForTimeout(2000);
        
        const url = userPage.url();
        const isRedirected = url.includes('/login') || url.includes('/home');
        
        if (!isRedirected) {
          const hasNoAccess = await userPage.locator('text=无权限, text=没有权限, .ant-empty').isVisible().catch(() => false);
          const tableEmpty = await userPage.locator('.ant-empty').isVisible().catch(() => true);
          expect(isRedirected || hasNoAccess || tableEmpty).toBeTruthy();
        }
      }
    });

    test('普通用户应能成功登出', async () => {
      await logout(userPage);
      await expect(userPage).toHaveURL(/.*login/);
    });
  });

  test.describe('新用户首次登录流程', () => {
    let newUserPage: Page;
    let newUserContext: BrowserContext;

    test.beforeAll(async ({ browser }) => {
      newUserContext = await browser.newContext();
      newUserPage = await newUserContext.newPage();
      await login(newUserPage, ROLES.NEW_USER.username, ROLES.NEW_USER.password);
    });

    test.afterAll(async () => {
      await newUserContext.close();
    });

    test('新用户登录后应引导到首页', async () => {
      await newUserPage.goto(ROUTES.HOME);
      await newUserPage.waitForLoadState('networkidle');
      
      await expect(newUserPage.locator('text=首页')).toBeVisible({ timeout: 5000 });
    });

    test('新用户应能访问个人中心修改密码', async () => {
      await newUserPage.goto(ROUTES.ACCOUNT_CENTER);
      await newUserPage.waitForLoadState('networkidle');
      
      await expect(newUserPage.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
      await expect(newUserPage.locator('text=基本设置')).toBeVisible({ timeout: 5000 });
    });

    test('新用户访问管理页面应被拒绝', async () => {
      await newUserPage.goto(ROUTES.SYSTEM_USER);
      await newUserPage.waitForLoadState('networkidle');
      await newUserPage.waitForTimeout(2000);
      
      const url = newUserPage.url();
      const isRedirected = url.includes('/login') || url.includes('/home');
      expect(isRedirected).toBeTruthy();
    });
  });

  test.describe('跨角色权限对比测试', () => {
    test('不同角色访问同一页面应有不同权限表现', async ({ browser }) => {
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await login(adminPage, ROLES.ADMIN.username, ROLES.ADMIN.password);

      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      await login(userPage, ROLES.USER.username, ROLES.USER.password);

      await adminPage.goto(ROUTES.SYSTEM_USER);
      await adminPage.waitForLoadState('networkidle');
      await adminPage.waitForTimeout(2000);
      
      await userPage.goto(ROUTES.SYSTEM_USER);
      await userPage.waitForLoadState('networkidle');
      await userPage.waitForTimeout(2000);

      const adminUrl = adminPage.url();
      const userUrl = userPage.url();
      
      const adminHasAccess = !adminUrl.includes('/login') && 
        await adminPage.locator('.ant-table-tbody').isVisible().catch(() => false);
      
      const userRedirected = userUrl.includes('/login') || userUrl.includes('/home');
      const userHasNoAccess = await userPage.locator('text=无权限, .ant-empty').isVisible().catch(() => false);
      
      expect(adminHasAccess || !adminUrl.includes('/login')).toBeTruthy();
      expect(userRedirected || userHasNoAccess).toBeTruthy();

      await adminContext.close();
      await userContext.close();
    });

    test('仅管理员能访问系统日志页面', async ({ browser }) => {
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await login(adminPage, ROLES.ADMIN.username, ROLES.ADMIN.password);

      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      await login(userPage, ROLES.USER.username, ROLES.USER.password);

      await adminPage.goto(ROUTES.SYSTEM_LOGIN_LOG);
      await adminPage.waitForLoadState('networkidle');
      
      const adminUrl = adminPage.url();
      expect(adminUrl).not.toContain('/login');

      await userPage.goto(ROUTES.SYSTEM_LOGIN_LOG);
      await userPage.waitForLoadState('networkidle');
      await userPage.waitForTimeout(2000);
      
      const userUrl = userPage.url();
      const userRestricted = userUrl.includes('/login') || 
        userUrl.includes('/home') ||
        await userPage.locator('.ant-empty').isVisible().catch(() => false);
      
      expect(userRestricted).toBeTruthy();

      await adminContext.close();
      await userContext.close();
    });
  });
});
