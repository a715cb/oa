import { test, expect, Page } from '@playwright/test';
import { ROUTES, ERROR_MESSAGES } from '../../config/constants';
import { login, logout, getTokens, clearTokens, setToken } from '../../helpers/auth';

test.describe('认证流程与边界测试', () => {
  test.describe('登录表单验证', () => {
    test('空用户名和密码应显示错误提示', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.click('button[type="submit"]');
      
      const usernameError = page.locator('text=请输入用户名').first();
      const passwordError = page.locator('text=请输入密码').first();
      
      await expect(usernameError).toBeVisible({ timeout: 5000 });
      await expect(passwordError).toBeVisible({ timeout: 5000 });
      expect(page.url()).toContain('/login');
    });

    test('仅输入用户名应显示错误提示', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', 'admin');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=请输入密码').first()).toBeVisible({ timeout: 5000 });
    });

    test('仅输入密码应显示错误提示', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入密码"]', '123456');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=请输入用户名').first()).toBeVisible({ timeout: 5000 });
    });

    test('用户名前后有空格应能正常登录', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', '  admin  ');
      await page.fill('input[placeholder="请输入密码"]', '123456');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
      expect(page.url()).not.toContain('/login');
    });

    test('密码前后有空格应能正常登录', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', 'admin');
      await page.fill('input[placeholder="请输入密码"]', '  123456  ');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
      expect(page.url()).not.toContain('/login');
    });
  });

  test.describe('登录失败场景', () => {
    test('错误密码应拒绝登录', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', 'admin');
      await page.fill('input[placeholder="请输入密码"]', 'wrong_password');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    });

    test('不存在的用户名应拒绝登录', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', 'nonexistent_user');
      await page.fill('input[placeholder="请输入密码"]', '123456');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    });

    test('用户名和密码都错误应拒绝登录', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', 'wrong_user');
      await page.fill('input[placeholder="请输入密码"]', 'wrong_password');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    });

    test('连续登录失败应触发账户锁定', async ({ page }) => {
      await page.goto(ROUTES.LOGIN);
      
      for (let i = 0; i < 11; i++) {
        await page.fill('input[placeholder="请输入用户名"]', 'admin');
        await page.fill('input[placeholder="请输入密码"]', 'wrong_password');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);
      }
      
      await page.waitForTimeout(1000);
      const lockoutMessage = await page.locator(`text=${ERROR_MESSAGES.LOCKOUT}`).isVisible().catch(() => false);
      expect(lockoutMessage).toBeTruthy();
    });
  });

  test.describe('安全注入测试', () => {
    test('SQL 注入尝试应被拒绝', async ({ page }) => {
      const sqlInjections = [
        "' OR '1'='1",
        "' OR 1=1 --",
        "admin' --",
        "'; DROP TABLE users; --"
      ];

      for (const injection of sqlInjections) {
        await page.goto(ROUTES.LOGIN);
        await page.fill('input[placeholder="请输入用户名"]', injection);
        await page.fill('input[placeholder="请输入密码"]', injection);
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/login');
      }
    });

    test('XSS 注入尝试应被拒绝', async ({ page }) => {
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<svg onload=alert(1)>'
      ];

      for (const payload of xssPayloads) {
        await page.goto(ROUTES.LOGIN);
        await page.fill('input[placeholder="请输入用户名"]', payload);
        await page.fill('input[placeholder="请输入密码"]', payload);
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/login');
        
        const pageContent = await page.content();
        expect(pageContent).not.toContain(payload);
      }
    });

    test('超长输入应被安全处理', async ({ page }) => {
      const longInput = 'a'.repeat(10000);
      
      await page.goto(ROUTES.LOGIN);
      await page.fill('input[placeholder="请输入用户名"]', longInput);
      await page.fill('input[placeholder="请输入密码"]', longInput);
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/login');
    });

    test('特殊字符输入应被安全处理', async ({ page }) => {
      const specialChars = [
        '<>&"',
        '\n\r\t',
        '\\x00\\x01',
        '%00%01',
        'admin@#$%^&*()'
      ];

      for (const chars of specialChars) {
        await page.goto(ROUTES.LOGIN);
        await page.fill('input[placeholder="请输入用户名"]', chars);
        await page.fill('input[placeholder="请输入密码"]', chars);
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('/login');
      }
    });
  });

  test.describe('会话管理测试', () => {
    test('已登录用户访问登录页应重定向', async ({ page }) => {
      await login(page, 'admin', '123456');
      
      await page.goto(ROUTES.LOGIN);
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
    });

    test('未登录访问受保护页面应重定向到登录页', async ({ page }) => {
      await clearTokens(page);
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForURL('**/login', { timeout: 10000 });
      
      expect(page.url()).toContain('/login');
    });

    test('刷新页面后登录状态应保持', async ({ page }) => {
      await login(page, 'admin', '123456');
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      expect(page.url()).not.toContain('/login');
    });

    test('多标签页同步登录状态', async ({ browser }) => {
      const context = await browser.newContext();
      const page1 = await context.newPage();
      await login(page1, 'admin', '123456');
      
      await page1.waitForTimeout(1000);
      
      const page2 = await context.newPage();
      await page2.goto(ROUTES.HOME);
      await page2.waitForLoadState('networkidle');
      await page2.waitForTimeout(2000);
      
      expect(page2.url()).not.toContain('/login');
      
      await context.close();
    });

    test('登出后登录状态应清除', async ({ page }) => {
      await login(page, 'admin', '123456');
      await logout(page);
      
      const tokens = await getTokens(page);
      expect(tokens.accessToken).toBeNull();
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Token 安全测试', () => {
    test('登录后应存在 Token', async ({ page }) => {
      await login(page, 'admin', '123456');
      
      const tokens = await getTokens(page);
      expect(tokens.accessToken).not.toBeNull();
      expect(tokens.accessToken!.length).toBeGreaterThan(0);
    });

    test('Token 应为有效的 JWT 格式', async ({ page }) => {
      await login(page, 'admin', '123456');
      
      const tokens = await getTokens(page);
      if (tokens.accessToken) {
        const parts = tokens.accessToken.split('.');
        expect(parts.length).toBe(3);
      }
    });

    test('清除 Token 后访问受保护页面应重定向', async ({ page }) => {
      await login(page, 'admin', '123456');
      await clearTokens(page);
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForURL('**/login', { timeout: 10000 });
      
      expect(page.url()).toContain('/login');
    });

    test('使用伪造 Token 应被拒绝', async ({ page }) => {
      await setToken(page, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgMryP3jCjOK4');
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForTimeout(3000);
      
      expect(page.url()).toContain('/login');
    });

    test('Token 过期后应自动登出', async ({ page }) => {
      await login(page, 'admin', '123456');
      
      await page.evaluate(() => {
        localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsInVzZXIiOiJhZG1pbiJ9.expired');
      });
      
      await page.goto(ROUTES.SYSTEM_USER);
      await page.waitForTimeout(3000);
      
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('多设备登录测试', () => {
    test('同一账户在两个浏览器登录', async ({ browser }) => {
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      await login(page1, 'admin', '123456');
      
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await login(page2, 'admin', '123456');
      
      expect(page1.url()).not.toContain('/login');
      expect(page2.url()).not.toContain('/login');
      
      await context1.close();
      await context2.close();
    });

    test('一个浏览器登出不影响另一个', async ({ browser }) => {
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      await login(page1, 'admin', '123456');
      
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await login(page2, 'admin', '123456');
      
      await logout(page1);
      expect(page1.url()).toContain('/login');
      
      await page2.goto(ROUTES.HOME);
      await page2.waitForLoadState('networkidle');
      expect(page2.url()).not.toContain('/login');
      
      await context1.close();
      await context2.close();
    });
  });

  test.describe('记住我功能测试', () => {
    test('勾选记住我后关闭浏览器应保持登录状态', async ({ browser }) => {
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();
      
      await page1.goto(ROUTES.LOGIN);
      await page1.fill('input[placeholder="请输入用户名"]', 'admin');
      await page1.fill('input[placeholder="请输入密码"]', '123456');
      await page1.locator('.ant-checkbox-wrapper').click();
      await page1.click('button[type="submit"]');
      await page1.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
      
      const storageState = await context1.storageState();
      await context1.close();
      
      const context2 = await browser.newContext({ storageState });
      const page2 = await context2.newPage();
      await page2.goto(ROUTES.HOME);
      await page2.waitForLoadState('networkidle');
      
      expect(page2.url()).not.toContain('/login');
      await context2.close();
    });
  });
});
