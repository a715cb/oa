import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 角色管理页面对象
 */
export class RolePage extends BasePage {
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly addButton: Locator;
  readonly modalForm: Locator;
  readonly submitModalButton: Locator;

  constructor(page: Page) {
    super(page, '/system/role');
    this.table = page.locator('.ant-table-tbody');
    this.tableRows = page.locator('.ant-table-tbody tr');
    this.addButton = page.locator('button:has-text("新增")');
    this.modalForm = page.locator('.ant-modal, .s-modal');
    this.submitModalButton = page.locator('.ant-modal-footer .ant-btn-primary');
  }

  async waitForRoleListLoaded(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.table.waitFor({ timeout: 5000 });
  }

  async getRoleCount(): Promise<number> {
    await this.waitForRoleListLoaded();
    return await this.tableRows.count();
  }

  async clickAddRole(): Promise<void> {
    await this.addButton.click();
    await this.modalForm.waitFor({ timeout: 5000 });
  }

  async fillRoleForm(data: { name?: string; code?: string; description?: string }): Promise<void> {
    const { name, code, description } = data;
    if (name) {
      await this.modalForm.locator('input[placeholder*="角色名称"]').fill(name);
    }
    if (code) {
      await this.modalForm.locator('input[placeholder*="角色编码"]').fill(code);
    }
    if (description) {
      await this.modalForm.locator('textarea, input[placeholder*="描述"]').fill(description);
    }
  }

  async submitRoleForm(): Promise<void> {
    await this.submitModalButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickRoleAction(rowIndex: number, action: string): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator(`button:has-text("${action}")`).click();
  }
}
