import { Page, Locator, expect } from '@playwright/test';

export class ReportPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly reportContainer: Locator;
  readonly reportHeader: Locator;
  readonly reportContent: Locator;
  readonly reportFooter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1, .report-title, [class*="title"]');
    this.reportContainer = page.locator('.report-container, [class*="report"], #report');
    this.reportHeader = page.locator('.report-header, header, [class*="header"]');
    this.reportContent = page.locator('.report-content, main, .content, [class*="content"]');
    this.reportFooter = page.locator('.report-footer, footer, [class*="footer"]');
  }

  async goto(path: string = '') {
    const response = await this.page.goto(path);
    return response;
  }

  async waitForLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle') {
    await this.page.waitForLoadState(state);
  }

  async waitForReportReady(timeout: number = 10000) {
    await this.page.waitForFunction(
      () => document.readyState === 'complete',
      { timeout }
    );
  }

  async getPageTitle(): Promise<string> {
    await this.pageTitle.waitFor({ timeout: 5000 });
    return await this.pageTitle.first().innerText();
  }

  async isReportVisible(): Promise<boolean> {
    try {
      await expect(this.reportContainer.first()).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getPerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
        fullyLoaded: navigation.loadEventEnd - navigation.startTime,
        domInteractive: navigation.domInteractive - navigation.startTime,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalResources: performance.getEntriesByType('resource').length,
        totalPageSize: performance.getEntriesByType('resource').reduce(
          (sum, r) => sum + ((r as any).transferSize || 0), 0
        ),
      };
    });
    return metrics;
  }

  async captureScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  async getAllLinks(): Promise<Array<{ text: string; href: string }>> {
    const links = await this.page.locator('a').all();
    const result = [];
    for (const link of links) {
      const text = await link.innerText().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      if (href) {
        result.push({ text, href });
      }
    }
    return result;
  }

  async getAllButtons(): Promise<Array<{ text: string; visible: boolean }>> {
    const buttons = await this.page.locator('button, [role="button"]').all();
    const result = [];
    for (const btn of buttons) {
      const text = await btn.innerText().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      result.push({ text, visible });
    }
    return result;
  }

  async getConsoleErrors(): Promise<string[]> {
    return await this.page.evaluate(() => {
      return (window as any).__consoleErrors || [];
    });
  }

  async checkForJavascriptErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    return errors;
  }
}
