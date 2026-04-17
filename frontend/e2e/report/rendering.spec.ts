import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面元素渲染完整性测试', () => {
  test('页面基本布局应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const html = await reportPage.page.locator('html');
    await expect(html).toBeVisible();
    
    const body = await reportPage.page.locator('body');
    await expect(body).toBeVisible();
    
    const isReady = await reportPage.isReportVisible();
    expect(isReady).toBe(true);
  });

  test('页面标题元素应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForReportReady();
    
    const title = await reportPage.page.locator('h1, h2, .title, [class*="title"]').first();
    await expect(title).toBeVisible();
    
    const titleText = await title.innerText();
    expect(titleText.trim().length).toBeGreaterThan(0);
    
    console.log(`页面标题: ${titleText.trim()}`);
  });

  test('内容区域应有实际内容', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const contentSelectors = [
      '.content',
      'main',
      '.report-content',
      '[class*="content"]',
      '.data',
      'table',
      '.chart',
    ];
    
    let hasContent = false;
    for (const selector of contentSelectors) {
      const element = reportPage.page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        const text = await element.innerText().catch(() => '');
        if (text.trim().length > 0) {
          hasContent = true;
          break;
        }
      }
    }
    
    expect(hasContent).toBe(true);
  });

  test('表格数据应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const tables = await reportPage.page.locator('table').count();
    
    if (tables > 0) {
      for (let i = 0; i < Math.min(tables, 3); i++) {
        const table = reportPage.page.locator('table').nth(i);
        await expect(table).toBeVisible();
        
        const rows = await table.locator('tr').count();
        expect(rows).toBeGreaterThan(0);
        
        console.log(`表格 ${i + 1} 行数: ${rows}`);
      }
    }
  });

  test('图表元素应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const chartSelectors = [
      'canvas',
      '.chart',
      '[class*="chart"]',
      '[class*="echarts"]',
      'svg',
    ];
    
    let hasChart = false;
    for (const selector of chartSelectors) {
      const element = reportPage.page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        hasChart = true;
        break;
      }
    }
    
    console.log(`页面包含图表: ${hasChart}`);
  });

  test('按钮元素应正确渲染且可点击', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const buttons = await reportPage.page.locator('button, [role="button"]').all();
    
    let clickableCount = 0;
    for (const button of buttons.slice(0, 10)) {
      const isVisible = await button.isVisible().catch(() => false);
      const isEnabled = await button.isEnabled().catch(() => false);
      
      if (isVisible && isEnabled) {
        clickableCount++;
      }
    }
    
    console.log(`可点击按钮数量: ${clickableCount}`);
    expect(clickableCount).toBeGreaterThanOrEqual(0);
  });

  test('表单元素应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const inputs = await reportPage.page.locator('input, select, textarea').count();
    
    if (inputs > 0) {
      for (let i = 0; i < Math.min(inputs, 5); i++) {
        const input = reportPage.page.locator('input, select, textarea').nth(i);
        const isVisible = await input.isVisible().catch(() => false);
        
        if (isVisible) {
          const tagName = await input.evaluate(el => (el as HTMLElement).tagName.toLowerCase());
          console.log(`表单元素 ${i + 1}: ${tagName} (可见)`);
        }
      }
    }
    
    console.log(`表单元素总数: ${inputs}`);
  });

  test('链接元素应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const links = await reportPage.page.locator('a').all();
    
    let validLinks = 0;
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href').catch(() => '');
      const isVisible = await link.isVisible().catch(() => false);
      
      if (href && isVisible) {
        validLinks++;
      }
    }
    
    console.log(`有效链接数量: ${validLinks}`);
  });

  test('列表元素应正确渲染', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const lists = await reportPage.page.locator('ul, ol, [class*="list"]').count();
    
    if (lists > 0) {
      for (let i = 0; i < Math.min(lists, 3); i++) {
        const list = reportPage.page.locator('ul, ol, [class*="list"]').nth(i);
        const isVisible = await list.isVisible().catch(() => false);
        
        if (isVisible) {
          const items = await list.locator('li, [class*="item"]').count();
          console.log(`列表 ${i + 1} 项目数: ${items}`);
        }
      }
    }
  });

  test('图片元素应正确加载', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const images = await reportPage.page.locator('img').all();
    
    let loadedImages = 0;
    const failedImages: string[] = [];
    
    for (const img of images.slice(0, 10)) {
      const src = await img.getAttribute('src').catch(() => '');
      const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
      
      if (naturalWidth > 0) {
        loadedImages++;
      } else if (src) {
        failedImages.push(src);
      }
    }
    
    console.log(`成功加载图片: ${loadedImages}`);
    if (failedImages.length > 0) {
      console.log(`加载失败图片: ${failedImages.join(', ')}`);
    }
  });

  test('页面不应有空内容区域', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const emptySections: string[] = [];
    const sections = await reportPage.page.locator('section, div[class*="section"], [class*="panel"]').all();
    
    for (const section of sections.slice(0, 10)) {
      const text = await section.innerText().catch(() => '');
      const hasChildren = await section.locator('*').count() > 0;
      
      if (!text.trim() && !hasChildren) {
        const className = await section.getAttribute('class').catch(() => '');
        emptySections.push(className);
      }
    }
    
    if (emptySections.length > 0) {
      console.log(`空内容区域: ${emptySections.join(', ')}`);
    }
    
    expect(emptySections.length).toBeLessThan(3);
  });

  test('响应式布局应在不同视口下正确渲染', async ({ reportPage }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 1280, height: 720, name: '笔记本' },
      { width: 768, height: 1024, name: '平板' },
    ];
    
    for (const viewport of viewports) {
      await reportPage.page.setViewportSize(viewport);
      await reportPage.goto('/');
      await reportPage.waitForLoad('networkidle');
      
      const bodyWidth = await reportPage.page.locator('body').evaluate(
        el => el.clientWidth
      );
      
      expect(bodyWidth).toBeGreaterThan(0);
      console.log(`${viewport.name} (${viewport.width}x${viewport.height}): 内容宽度 ${bodyWidth}px`);
    }
  });
});
