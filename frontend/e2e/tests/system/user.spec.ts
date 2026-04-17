import { test, expect } from '../../fixtures/base';
import { generateTestData } from '../../helpers/data';

test.describe('用户管理 E2E 测试', () => {
  test('管理员应能访问用户管理页面', async ({ authenticatedPage: page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    // 验证表格可见
    await expect(page.locator('.ant-table-tbody')).toBeVisible({ timeout: 5000 });
  });

  test('用户列表应正常显示数据', async ({ authenticatedPage: page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    const tableRows = page.locator('.ant-table-tbody tr');
    const rowCount = await tableRows.count();
    
    console.log(`用户列表行数: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('搜索用户功能', async ({ authenticatedPage: page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    // 获取搜索输入框并搜索
    const searchInput = page.locator('input[placeholder*="搜索"], .ant-input-search input').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('admin');
      await page.locator('button:has-text("搜索"), .ant-btn-primary').first().click();
      await page.waitForLoadState('networkidle');
      
      // 验证搜索结果
      const tableRows = page.locator('.ant-table-tbody tr');
      const rowCount = await tableRows.count();
      console.log(`搜索结果行数: ${rowCount}`);
    }
  });

  test('新增用户表单验证', async ({ authenticatedPage: page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    // 点击新增按钮
    await page.locator('button:has-text("新增")').click();
    
    // 等待模态框出现
    await expect(page.locator('.ant-modal, .s-modal')).toBeVisible({ timeout: 5000 });
    
    // 尝试提交空表单
    await page.locator('.ant-modal-footer .ant-btn-primary').click();
    
    // 等待表单验证错误
    await page.waitForTimeout(2000);
    
    // 关闭模态框
    await page.locator('.ant-modal-close, .modal-close').click();
  });

  test('重置搜索功能', async ({ authenticatedPage: page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    // 点击重置按钮
    await page.locator('button:has-text("重置")').click();
    await page.waitForLoadState('networkidle');
    
    // 验证搜索框已清空
    const searchInput = page.locator('input[placeholder*="搜索"], .ant-input-search input').first();
    if (await searchInput.isVisible()) {
      const value = await searchInput.inputValue();
      expect(value).toBe('');
    }
  });

  test('分页功能', async ({ authenticatedPage: page }) => {
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    
    // 验证分页组件存在
    const pagination = page.locator('.ant-pagination');
    await expect(pagination).toBeVisible({ timeout: 5000 });
    
    // 点击下一页（如果有）
    const nextPageButton = page.locator('.ant-pagination-next');
    if (await nextPageButton.isEnabled()) {
      await nextPageButton.click();
      await page.waitForLoadState('networkidle');
    }
  });
});
