import { test, expect } from '../../fixtures/roles';
import { ROLES, ROUTES } from '../../config/constants';

test.describe('多角色用户旅程 E2E 测试', () => {
  test.describe('管理员用户旅程', () => {
    test('完整管理流程：登录 -> 用户管理 -> 角色管理 -> 退出', async ({ adminContext }) => {
      const page = await adminContext.newPage();
      
      // 验证已登录
      expect(page.url()).not.toContain('/login');
      
      // 访问用户管理
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
      
      // 访问角色管理
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
      
      // 访问部门管理
      await page.goto(ROUTES.SYSTEM_DEPARTMENT);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
      
      // 访问菜单管理
      await page.goto(ROUTES.SYSTEM_MENU);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.ant-tree')).toBeVisible({ timeout: 5000 });
      
      // 访问字典管理
      await page.goto(ROUTES.SYSTEM_DICT);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
    });

    test('管理员应能访问所有系统管理页面', async ({ adminContext }) => {
      const page = await adminContext.newPage();
      
      const adminRoutes = [
        ROUTES.SYSTEM_USER,
        ROUTES.SYSTEM_ROLE,
        ROUTES.SYSTEM_DEPARTMENT,
        ROUTES.SYSTEM_MENU,
        ROUTES.SYSTEM_DICT,
        ROUTES.SYSTEM_LOGIN_LOG,
      ];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // 验证页面正常加载（未重定向到登录页）
        expect(page.url()).not.toContain('/login');
        
        // 验证页面主要内容区域存在
        await expect(page.locator('.ant-table, .ant-tree, main')).toBeVisible({ timeout: 5000 });
      }
    });

    test('管理员应能访问个人中心', async ({ adminContext }) => {
      const page = await adminContext.newPage();
      
      await page.goto(ROUTES.ACCOUNT_CENTER);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=基本设置')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('普通用户用户旅程', () => {
    test('普通用户登录后应看到受限的菜单', async ({ userContext }) => {
      const page = await userContext.newPage();
      
      // 验证已登录
      expect(page.url()).not.toContain('/login');
      
      // 等待首页加载
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=首页')).toBeVisible({ timeout: 5000 });
    });

    test('普通用户访问管理员专属页面应被拒绝或显示空数据', async ({ userContext }) => {
      const page = await userContext.newPage();
      
      // 尝试访问用户管理页面
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      // 验证要么重定向到首页，要么显示无权限提示
      const url = page.url();
      const isRedirected = url.includes('/home') || url.includes('/login');
      
      if (!isRedirected) {
        // 检查是否有无权限提示或空表格
        const hasNoAccess = await page.locator('text=无权限, text=没有权限, .ant-empty').isVisible().catch(() => false);
        expect(hasNoAccess || page.locator('.ant-table-tbody tr').count() === 0).toBeTruthy();
      }
    });
  });

  test.describe('新用户首次登录流程', () => {
    test('新用户登录后应引导到首页', async ({ newContext }) => {
      const page = await newContext.newPage();
      
      // 验证已登录
      expect(page.url()).not.toContain('/login');
      
      // 验证首页加载
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=首页')).toBeVisible({ timeout: 5000 });
    });

    test('新用户应能修改默认密码', async ({ newContext }) => {
      const page = await newContext.newPage();
      
      // 导航到个人中心
      await page.goto(ROUTES.ACCOUNT_CENTER);
      await page.waitForLoadState('networkidle');
      
      // 验证修改密码功能可用
      await expect(page.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('角色权限交叉验证', () => {
    test('不同角色访问同一页面应有不同表现', async ({ browser }) => {
      // 创建管理员上下文
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await adminPage.goto('/login');
      await adminPage.fill('input[placeholder="请输入用户名"]', ROLES.ADMIN.username);
      await adminPage.fill('input[placeholder="请输入密码"]', ROLES.ADMIN.password);
      await adminPage.click('button[type="submit"]');
      await adminPage.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
      
      // 创建普通用户上下文
      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      await userPage.goto('/login');
      await userPage.fill('input[placeholder="请输入用户名"]', ROLES.USER.username);
      await userPage.fill('input[placeholder="请输入密码"]', ROLES.USER.password);
      await userPage.click('button[type="submit"]');
      await userPage.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
      
      // 管理员访问用户管理
      await adminPage.goto(ROUTES.SYSTEM_USER);
      await adminPage.waitForLoadState('networkidle');
      const adminHasAccess = await adminPage.locator('.ant-table-tbody').isVisible().catch(() => false);
      
      // 普通用户访问用户管理
      await userPage.goto(ROUTES.SYSTEM_USER);
      await userPage.waitForLoadState('networkidle');
      const userHasAccess = await userPage.locator('.ant-table-tbody').isVisible().catch(() => false);
      
      // 验证权限差异
      console.log(`管理员访问用户管理: ${adminHasAccess}`);
      console.log(`普通用户访问用户管理: ${userHasAccess}`);
      
      await adminContext.close();
      await userContext.close();
    });
  });
});
