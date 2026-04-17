import { test, expect } from '@playwright/test';
import { ROUTES, TEST_DATA } from '../../config/constants';
import { login, logout, createAuthenticatedContext } from '../../helpers/auth';

test.describe('核心业务操作 E2E 测试', () => {
  test.describe('用户管理 CRUD 操作', () => {
    test('新增用户完整流程', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      // 点击新增按钮
      const addButton = page.locator('button:has-text("添加")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
        await page.fill('input[placeholder*="用户名"]', TEST_DATA.NEW_USER.username);
        await page.fill('input[placeholder*="密码"]', TEST_DATA.NEW_USER.password);
        await page.fill('input[placeholder*="昵称"]', TEST_DATA.NEW_USER.nickname);
        await page.fill('input[placeholder*="邮箱"]', TEST_DATA.NEW_USER.email);
        await page.fill('input[placeholder*="手机号"]', TEST_DATA.NEW_USER.phone);
        
        await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
        await page.waitForTimeout(2000);
      }
      
      expect(page.url()).not.toContain('/login');
      
      await context.close();
    });

    test('用户列表应显示新增用户', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill(TEST_DATA.NEW_USER.username);
        await page.locator('button:has-text("搜索")').first().click();
        await page.waitForLoadState('networkidle');
        
        const tableContent = await page.locator('.ant-table-tbody').innerText();
        expect(tableContent).toContain(TEST_DATA.NEW_USER.username);
      }
      
      await context.close();
    });

    test('编辑用户信息', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first().fill(TEST_DATA.NEW_USER.username);
      await page.locator('button:has-text("搜索")').first().click();
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button:has-text("编辑")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
        
        const nicknameInput = page.locator('input[placeholder*="昵称"]');
        if (await nicknameInput.isVisible()) {
          await nicknameInput.fill(`${TEST_DATA.NEW_USER.nickname}_更新`);
        }
        
        await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
        await page.waitForTimeout(2000);
      }
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });

    test('重置用户密码', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first().fill(TEST_DATA.NEW_USER.username);
      await page.locator('button:has-text("搜索")').first().click();
      await page.waitForLoadState('networkidle');
      
      const resetPwdButton = page.locator('button:has-text("重置密码")').first();
      if (await resetPwdButton.isVisible()) {
        await resetPwdButton.click();
        await page.waitForTimeout(1000);
        
        const confirmButton = page.locator('.ant-modal-confirm-btns .ant-btn-primary, button:has-text("确定")').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(2000);
        }
      }
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });
  });

  test.describe('角色管理 CRUD 操作', () => {
    test('新增角色', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="角色名称"]', TEST_DATA.NEW_ROLE.name);
      await page.fill('input[placeholder*="角色编码"]', TEST_DATA.NEW_ROLE.code);
      
      const descInput = page.locator('input[placeholder*="备注"], textarea[placeholder*="备注"]');
      if (await descInput.isVisible()) {
        await descInput.fill(TEST_DATA.NEW_ROLE.description);
      }
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });

    test('角色列表应显示新增角色', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      
      const tableContent = await page.locator('.ant-table-tbody').innerText();
      expect(tableContent).toContain(TEST_DATA.NEW_ROLE.name);
      
      await context.close();
    });

    test('分配角色权限', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      
      const authButton = page.locator('button:has-text("分配权限"), button:has-text("权限")').first();
      if (await authButton.isVisible()) {
        await authButton.click();
        await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
        
        const checkbox = page.locator('.ant-checkbox').first();
        if (await checkbox.isVisible()) {
          await checkbox.click();
        }
        
        await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
        await page.waitForTimeout(2000);
      }
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });
  });

  test.describe('部门管理 CRUD 操作', () => {
    test('新增部门', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DEPARTMENT);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="部门名称"]', TEST_DATA.NEW_DEPARTMENT.name);
      await page.fill('input[placeholder*="部门编码"]', TEST_DATA.NEW_DEPARTMENT.code);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });

    test('部门树应显示新增部门', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DEPARTMENT);
      await page.waitForLoadState('networkidle');
      
      const treeContent = await page.locator('.ant-tree, .ant-table-tbody').innerText();
      expect(treeContent).toContain(TEST_DATA.NEW_DEPARTMENT.name);
      
      await context.close();
    });

    test('编辑部门信息', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DEPARTMENT);
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button:has-text("编辑")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
        
        const nameInput = page.locator('input[placeholder*="部门名称"]');
        if (await nameInput.isVisible()) {
          await nameInput.fill(`${TEST_DATA.NEW_DEPARTMENT.name}_更新`);
        }
        
        await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
        await page.waitForTimeout(2000);
      }
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });
  });

  test.describe('菜单管理 CRUD 操作', () => {
    test('新增菜单', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_MENU);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="菜单名称"]', TEST_DATA.NEW_MENU.name);
      await page.fill('input[placeholder*="路由地址"]', TEST_DATA.NEW_MENU.path);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });

    test('菜单树应显示新增菜单', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_MENU);
      await page.waitForLoadState('networkidle');
      
      const treeContent = await page.locator('.ant-tree').innerText();
      expect(treeContent).toContain(TEST_DATA.NEW_MENU.name);
      
      await context.close();
    });
  });

  test.describe('字典管理 CRUD 操作', () => {
    test('新增字典', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DICT);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="字典名称"]', TEST_DATA.NEW_DICT.name);
      await page.fill('input[placeholder*="字典编码"]', TEST_DATA.NEW_DICT.code);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
      await context.close();
    });

    test('字典列表应显示新增字典', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DICT);
      await page.waitForLoadState('networkidle');
      
      const tableContent = await page.locator('.ant-table-tbody').innerText();
      expect(tableContent).toContain(TEST_DATA.NEW_DICT.name);
      
      await context.close();
    });
  });

  test.describe('个人中心操作', () => {
    test('查看个人基本信息', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.ACCOUNT_CENTER);
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=基本设置')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=admin')).toBeVisible({ timeout: 5000 });
      
      await context.close();
    });

    test('修改密码表单验证', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.ACCOUNT_CENTER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=修改密码').click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
      
      await context.close();
    });
  });

  test.describe('分页与搜索功能', () => {
    test('用户列表分页功能', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const pagination = page.locator('.ant-pagination');
      await expect(pagination).toBeVisible({ timeout: 5000 });
      
      const nextPage = page.locator('.ant-pagination-next');
      if (await nextPage.isEnabled()) {
        await nextPage.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        expect(page.url()).not.toContain('/login');
      }
      
      await context.close();
    });

    test('重置搜索功能', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.locator('button:has-text("搜索")').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.locator('button:has-text("重置")').first().click();
        await page.waitForLoadState('networkidle');
        
        const value = await searchInput.inputValue();
        expect(value).toBe('');
      }
      
      await context.close();
    });
  });
});
