import { test as base, Page, BrowserContext, expect } from '@playwright/test';
import { ROUTES } from '../config/constants';
import { LoginPage } from '../page-objects/auth/LoginPage';

/**
 * 扩展的测试夹具
 * 提供全局可用的页面对象和工具方法
 */
export type TestFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
  adminContext: BrowserContext;
};

// 基础夹具 - 所有测试都应使用此夹具
export const test = base.extend<TestFixtures>({
  // 登录页面对象
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // 预认证的页面（管理员身份）
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 自动登录
    await page.goto(ROUTES.LOGIN);
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    await use(page);
    await context.close();
  },

  // 管理员浏览器上下文
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 登录
    await page.goto(ROUTES.LOGIN);
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
    
    await use(context);
    await context.close();
  }
});

export { expect } from '@playwright/test';
