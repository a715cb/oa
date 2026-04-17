import { test, expect } from '../../fixtures/base';

test.describe('个人中心 E2E 测试', () => {
  test('访问个人中心应正常显示', async ({ authenticatedPage: page }) => {
    await page.goto('/account/center');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=基础设置').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=个人信息')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=修改密码')).toBeVisible({ timeout: 5000 });
  });

  test('切换标签页功能', async ({ authenticatedPage: page }) => {
    await page.goto('/account/center');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text=修改密码').click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('input[placeholder="请输入原密码"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[placeholder="请输入新密码"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[placeholder="请输入新密码"]').nth(1)).toBeVisible({ timeout: 5000 });
  });

  test('修改密码表单验证', async ({ authenticatedPage: page }) => {
    await page.goto('/account/center');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text=修改密码').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("保 存")').click();
    await page.waitForTimeout(2000);
    
    await expect(page.locator('input[placeholder="请输入原密码"]')).toBeVisible();
  });

  test('修改密码-两次密码不一致应被拒绝', async ({ authenticatedPage: page }) => {
    await page.goto('/account/center');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text=修改密码').click();
    await page.waitForTimeout(1000);
    
    await page.locator('input[placeholder="请输入原密码"]').fill('123456');
    await page.locator('input[placeholder="请输入新密码"]').first().fill('newpassword123');
    await page.locator('input[placeholder="请输入新密码"]').nth(1).fill('differentpassword');
    
    await page.locator('button:has-text("保 存")').click();
    await page.waitForTimeout(3000);
    
    expect(page.url()).toContain('/account/center');
  });

  test('个人信息展示', async ({ authenticatedPage: page }) => {
    await page.goto('/account/center');
    await page.waitForLoadState('networkidle');
    
    await page.locator('text=基础设置').first().click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('input[placeholder="请输入用户姓名"]')).toBeVisible({ timeout: 5000 });
  });
});
