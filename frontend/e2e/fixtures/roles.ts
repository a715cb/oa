import { test as base, BrowserContext, expect } from '@playwright/test';
import { ROUTES, ROLES } from '../config/constants';

/**
 * 角色类型定义
 */
export type UserRole = 'admin' | 'user' | 'new_user';

/**
 * 角色夹具
 * 提供不同用户角色的测试上下文
 */
export type RoleFixtures = {
  adminContext: BrowserContext;
  userContext: BrowserContext;
  newContext: BrowserContext;
  contextForRole: (role: UserRole) => Promise<BrowserContext>;
};

// 创建指定角色的上下文
async function createRoleContext(
  browser: any,
  role: typeof ROLES[keyof typeof ROLES]
): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 导航到登录页
  await page.goto(ROUTES.LOGIN);
  await page.waitForLoadState('networkidle');
  
  // 填写登录表单
  await page.fill('input[placeholder="请输入用户名"]', role.username);
  await page.fill('input[placeholder="请输入密码"]', role.password);
  
  // 点击登录按钮
  await page.click('button[type="submit"]');
  
  // 等待登录成功（URL 变化）
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
  
  // 验证登录成功
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('/login');
  
  return context;
}

export const test = base.extend<RoleFixtures>({
  // 管理员上下文
  adminContext: async ({ browser }, use) => {
    const context = await createRoleContext(browser, ROLES.ADMIN);
    await use(context);
    await context.close();
  },

  // 普通用户上下文
  userContext: async ({ browser }, use) => {
    const context = await createRoleContext(browser, ROLES.USER);
    await use(context);
    await context.close();
  },

  // 新用户上下文
  newContext: async ({ browser }, use) => {
    const context = await createRoleContext(browser, ROLES.NEW_USER);
    await use(context);
    await context.close();
  },

  // 动态创建角色上下文
  contextForRole: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];
    
    const create = async (role: UserRole): Promise<BrowserContext> => {
      const roleMap = {
        admin: ROLES.ADMIN,
        user: ROLES.USER,
        new_user: ROLES.NEW_USER
      };
      const context = await createRoleContext(browser, roleMap[role]);
      contexts.push(context);
      return context;
    };
    
    await use(create);
    
    // 清理所有创建的上下文
    for (const ctx of contexts) {
      await ctx.close();
    }
  }
});

export { expect } from '@playwright/test';
