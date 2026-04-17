import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 首页页面对象
 * 封装首页的所有交互方法
 */
export class HomePage extends BasePage {
  // 导航元素
  readonly sidebarMenu: Locator;
  readonly topNav: Locator;
  readonly userMenu: Locator;
  
  // 首页内容
  readonly welcomeTitle: Locator;
  readonly dashboardContainer: Locator;
  readonly chartContainer: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.sidebarMenu = page.locator('.ant-menu-side, .sidebar-menu');
    this.topNav = page.locator('.header, .top-nav');
    this.userMenu = page.locator('.user-menu, .user-dropdown');
    this.welcomeTitle = page.locator('text=首页, h1');
    this.dashboardContainer = page.locator('.dashboard, .home-content');
    this.chartContainer = page.locator('.chart-container, .echarts');
  }

  /**
   * 等待首页加载完成
   */
  async waitForHomeReady(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.welcomeTitle.waitFor({ timeout: 5000 });
  }

  /**
   * 验证首页是否正常加载
   */
  async isHomeLoaded(): Promise<boolean> {
    try {
      await this.waitForHomeReady();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 点击侧边栏菜单项
   */
  async clickMenuItem(text: string): Promise<void> {
    await this.sidebarMenu.locator(`.ant-menu-item:has-text("${text}")`).click();
  }

  /**
   * 点击用户菜单
   */
  async clickUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  /**
   * 获取侧边栏菜单项列表
   */
  async getMenuItems(): Promise<string[]> {
    const items = await this.sidebarMenu.locator('.ant-menu-item').all();
    return Promise.all(items.map(item => item.innerText()));
  }

  /**
   * 点击退出登录
   */
  async logout(): Promise<void> {
    await this.clickUserMenu();
    await this.page.locator('text=退出登录').click();
    await this.page.waitForURL('**/login', { timeout: 5000 });
  }

  /**
   * 导航到个人中心
   */
  async goToAccountCenter(): Promise<void> {
    await this.clickUserMenu();
    await this.page.locator('text=个人中心').click();
    await this.page.waitForURL('**/account/center', { timeout: 5000 });
  }
}
