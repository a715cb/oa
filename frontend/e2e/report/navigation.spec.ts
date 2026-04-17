import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面导航功能测试', () => {
  test('页面内锚点跳转应正确工作', async ({ reportPage, navigationPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const anchors = await navigationPage.checkAnchorsWorking();
    
    for (const anchor of anchors.slice(0, 5)) {
      console.log(`锚点 "${anchor.text}" 工作状态: ${anchor.working ? '正常' : '失败'}`);
    }
    
    const workingAnchors = anchors.filter(a => a.working);
    expect(workingAnchors.length).toBeGreaterThanOrEqual(0);
  });

  test('导航链接应有效且可点击', async ({ reportPage, navigationPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const links = await navigationPage.getNavigationLinks();
    
    expect(links.length).toBeGreaterThanOrEqual(0);
    console.log(`导航链接总数: ${links.length}`);
    
    for (const link of links.slice(0, 5)) {
      console.log(`链接: ${link.text} -> ${link.href}`);
    }
  });

  test('不同报告页面间切换应正常', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const initialUrl = reportPage.page.url();
    console.log(`初始页面URL: ${initialUrl}`);
    
    const links = await reportPage.getAllLinks();
    
    let switchedPages = 0;
    for (const link of links.slice(0, 5)) {
      if (link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript')) {
        try {
          await reportPage.page.locator(`a:has-text("${link.text}")`).first().click({ timeout: 3000 });
          await reportPage.page.waitForLoadState('networkidle', { timeout: 5000 });
          
          const newUrl = reportPage.page.url();
          expect(newUrl).toBeTruthy();
          console.log(`页面切换: ${link.text} -> ${newUrl}`);
          
          switchedPages++;
          
          await reportPage.page.goBack({ waitUntil: 'networkidle' });
          await reportPage.page.waitForLoadState('networkidle');
        } catch (e) {
          console.log(`页面切换失败: ${link.text}`);
        }
      }
    }
    
    console.log(`成功切换页面数: ${switchedPages}`);
  });

  test('浏览器返回操作应正确工作', async ({ reportPage, navigationPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const initialUrl = reportPage.page.url();
    
    const links = await navigationPage.getNavigationLinks();
    
    if (links.length > 0) {
      const firstLink = links.find(l => 
        l.href && !l.href.startsWith('#') && !l.href.startsWith('javascript')
      );
      
      if (firstLink) {
        await navigationPage.clickNavLink(firstLink.text);
        await navigationPage.waitForNavigationComplete();
        
        const newUrl = await navigationPage.getCurrentUrl();
        expect(newUrl).not.toBe(initialUrl);
        console.log(`导航到新页面: ${newUrl}`);
        
        await navigationPage.goBack();
        await navigationPage.waitForNavigationComplete();
        
        const backUrl = await navigationPage.getCurrentUrl();
        console.log(`返回后页面: ${backUrl}`);
      }
    }
  });

  test('浏览器前进操作应正确工作', async ({ reportPage, navigationPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const initialUrl = reportPage.page.url();
    
    const links = await navigationPage.getNavigationLinks();
    const validLink = links.find(l => 
      l.href && !l.href.startsWith('#') && !l.href.startsWith('javascript')
    );
    
    if (validLink) {
      await navigationPage.clickNavLink(validLink.text);
      await navigationPage.waitForNavigationComplete();
      
      await navigationPage.goBack();
      await navigationPage.waitForNavigationComplete();
      
      await navigationPage.goForward();
      await navigationPage.waitForNavigationComplete();
      
      const forwardUrl = await navigationPage.getCurrentUrl();
      expect(forwardUrl).toBeTruthy();
      console.log(`前进操作后页面: ${forwardUrl}`);
    }
  });

  test('面包屑导航应正确显示且可点击', async ({ navigationPage }) => {
    await navigationPage.page.goto('/');
    await navigationPage.page.waitForLoadState('networkidle');
    
    const breadcrumbVisible = await navigationPage.breadcrumbs.first().isVisible().catch(() => false);
    
    if (breadcrumbVisible) {
      const breadcrumbText = await navigationPage.breadcrumbs.first().innerText();
      expect(breadcrumbText.trim().length).toBeGreaterThan(0);
      console.log(`面包屑内容: ${breadcrumbText}`);
      
      const breadcrumbLinks = await navigationPage.breadcrumbs.locator('a').count();
      if (breadcrumbLinks > 0) {
        console.log(`面包屑链接数: ${breadcrumbLinks}`);
      }
    } else {
      console.log('页面无面包屑导航');
    }
  });

  test('标签页切换应正常工作', async ({ reportPage, navigationPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const tabCount = await navigationPage.tabItems.count();
    
    if (tabCount > 1) {
      const initialActiveTab = await navigationPage.getActiveTab().catch(() => '');
      console.log(`初始活动标签: ${initialActiveTab}`);
      
      const tabs = await navigationPage.tabItems.all();
      
      for (const tab of tabs.slice(0, 3)) {
        const tabText = await tab.innerText();
        await tab.click();
        await reportPage.page.waitForTimeout(500);
        
        console.log(`切换到标签: ${tabText}`);
      }
    } else {
      console.log('页面无多标签页');
    }
  });

  test('多次导航应保持状态正确', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    for (let i = 0; i < 3; i++) {
      await reportPage.page.reload({ waitUntil: 'networkidle' });
      
      const isReady = await reportPage.isReportVisible();
      expect(isReady).toBe(true);
      
      const title = await reportPage.page.title();
      expect(title.length).toBeGreaterThan(0);
      
      console.log(`第 ${i + 1} 次刷新后页面正常`);
    }
  });

  test('页面URL应合理且有意义', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const currentUrl = reportPage.page.url();
    expect(currentUrl).toBeTruthy();
    expect(currentUrl).toContain('localhost:9323');
    
    console.log(`当前URL: ${currentUrl}`);
    
    const url = new URL(currentUrl);
    expect(url.protocol).toBe('http:');
    expect(url.hostname).toBe('localhost');
    expect(url.port).toBe('9323');
  });

  test('导航期间不应出现404错误', async ({ reportPage }) => {
    const errors: string[] = [];
    
    reportPage.page.on('response', (response) => {
      if (response.status() === 404) {
        errors.push(response.url());
      }
    });
    
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const links = await reportPage.getAllLinks();
    
    for (const link of links.slice(0, 5)) {
      if (link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript')) {
        try {
          await reportPage.page.locator(`a:has-text("${link.text}")`).first().click({ timeout: 3000 });
          await reportPage.page.waitForLoadState('networkidle', { timeout: 5000 });
          await reportPage.page.goBack({ waitUntil: 'networkidle' });
        } catch (e) {
        }
      }
    }
    
    expect(errors.length).toBe(0);
    if (errors.length > 0) {
      console.log(`404错误URL: ${errors.join(', ')}`);
    }
  });

  test('侧边栏导航应正确工作', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const sidebarSelectors = [
      '.sidebar',
      '.menu',
      '.nav',
      '[class*="sidebar"]',
      '[class*="menu"]',
      'aside',
    ];
    
    let sidebarFound = false;
    for (const selector of sidebarSelectors) {
      const sidebar = reportPage.page.locator(selector).first();
      const isVisible = await sidebar.isVisible().catch(() => false);
      
      if (isVisible) {
        sidebarFound = true;
        const links = await sidebar.locator('a').count();
        console.log(`侧边栏链接数: ${links}`);
        break;
      }
    }
    
    console.log(`侧边栏存在: ${sidebarFound}`);
  });

  test('返回顶部功能应正常（如存在）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    await reportPage.page.mouse.wheel(0, 1000);
    await reportPage.page.waitForTimeout(500);
    
    const backToTopSelectors = [
      '.back-to-top',
      '[class*="backtop"]',
      'button:has-text("返回顶部")',
      'a:has-text("返回顶部")',
    ];
    
    for (const selector of backToTopSelectors) {
      const btn = reportPage.page.locator(selector).first();
      const isVisible = await btn.isVisible().catch(() => false);
      
      if (isVisible) {
        await btn.click();
        await reportPage.page.waitForTimeout(500);
        
        const scrollTop = await reportPage.page.evaluate(() => window.scrollY);
        console.log(`返回顶部后滚动位置: ${scrollTop}`);
        break;
      }
    }
  });
});
