import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 字典管理页面对象
 */
export class DictPage extends BasePage {
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly addButton: Locator;
  readonly modalForm: Locator;
  readonly submitModalButton: Locator;

  constructor(page: Page) {
    super(page, '/system/dict');
    this.table = page.locator('.ant-table-tbody');
    this.tableRows = page.locator('.ant-table-tbody tr');
    this.addButton = page.locator('button:has-text("新增")');
    this.modalForm = page.locator('.ant-modal, .s-modal');
    this.submitModalButton = page.locator('.ant-modal-footer .ant-btn-primary');
  }

  async waitForDictListLoaded(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.table.waitFor({ timeout: 5000 });
  }

  async getDictCount(): Promise<number> {
    await this.waitForDictListLoaded();
    return await this.tableRows.count();
  }

  async clickAddDict(): Promise<void> {
    await this.addButton.click();
    await this.modalForm.waitFor({ timeout: 5000 });
  }

  async fillDictForm(data: { name?: string; code?: string }): Promise<void> {
    const { name, code } = data;
    if (name) {
      await this.modalForm.locator('input[placeholder*="字典名称"]').fill(name);
    }
    if (code) {
      await this.modalForm.locator('input[placeholder*="字典编码"]').fill(code);
    }
  }

  async submitDictForm(): Promise<void> {
    await this.submitModalButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
