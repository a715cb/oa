import { Page, Locator, expect } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;
  readonly navMenu: Locator;
  readonly navLinks: Locator;
  readonly breadcrumbs: Locator;
  readonly backButton: Locator;
  readonly forwardButton: Locator;
  readonly tabItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navMenu = page.locator('nav, .nav, .menu, [class*="nav"], [class*="menu"]');
    this.navLinks = page.locator('nav a, .nav a, .menu a, a[href]');
    this.breadcrumbs = page.locator('.breadcrumbs, .breadcrumb, [class*="breadcrumb"]');
    this.backButton = page.locator('button:has-text("返回"), .back-btn, [class*="back"]');
    this.forwardButton = page.locator('button:has-text("前进"), .forward-btn, [class*="forward"]');
    this.tabItems = page.locator('.tab, .tab-item, [role="tab"], [class*="tab"]');
  }

  async getNavigationLinks(): Promise<Array<{ text: string; href: string }>> {
    const links = await this.navLinks.all();
    const result = [];
    for (const link of links) {
      const text = await link.innerText().catch(() => '');
      const href = await link.getAttribute('href').catch(() => '');
      if (href && text.trim()) {
        result.push({ text: text.trim(), href });
      }
    }
    return result;
  }

  async clickNavLink(text: string): Promise<void> {
    await this.page.locator(`a:has-text("${text}")`).first().click();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'networkidle' });
  }

  async clickBreadcrumbItem(index: number): Promise<void> {
    const items = await this.breadcrumbs.locator('a').all();
    if (items[index]) {
      await items[index].click();
    }
  }

  async clickTab(tabName: string): Promise<void> {
    await this.page.locator(`[role="tab"]:has-text("${tabName}")`).first().click();
  }

  async getActiveTab(): Promise<string> {
    const activeTab = this.page.locator('[role="tab"][aria-selected="true"], .tab.active, [class*="active"]');
    return await activeTab.first().innerText();
  }

  async waitForNavigationComplete(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async getPageTitle(): Promise<string> {
    const title = await this.page.title();
    const h1 = await this.page.locator('h1').first().innerText().catch(() => '');
    return h1 || title;
  }

  async checkAnchorsWorking(): Promise<Array<{ text: string; working: boolean }>> {
    const anchors = await this.page.locator('a[href^="#"]').all();
    const results = [];
    for (const anchor of anchors) {
      const text = await anchor.innerText().catch(() => '');
      const href = await anchor.getAttribute('href').catch(() => '');
      const targetId = href?.substring(1);
      let working = false;
      if (targetId && targetId.length > 0) {
        const hasTarget = await this.page.evaluate((id) => {
          try {
            const el = document.getElementById(id);
            return el !== null;
          } catch {
            return false;
          }
        }, targetId);
        working = hasTarget;
      }
      results.push({ text, working });
    }
    return results;
  }
}
