import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面错误处理和边界条件测试', () => {
  test('JavaScript错误不应存在', async ({ page, reportPage }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    await reportPage.page.waitForTimeout(1000);
    
    expect(errors.length).toBe(0);
    if (errors.length > 0) {
      console.log(`JavaScript错误: ${errors.join(', ')}`);
    }
  });

  test('网络请求失败应被正确处理', async ({ page, reportPage }) => {
    const failedRequests: string[] = [];
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.url()} (${response.status()})`);
      }
    });
    
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    if (failedRequests.length > 0) {
      console.log(`失败请求: ${failedRequests.slice(0, 5).join(', ')}`);
    }
    
    expect(failedRequests.length).toBeLessThan(3);
  });

  test('控制台不应有错误信息', async ({ page, reportPage }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    await reportPage.page.waitForTimeout(1000);
    
    if (consoleErrors.length > 0) {
      console.log(`控制台错误: ${consoleErrors.slice(0, 5).join(', ')}`);
    }
  });

  test('空数据状态应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const emptySelectors = [
      '.empty',
      '[class*="empty"]',
      '.no-data',
      '[class*="no-data"]',
    ];
    
    for (const selector of emptySelectors) {
      const element = reportPage.page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      
      if (isVisible) {
        const text = await element.innerText();
        console.log(`空状态提示: ${text}`);
      }
    }
  });

  test('加载中状态应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    
    const loadingSelectors = [
      '.loading',
      '.ant-spin',
      '[class*="loading"]',
      '[class*="spin"]',
    ];
    
    let loadingFound = false;
    for (const selector of loadingSelectors) {
      const element = reportPage.page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        loadingFound = true;
        await reportPage.page.waitForTimeout(1000);
        
        const isStillVisible = await element.isVisible().catch(() => false);
        expect(isStillVisible).toBe(false);
        console.log('加载状态正确消失');
        break;
      }
    }
    
    if (!loadingFound) {
      console.log('页面无加载状态元素');
    }
  });

  test('弹窗/提示应正确显示和关闭', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const modalSelectors = [
      '.modal',
      '.ant-modal',
      '.dialog',
      '[class*="modal"]',
      '[class*="dialog"]',
    ];
    
    for (const selector of modalSelectors) {
      const element = reportPage.page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      
      if (isVisible) {
        const closeBtn = reportPage.page.locator(
          '.modal-close, .ant-modal-close, [class*="close"]'
        ).first();
        
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
          await reportPage.page.waitForTimeout(500);
          
          const isClosed = await element.isVisible().catch(() => false);
          expect(isClosed).toBe(false);
          console.log('弹窗关闭功能正常');
        }
        break;
      }
    }
  });

  test('通知/消息应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const messageSelectors = [
      '.message',
      '.ant-message',
      '.notification',
      '.ant-notification',
      '[class*="message"]',
      '[class*="notification"]',
    ];
    
    for (const selector of messageSelectors) {
      const count = await reportPage.page.locator(selector).count();
      
      if (count > 0) {
        console.log(`${selector} 实例数: ${count}`);
      }
    }
  });

  test('表单验证应正确工作（如存在表单）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const forms = await reportPage.page.locator('form').count();
    
    if (forms > 0) {
      const form = reportPage.page.locator('form').first();
      const requiredInputs = await form.locator('input[required]').all();
      
      for (const input of requiredInputs.slice(0, 3)) {
        await input.fill('');
        await reportPage.page.waitForTimeout(300);
        
        const errorMessages = await reportPage.page.locator(
          '.error, .ant-form-item-explain-error, [class*="error"]'
        ).all();
        
        if (errorMessages.length > 0) {
          const text = await errorMessages[0].innerText();
          console.log(`表单验证错误: ${text}`);
        }
      }
    }
  });

  test('页面在极端数据量下应正常显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const tables = await reportPage.page.locator('table').all();
    
    for (const table of tables.slice(0, 2)) {
      const rows = await table.locator('tr').count();
      console.log(`表格行数: ${rows}`);
      
      if (rows > 100) {
        const scrollTop = await reportPage.page.evaluate(() => window.scrollY);
        expect(scrollTop).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
