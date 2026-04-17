/**
 * 页面对象基类
 * 提供所有页面共享的通用方法
 */
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  /**
   * 导航到当前页面
   */
  async goto(params?: Record<string, string>): Promise<void> {
    let targetUrl = this.url;
    if (params) {
      const searchParams = new URLSearchParams(params);
      targetUrl += `?${searchParams.toString()}`;
    }
    await this.page.goto(targetUrl);
  }

  /**
   * 等待页面加载完成
   */
  async waitForLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * 获取页面标题
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 等待元素可见
   */
  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * 点击元素并等待响应
   */
  async clickAndWait(locator: Locator, waitTimeout = 3000): Promise<void> {
    await locator.click();
    await this.page.waitForTimeout(waitTimeout);
  }

  /**
   * 获取元素文本
   */
  async getElementText(locator: Locator): Promise<string> {
    return await locator.innerText();
  }

  /**
   * 截图
   */
  async screenshot(name: string, fullPage = false): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage
    });
  }

  /**
   * 验证元素可见
   */
  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * 验证元素不可见
   */
  async expectHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * 验证元素包含文本
   */
  async expectText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  /**
   * 等待网络空闲
   */
  async waitForNetworkIdle(timeout = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}
