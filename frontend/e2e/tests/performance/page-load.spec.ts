import { test, expect } from '../../fixtures/base';
import { PERFORMANCE_THRESHOLDS } from '../../config/constants';

test.describe('页面加载性能测试', () => {
  test('登录页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`登录页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FULL_LOAD);
  });

  test('首页加载性能（已登录）', async ({ authenticatedPage: page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('text=首页').waitFor({ timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    console.log(`首页加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FULL_LOAD);
  });

  test('用户管理页面加载性能', async ({ authenticatedPage: page }) => {
    const startTime = Date.now();
    await page.goto('/system/user');
    await page.waitForLoadState('networkidle');
    await page.locator('.ant-table-tbody').waitFor({ timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    console.log(`用户管理页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FULL_LOAD);
  });

  test('获取 Performance API 指标', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        domInteractive: navigation.domInteractive - navigation.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
        fullyLoaded: navigation.loadEventEnd - navigation.startTime,
        resourceCount: performance.getEntriesByType('resource').length,
        pageSize: performance.getEntriesByType('resource').reduce(
          (sum, r) => sum + ((r as PerformanceResourceTiming).transferSize || 0), 0
        )
      };
    });
    
    console.log('性能指标:', {
      FCP: `${metrics.fcp.toFixed(0)}ms`,
      DOM交互: `${metrics.domInteractive.toFixed(0)}ms`,
      DOM加载: `${metrics.domContentLoaded.toFixed(0)}ms`,
      完全加载: `${metrics.fullyLoaded.toFixed(0)}ms`,
      资源数: metrics.resourceCount,
      页面大小: `${(metrics.pageSize / 1024).toFixed(0)}KB`
    });
    
    expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
    expect(metrics.domInteractive).toBeLessThan(PERFORMANCE_THRESHOLDS.DOM_INTERACTIVE);
    expect(metrics.resourceCount).toBeLessThan(PERFORMANCE_THRESHOLDS.RESOURCE_COUNT);
  });

  test('页面加载不应有资源错误', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(`页面错误: ${error.message}`);
    });
    
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url().startsWith('http')) {
        errors.push(`资源错误: ${response.url()} - ${response.status()}`);
      }
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });

  test('重复加载性能应稳定', async ({ authenticatedPage: page }) => {
    const loadTimes: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      loadTimes.push(Date.now() - startTime);
    }
    
    const avgTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    const maxDeviation = Math.max(...loadTimes.map(t => Math.abs(t - avgTime)));
    
    console.log(`平均加载时间: ${avgTime.toFixed(0)}ms, 最大偏差: ${maxDeviation.toFixed(0)}ms`);
    expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.FULL_LOAD);
  });
});
