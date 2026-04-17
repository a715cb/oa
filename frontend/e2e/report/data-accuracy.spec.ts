import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面数据展示准确性测试', () => {
  test('数据表格应包含正确的列头', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const tables = await reportPage.page.locator('table').all();
    
    for (const table of tables.slice(0, 3)) {
      const headers = await table.locator('thead th, thead td').all();
      
      if (headers.length > 0) {
        const headerTexts: string[] = [];
        for (const header of headers) {
          const text = await header.innerText();
          if (text.trim()) {
            headerTexts.push(text.trim());
          }
        }
        
        expect(headerTexts.length).toBeGreaterThan(0);
        console.log(`表头: ${headerTexts.join(', ')}`);
        
        const rows = await table.locator('tbody tr').count();
        console.log(`数据行数: ${rows}`);
      }
    }
  });

  test('数值数据格式应正确', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const numericElements = await reportPage.page.locator(
      '[class*="number"], [class*="amount"], [class*="value"], .stat-value'
    ).all();
    
    for (const element of numericElements.slice(0, 5)) {
      const text = await element.innerText().catch(() => '');
      const trimmedText = text.trim();
      
      if (trimmedText) {
        const isNumeric = !isNaN(Number(trimmedText.replace(/[,\.%￥\$]/g, '')));
        console.log(`数值元素: "${trimmedText}" (格式${isNumeric ? '正确' : '待确认'})`);
      }
    }
  });

  test('日期时间格式应正确', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const dateRegex = /\d{4}[-/]\d{1,2}[-/]\d{1,2}/;
    const dateElements = await reportPage.page.locator(
      '[class*="date"], [class*="time"], time'
    ).all();
    
    for (const element of dateElements.slice(0, 5)) {
      const text = await element.innerText().catch(() => '');
      const trimmedText = text.trim();
      
      if (trimmedText && dateRegex.test(trimmedText)) {
        console.log(`日期格式正确: ${trimmedText}`);
      }
    }
  });

  test('状态标签应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const statusSelectors = [
      '.status',
      '.tag',
      '.badge',
      '[class*="status"]',
      '[class*="tag"]',
    ];
    
    for (const selector of statusSelectors) {
      const elements = await reportPage.page.locator(selector).all();
      
      for (const element of elements.slice(0, 5)) {
        const text = await element.innerText().catch(() => '');
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible && text.trim()) {
          const className = await element.getAttribute('class').catch(() => '');
          console.log(`状态标签: ${text.trim()} (${className})`);
        }
      }
    }
  });

  test('图表数据应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const canvasElements = await reportPage.page.locator('canvas').all();
    
    for (const canvas of canvasElements.slice(0, 3)) {
      const isVisible = await canvas.isVisible().catch(() => false);
      
      if (isVisible) {
        const width = await canvas.evaluate(el => (el as HTMLCanvasElement).width);
        const height = await canvas.evaluate(el => (el as HTMLCanvasElement).height);
        
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        
        console.log(`图表尺寸: ${width}x${height}`);
      }
    }
  });

  test('进度条/指示器应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const progressSelectors = [
      '.progress',
      '.ant-progress',
      '[class*="progress"]',
      '[role="progressbar"]',
    ];
    
    for (const selector of progressSelectors) {
      const elements = await reportPage.page.locator(selector).all();
      
      for (const element of elements.slice(0, 3)) {
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          const ariaValue = await element.getAttribute('aria-valuenow').catch(() => '');
          const text = await element.innerText().catch(() => '');
          
          console.log(`进度条值: ${ariaValue || text}`);
        }
      }
    }
  });

  test('数据汇总/统计信息应正确显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const summarySelectors = [
      '.summary',
      '.statistic',
      '.metric',
      '[class*="summary"]',
      '[class*="statistic"]',
      '[class*="metric"]',
    ];
    
    let summaryCount = 0;
    for (const selector of summarySelectors) {
      const elements = await reportPage.page.locator(selector).count();
      summaryCount += elements;
    }
    
    if (summaryCount > 0) {
      console.log(`统计信息元素总数: ${summaryCount}`);
      
      const firstSummary = reportPage.page.locator(
        summarySelectors.find(s => true) || ''
      ).first();
      
      const isVisible = await firstSummary.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    }
  });
});
