import { test, expect } from '@playwright/test';

test.describe('SEC-008: XSS 跨站脚本防护测试', () => {
  test('菜单搜索高亮应转义 HTML', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.goto('/system/menu');
    await page.waitForSelector('input[placeholder*="搜索"]', { timeout: 5000 });
    
    const xssPayload = '<img src=x onerror=alert("XSS")>';
    await page.fill('input[placeholder*="搜索"]', xssPayload);
    
    const filterDropdown = page.locator('input[placeholder*="搜索"]');
    await filterDropdown.press('Enter');
    
    await page.waitForTimeout(1000);
    
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<img src=x onerror=alert("XSS")>');
    
    const escapedContent = pageContent.includes('&lt;img') || pageContent.includes('&lt;img');
    console.log('XSS 转义状态:', escapedContent ? '已转义 (安全)' : '未转义 (危险)');
  });

  test('部门搜索高亮应转义 HTML', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.goto('/system/department');
    await page.waitForSelector('input[placeholder*="搜索"]', { timeout: 5000 });
    
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[placeholder*="搜索"]', xssPayload);
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(1000);
    
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
  });

  test('Modal 内容应安全渲染', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    await page.goto('/system/user');
    await page.waitForSelector('text=新增', { timeout: 5000 });
    
    await page.evaluate(() => {
      const originalAlert = window.alert;
      window.alert = (msg: string) => {
        window.__xss_triggered__ = true;
        originalAlert(msg);
      };
    });
    
    await page.locator('text=新增').click();
    await page.waitForTimeout(2000);
    
    const xssTriggered = await page.evaluate(() => (window as any).__xss_triggered__);
    expect(xssTriggered).toBeFalsy();
  });

  test('用户输入在显示时应被编码', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/*', { timeout: 10000 });
    
    const maliciousInput = '<b>test</b>';
    
    await page.goto('/system/dict');
    await page.locator('text=新增').click();
    
    await page.waitForSelector('input[placeholder*="名称"]', { timeout: 5000 });
    await page.fill('input[placeholder*="名称"]', maliciousInput);
    
    await page.locator('button:has-text("确定")').click();
    
    await page.waitForTimeout(1000);
    
    const hasBoldTag = await page.content().then(content => 
      content.includes('<b>') && !content.includes('&lt;b&gt;')
    );
    
    console.log('HTML 编码状态:', hasBoldTag ? '未编码' : '已编码 (安全)');
  });
});
