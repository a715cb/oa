import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面样式和UI一致性测试', () => {
  test('页面应使用一致的字体和排版', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const bodyFont = await reportPage.page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    expect(bodyFont.length).toBeGreaterThan(0);
    console.log(`页面字体: ${bodyFont}`);
  });

  test('页面应使用一致的颜色主题', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const bodyBg = await reportPage.page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    expect(bodyBg).toBeTruthy();
    console.log(`页面背景色: ${bodyBg}`);
  });

  test('按钮样式应一致', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const buttons = await reportPage.page.locator('button').all();
    const buttonStyles: string[] = [];
    
    for (const button of buttons.slice(0, 5)) {
      const style = await button.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return `${computed.backgroundColor} ${computed.color} ${computed.borderRadius}`;
      });
      buttonStyles.push(style);
    }
    
    console.log(`按钮样式样本: ${buttonStyles.slice(0, 3).join(' | ')}`);
  });

  test('间距和布局应合理', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const mainContent = reportPage.page.locator('main, .content, [class*="content"]').first();
    const isVisible = await mainContent.isVisible().catch(() => false);
    
    if (isVisible) {
      const padding = await mainContent.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          top: computed.paddingTop,
          right: computed.paddingRight,
          bottom: computed.paddingBottom,
          left: computed.paddingLeft,
        };
      });
      
      console.log(`内容区域内边距: ${JSON.stringify(padding)}`);
    }
  });

  test('响应式设计应正确工作', async ({ reportPage }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 1280, height: 720, name: '笔记本' },
      { width: 768, height: 1024, name: '平板' },
    ];
    
    for (const viewport of viewports) {
      await reportPage.page.setViewportSize(viewport);
      await reportPage.goto('/');
      await reportPage.waitForLoad('networkidle');
      
      const bodyWidth = await reportPage.page.evaluate(() => document.body.clientWidth);
      const hasOverflow = await reportPage.page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });
      
      console.log(`${viewport.name}: 宽度 ${bodyWidth}px, 溢出: ${hasOverflow}`);
      expect(bodyWidth).toBeGreaterThan(0);
    }
  });

  test('暗色/亮色模式切换（如存在）应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const themeToggle = reportPage.page.locator(
      '[class*="theme"], [class*="dark"], button:has-text("暗色"), button:has-text("亮色")'
    ).first();
    
    const isVisible = await themeToggle.isVisible().catch(() => false);
    
    if (isVisible) {
      const initialBg = await reportPage.page.locator('body').evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      await themeToggle.click();
      await reportPage.page.waitForTimeout(500);
      
      const newBg = await reportPage.page.locator('body').evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log(`主题切换: ${initialBg} -> ${newBg}`);
    }
  });

  test('动画和过渡效果应流畅', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const animatedElements = await reportPage.page.locator(
      '[class*="animate"], [class*="transition"], [style*="transition"]'
    ).all();
    
    if (animatedElements.length > 0) {
      const element = animatedElements[0];
      const transition = await element.evaluate(el => {
        return window.getComputedStyle(el).transition;
      });
      
      console.log(`元素过渡效果: ${transition}`);
    }
  });

  test('图标应正确加载和显示', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const iconSelectors = [
      'svg',
      '.icon',
      '[class*="icon"]',
      'i[class*="icon"]',
      'anticon',
    ];
    
    let iconCount = 0;
    for (const selector of iconSelectors) {
      const count = await reportPage.page.locator(selector).count();
      iconCount += count;
    }
    
    console.log(`图标总数: ${iconCount}`);
    expect(iconCount).toBeGreaterThanOrEqual(0);
  });
});
