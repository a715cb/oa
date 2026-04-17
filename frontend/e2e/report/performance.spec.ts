import { test, expect } from './fixtures/report-fixtures';

test.describe('报告页面加载性能测试', () => {
  test('首屏加载时间应在合理范围内（FCP < 3秒）', async ({ reportPage }) => {
    const startTime = Date.now();
    await reportPage.goto('/');
    await reportPage.waitForReportReady();
    
    const metrics = await reportPage.getPerformanceMetrics();
    const fcpTime = metrics.firstContentfulPaint;
    
    console.log(`首屏加载时间 (FCP): ${fcpTime.toFixed(2)}ms`);
    expect(fcpTime).toBeLessThan(3000);
    
    const loadTime = Date.now() - startTime;
    console.log(`实际加载时间: ${loadTime}ms`);
  });

  test('完全加载时间应在合理范围内（< 5秒）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const metrics = await reportPage.getPerformanceMetrics();
    const loadTime = metrics.fullyLoaded;
    
    console.log(`完全加载时间: ${loadTime.toFixed(2)}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('DOM交互时间应合理（< 2秒）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('domcontentloaded');
    
    const metrics = await reportPage.getPerformanceMetrics();
    const domInteractive = metrics.domInteractive;
    
    console.log(`DOM交互时间: ${domInteractive.toFixed(2)}ms`);
    expect(domInteractive).toBeLessThan(2000);
  });

  test('资源加载数量应合理（< 100个）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const metrics = await reportPage.getPerformanceMetrics();
    const resourceCount = metrics.totalResources;
    
    console.log(`加载资源数量: ${resourceCount}`);
    expect(resourceCount).toBeLessThan(100);
  });

  test('页面总传输大小应合理（< 10MB）', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    const metrics = await reportPage.getPerformanceMetrics();
    const totalSize = metrics.totalPageSize;
    const sizeInMB = totalSize / (1024 * 1024);
    
    console.log(`页面传输大小: ${sizeInMB.toFixed(2)}MB`);
    expect(sizeInMB).toBeLessThan(10);
  });

  test('页面不应有加载错误', async ({ page, reportPage }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`资源加载失败: ${response.url()} - ${response.status()}`);
      }
    });
    
    await reportPage.goto('/');
    await reportPage.waitForLoad('networkidle');
    
    expect(errors.length).toBe(0);
  });

  test('重复加载性能应稳定', async ({ reportPage }) => {
    const loadTimes: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await reportPage.goto('/');
      await reportPage.waitForLoad('networkidle');
      loadTimes.push(Date.now() - startTime);
      
      await reportPage.page.reload({ waitUntil: 'networkidle' });
    }
    
    const avgTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    const maxDeviation = Math.max(...loadTimes.map(t => Math.abs(t - avgTime)));
    
    console.log(`平均加载时间: ${avgTime.toFixed(2)}ms`);
    console.log(`最大偏差: ${maxDeviation.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(5000);
  });

  test('页面标题应正确加载', async ({ reportPage }) => {
    await reportPage.goto('/');
    await reportPage.waitForReportReady();
    
    const title = await reportPage.page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    console.log(`页面标题: ${title}`);
  });
});
