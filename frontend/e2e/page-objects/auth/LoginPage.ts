import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * 登录页面对象
 * 封装登录页面的所有交互方法
 */
export class LoginPage extends BasePage {
  // 表单元素
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberCheckbox: Locator;
  
  // 错误提示
  readonly errorMessage: Locator;
  
  // 其他元素
  readonly forgotLink: Locator;
  readonly brandTitle: Locator;

  constructor(page: Page) {
    super(page, '/login');
    this.usernameInput = page.locator('input[placeholder="请输入用户名"]');
    this.passwordInput = page.locator('input[placeholder="请输入密码"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.rememberCheckbox = page.locator('.ant-checkbox-wrapper');
    this.errorMessage = page.locator('.ant-message-error, .text-error');
    this.forgotLink = page.locator('a:has-text("忘记密码")');
    this.brandTitle = page.locator('.brand-title');
  }

  /**
   * 执行登录操作
   */
  async login(username: string, password: string): Promise<void> {
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // 等待登录成功（URL 变化）
    await this.page.waitForURL(/^(?!.*login).*$/, { timeout: 10000 });
  }

  /**
   * 执行登录并期望失败
   */
  async loginAndExpectFailure(username: string, password: string): Promise<void> {
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // 等待错误消息
    await this.errorMessage.waitFor({ timeout: 5000 });
  }

  /**
   * 填写用户名
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * 填写密码
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * 点击登录按钮
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * 获取错误消息
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ timeout: 5000 });
    return await this.errorMessage.innerText();
  }

  /**
   * 验证品牌标题是否可见
   */
  async isBrandVisible(): Promise<boolean> {
    return await this.brandTitle.isVisible();
  }

  /**
   * 勾选记住账号
   */
  async rememberAccount(): Promise<void> {
    await this.rememberCheckbox.click();
  }
}
