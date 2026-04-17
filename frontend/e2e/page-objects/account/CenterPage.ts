import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 个人中心页面对象
 */
export class CenterPage extends BasePage {
  readonly basicTab: Locator;
  readonly passwordTab: Locator;
  readonly avatarUpload: Locator;
  readonly saveButton: Locator;
  readonly oldPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;

  constructor(page: Page) {
    super(page, '/account/center');
    this.basicTab = page.locator('text=基本设置');
    this.passwordTab = page.locator('text=修改密码');
    this.avatarUpload = page.locator('.avatar-uploader, .upload-avatar');
    this.saveButton = page.locator('button:has-text("保存")');
    this.oldPasswordInput = page.locator('input[placeholder*="原密码"]');
    this.newPasswordInput = page.locator('input[placeholder*="新密码"]');
    this.confirmPasswordInput = page.locator('input[placeholder*="确认密码"]');
  }

  async waitForPageLoaded(): Promise<void> {
    await this.waitForLoad('networkidle');
    await this.basicTab.waitFor({ timeout: 5000 });
  }

  async switchToBasicTab(): Promise<void> {
    await this.basicTab.click();
  }

  async switchToPasswordTab(): Promise<void> {
    await this.passwordTab.click();
  }

  async changePassword(oldPwd: string, newPwd: string, confirmPwd: string): Promise<void> {
    await this.switchToPasswordTab();
    await this.oldPasswordInput.fill(oldPwd);
    await this.newPasswordInput.fill(newPwd);
    await this.confirmPasswordInput.fill(confirmPwd);
    await this.saveButton.click();
  }

  async updateProfile(data: { nickname?: string; email?: string; phone?: string }): Promise<void> {
    await this.switchToBasicTab();
    const { nickname, email, phone } = data;
    if (nickname) {
      await this.page.locator('input[placeholder*="昵称"]').fill(nickname);
    }
    if (email) {
      await this.page.locator('input[placeholder*="邮箱"]').fill(email);
    }
    if (phone) {
      await this.page.locator('input[placeholder*="手机号"]').fill(phone);
    }
    await this.saveButton.click();
  }
}
