/**
 * 认证辅助函数
 * 提供登录、登出、Token 管理等工具方法
 */
import { Page, BrowserContext } from '@playwright/test';

/**
 * 执行登录操作
 */
export async function login(
  page: Page, 
  username: string, 
  password: string
): Promise<void> {
  await page.goto('/login');
  await page.fill('input[placeholder="请输入用户名"]', username);
  await page.fill('input[placeholder="请输入密码"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
}

/**
 * 执行登出操作
 */
export async function logout(page: Page): Promise<void> {
  await page.locator('.user-menu, .user-dropdown, text=admin').click();
  await page.locator('text=退出登录').click();
  await page.waitForURL('**/login', { timeout: 5000 });
}

/**
 * 获取当前存储的 Token
 */
export async function getTokens(page: Page): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  return await page.evaluate(() => ({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  }));
}

/**
 * 清除存储的 Token
 */
export async function clearTokens(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  });
}

/**
 * 设置自定义 Token
 */
export async function setToken(page: Page, token: string): Promise<void> {
  await page.evaluate((t) => {
    localStorage.setItem('access_token', t);
  }, token);
}

/**
 * 验证用户已登录
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const { accessToken } = await getTokens(page);
  return accessToken !== null && accessToken.length > 0;
}

/**
 * 等待登录成功
 */
export async function waitForLoginSuccess(page: Page): Promise<void> {
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
}

/**
 * 创建已认证的浏览器上下文
 */
export async function createAuthenticatedContext(
  browser: any,
  username: string,
  password: string
): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await login(page, username, password);
  
  return context;
}

/**
 * 验证用户已登出
 */
export async function isLoggedOut(page: Page): Promise<boolean> {
  const { accessToken } = await getTokens(page);
  return !accessToken || accessToken.length === 0;
}

/**
 * 等待登出完成
 */
export async function waitForLogout(page: Page): Promise<void> {
  await page.waitForURL('**/login', { timeout: 5000 });
}
