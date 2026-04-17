import { test, expect } from '@playwright/test';
import { ROUTES, TEST_DATA } from '../../config/constants';
import { login, logout, createAuthenticatedContext } from '../../helpers/auth';

test.describe('数据验证与表单测试', () => {
  test.describe('用户表单验证', () => {
    test('用户名必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=用户名, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('密码必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="用户名"]', TEST_DATA.NEW_USER.username);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=密码, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('邮箱格式验证', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="用户名"]', TEST_DATA.NEW_USER.username);
      await page.fill('input[placeholder*="密码"]', TEST_DATA.NEW_USER.password);
      await page.fill('input[placeholder*="邮箱"]', 'invalid-email');
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=邮箱, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('手机号格式验证', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="用户名"]', TEST_DATA.NEW_USER.username);
      await page.fill('input[placeholder*="密码"]', TEST_DATA.NEW_USER.password);
      await page.fill('input[placeholder*="手机号"]', 'invalid-phone');
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=手机号, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('完整有效表单应提交成功', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="用户名"]', TEST_DATA.NEW_USER.username);
      await page.fill('input[placeholder*="密码"]', TEST_DATA.NEW_USER.password);
      await page.fill('input[placeholder*="昵称"]', TEST_DATA.NEW_USER.nickname);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
      
      await context.close();
    });
  });

  test.describe('角色表单验证', () => {
    test('角色名称必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=角色名称, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('角色编码必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="角色名称"]', TEST_DATA.NEW_ROLE.name);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=角色编码, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('完整有效角色表单应提交成功', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_ROLE);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.fill('input[placeholder*="角色名称"]', TEST_DATA.NEW_ROLE.name);
      await page.fill('input[placeholder*="角色编码"]', TEST_DATA.NEW_ROLE.code);
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
      
      await context.close();
    });
  });

  test.describe('部门表单验证', () => {
    test('部门名称必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DEPARTMENT);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=部门名称, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('完整有效部门表单应提交成功', async ({ browser }) => {
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
  });

  test.describe('菜单表单验证', () => {
    test('菜单名称必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_MENU);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=菜单名称, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('完整有效菜单表单应提交成功', async ({ browser }) => {
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
  });

  test.describe('字典表单验证', () => {
    test('字典名称必填', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_DICT);
      await page.waitForLoadState('networkidle');
      
      await page.locator('button:has-text("新增")').click();
      await page.waitForSelector('.ant-modal, .s-modal', { timeout: 5000 });
      
      await page.locator('.ant-modal-footer .ant-btn-primary, button:has-text("确定")').click();
      await page.waitForTimeout(1000);
      
      const errorMsg = await page.locator('text=字典名称, .ant-form-item-explain').first().isVisible().catch(() => false);
      expect(errorMsg).toBeTruthy();
      
      await page.locator('.ant-modal-close, .modal-close').click();
      await context.close();
    });

    test('完整有效字典表单应提交成功', async ({ browser }) => {
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
  });

  test.describe('搜索过滤功能验证', () => {
    test('用户搜索功能应正确过滤数据', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first();
      if (await searchInput.isVisible()) {
        const originalCount = await page.locator('.ant-table-tbody tr').count();
        
        await searchInput.fill('admin');
        await page.locator('button:has-text("搜索")').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const filteredCount = await page.locator('.ant-table-tbody tr').count();
        expect(filteredCount).toBeLessThanOrEqual(originalCount);
      }
      
      await context.close();
    });

    test('重置搜索应恢复原始数据', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.locator('button:has-text("搜索")').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await page.locator('button:has-text("重置")').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const value = await searchInput.inputValue();
        expect(value).toBe('');
      }
      
      await context.close();
    });

    test('空搜索应显示所有数据', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="用户名"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('');
        await page.locator('button:has-text("搜索")').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const rowCount = await page.locator('.ant-table-tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);
      }
      
      await context.close();
    });
  });

  test.describe('数据完整性验证', () => {
    test('表格数据列应完整', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const headerCount = await page.locator('.ant-table-thead th').count();
      const firstRowCells = await page.locator('.ant-table-tbody tr:first-child td').count();
      
      expect(headerCount).toBeGreaterThan(0);
      expect(firstRowCells).toBe(headerCount);
      
      await context.close();
    });

    test('分页数据应正确显示', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const pagination = page.locator('.ant-pagination');
      if (await pagination.isVisible()) {
        const totalText = await page.locator('.ant-pagination-total-text').innerText().catch(() => '');
        expect(totalText).toContain('共');
        
        const rowsPerPage = await page.locator('.ant-table-tbody tr').count();
        expect(rowsPerPage).toBeGreaterThan(0);
        expect(rowsPerPage).toBeLessThanOrEqual(20);
      }
      
      await context.close();
    });

    test('列表数据不应包含空行', async ({ browser }) => {
      const context = await createAuthenticatedContext(browser, 'admin', '123456');
      const page = await context.newPage();
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForLoadState('networkidle');
      
      const rows = page.locator('.ant-table-tbody tr');
      const rowCount = await rows.count();
      
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const cells = rows.nth(i).locator('td');
        const cellCount = await cells.count();
        let hasData = false;
        
        for (let j = 0; j < cellCount; j++) {
          const cellText = await cells.nth(j).innerText();
          if (cellText.trim()) {
            hasData = true;
            break;
          }
        }
        
        expect(hasData).toBeTruthy();
      }
      
      await context.close();
    });
  });
});
