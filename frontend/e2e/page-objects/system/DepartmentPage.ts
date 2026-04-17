import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 部门管理页面对象
 */
export class DepartmentPage extends BasePage {
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly addButton: Locator;
  readonly treeView: Locator;
  readonly modalForm: Locator;
  readonly submitModalButton: Locator;

  constructor(page: Page) {
    super(page, '/system/department');
    this.table = page.locator('.ant-table-tbody');
    this.tableRows = page.locator('.ant-table-tbody tr');
    this.addButton = page.locator('button:has-text("新增")');
    this.treeView = page.locator('.ant-tree');
    this.modalForm = page.locator('.ant-modal, .s-modal');
    this.submitModalButton = page.locator('.ant-modal-footer .ant-btn-primary');
  }

  async waitForDepartmentListLoaded(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.table.waitFor({ timeout: 5000 });
  }

  async getDepartmentCount(): Promise<number> {
    await this.waitForDepartmentListLoaded();
    return await this.tableRows.count();
  }

  async clickAddDepartment(): Promise<void> {
    await this.addButton.click();
    await this.modalForm.waitFor({ timeout: 5000 });
  }

  async fillDepartmentForm(data: { name?: string; sort?: string }): Promise<void> {
    const { name, sort } = data;
    if (name) {
      await this.modalForm.locator('input[placeholder*="部门名称"]').fill(name);
    }
    if (sort) {
      await this.modalForm.locator('input[placeholder*="排序"]').fill(sort);
    }
  }

  async submitDepartmentForm(): Promise<void> {
    await this.submitModalButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
