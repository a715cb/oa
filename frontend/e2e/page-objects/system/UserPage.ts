import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 用户管理页面对象
 * 封装用户管理页面的所有交互方法
 */
export class UserPage extends BasePage {
  // 表格元素
  readonly table: Locator;
  readonly tableRows: Locator;
  
  // 操作按钮
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  
  // 分页
  readonly pagination: Locator;
  
  // 表单元素
  readonly modalForm: Locator;
  readonly submitModalButton: Locator;
  readonly cancelModalButton: Locator;

  constructor(page: Page) {
    super(page, '/system/user');
    this.table = page.locator('.ant-table-tbody');
    this.tableRows = page.locator('.ant-table-tbody tr');
    this.addButton = page.locator('button:has-text("新增")');
    this.searchInput = page.locator('input[placeholder*="搜索"], .ant-input-search input');
    this.searchButton = page.locator('button:has-text("搜索"), .ant-btn-primary:has-text("搜索")');
    this.resetButton = page.locator('button:has-text("重置")');
    this.pagination = page.locator('.ant-pagination');
    this.modalForm = page.locator('.ant-modal, .s-modal');
    this.submitModalButton = page.locator('.ant-modal-footer button:has-text("确定"), .ant-modal-footer .ant-btn-primary');
    this.cancelModalButton = page.locator('.ant-modal-footer button:has-text("取消")');
  }

  /**
   * 等待用户列表加载完成
   */
  async waitForUserListLoaded(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.table.waitFor({ timeout: 5000 });
  }

  /**
   * 获取用户列表行数
   */
  async getUserCount(): Promise<number> {
    await this.waitForUserListLoaded();
    return await this.tableRows.count();
  }

  /**
   * 点击新增用户按钮
   */
  async clickAddUser(): Promise<void> {
    await this.addButton.click();
    await this.modalForm.waitFor({ timeout: 5000 });
  }

  /**
   * 搜索用户
   */
  async searchUser(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForLoad('networkidle');
  }

  /**
   * 重置搜索
   */
  async resetSearch(): Promise<void> {
    await this.resetButton.click();
    await this.waitForLoad('networkidle');
  }

  /**
   * 填写用户表单
   */
  async fillUserForm(userData: {
    username?: string;
    password?: string;
    nickname?: string;
    email?: string;
    phone?: string;
  }): Promise<void> {
    const { username, password, nickname, email, phone } = userData;
    
    if (username) {
      const usernameInput = this.modalForm.locator('input[placeholder*="用户名"]');
      await usernameInput.fill(username);
    }
    if (password) {
      const passwordInput = this.modalForm.locator('input[placeholder*="密码"]');
      await passwordInput.fill(password);
    }
    if (nickname) {
      const nicknameInput = this.modalForm.locator('input[placeholder*="昵称"]');
      await nicknameInput.fill(nickname);
    }
    if (email) {
      const emailInput = this.modalForm.locator('input[placeholder*="邮箱"]');
      await emailInput.fill(email);
    }
    if (phone) {
      const phoneInput = this.modalForm.locator('input[placeholder*="手机号"]');
      await phoneInput.fill(phone);
    }
  }

  /**
   * 提交用户表单
   */
  async submitUserForm(): Promise<void> {
    await this.submitModalButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 取消用户表单
   */
  async cancelUserForm(): Promise<void> {
    await this.cancelModalButton.click();
  }

  /**
   * 点击用户操作按钮（编辑/删除等）
   */
  async clickUserAction(rowIndex: number, action: string): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    await row.locator(`button:has-text("${action}")`).click();
  }

  /**
   * 获取指定行的用户数据
   */
  async getUserRowData(rowIndex: number): Promise<string[]> {
    const row = this.tableRows.nth(rowIndex);
    const cells = row.locator('td');
    const count = await cells.count();
    const data: string[] = [];
    for (let i = 0; i < count; i++) {
      data.push(await cells.nth(i).innerText());
    }
    return data;
  }
}
