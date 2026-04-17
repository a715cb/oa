import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 菜单管理页面对象
 */
export class MenuPage extends BasePage {
  readonly treeView: Locator;
  readonly treeNodes: Locator;
  readonly addButton: Locator;
  readonly modalForm: Locator;
  readonly submitModalButton: Locator;

  constructor(page: Page) {
    super(page, '/system/menu');
    this.treeView = page.locator('.ant-tree');
    this.treeNodes = page.locator('.ant-tree-treenode');
    this.addButton = page.locator('button:has-text("新增")');
    this.modalForm = page.locator('.ant-modal, .s-modal');
    this.submitModalButton = page.locator('.ant-modal-footer .ant-btn-primary');
  }

  async waitForMenuTreeLoaded(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.treeView.waitFor({ timeout: 5000 });
  }

  async getMenuCount(): Promise<number> {
    await this.waitForMenuTreeLoaded();
    return await this.treeNodes.count();
  }

  async clickAddMenu(): Promise<void> {
    await this.addButton.click();
    await this.modalForm.waitFor({ timeout: 5000 });
  }

  async fillMenuForm(data: { name?: string; path?: string; component?: string }): Promise<void> {
    const { name, path, component } = data;
    if (name) {
      await this.modalForm.locator('input[placeholder*="菜单名称"]').fill(name);
    }
    if (path) {
      await this.modalForm.locator('input[placeholder*="路由地址"]').fill(path);
    }
    if (component) {
      await this.modalForm.locator('input[placeholder*="组件路径"]').fill(component);
    }
  }

  async submitMenuForm(): Promise<void> {
    await this.submitModalButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expandTreeNode(index: number): Promise<void> {
    const node = this.treeNodes.nth(index);
    const switcher = node.locator('.ant-tree-switcher');
    await switcher.click();
  }
}
