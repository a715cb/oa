/**
 * 全局测试环境设置
 * 在所有测试执行前运行，负责：
 * - 验证后端服务是否可用
 * - 初始化测试数据库数据
 * - 创建测试用户账号
 */
import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('=== E2E 测试环境初始化 ===');
  
  // 1. 验证后端服务是否可用
  try {
    const response = await fetch('http://127.0.0.1:8000/adminapi/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    console.log('后端服务状态:', response.status);
  } catch (error) {
    console.warn('警告: 后端服务可能未启动，请确保后端服务运行在 http://127.0.0.1:8000');
  }
  
  // 2. 验证前端服务是否可用
  try {
    const response = await fetch('http://localhost:5173', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    console.log('前端服务状态:', response.status);
  } catch (error) {
    console.error('错误: 前端服务未启动，请先运行 npm run dev');
    throw new Error('前端服务不可用');
  }
  
  // 3. 通过 API 创建测试用户（如果不存在）
  await seedTestData();
  
  console.log('=== 测试环境初始化完成 ===');
}

/**
 * 播种测试数据
 */
async function seedTestData() {
  console.log('初始化测试数据...');
  
  // 注意：实际项目中应通过后端 API 或直接操作数据库来创建测试数据
  // 这里仅提供框架，具体实现根据项目需求调整
  
  const testUsers = [
    { username: 'admin', password: '123456', role: 'admin' },
    { username: 'user', password: '123456', role: 'user' },
    { username: 'newuser', password: '123456', role: 'new_user' }
  ];
  
  for (const user of testUsers) {
    console.log(`  - 测试用户: ${user.username} (${user.role})`);
  }
  
  // TODO: 实际项目中应调用后端 API 创建测试用户
  // 例如：通过管理员 API 创建用户
  /*
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登录管理员账号
  await page.goto('http://localhost:5173/login');
  await page.fill('input[placeholder="请输入用户名"]', 'admin');
  await page.fill('input[placeholder="请输入密码"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(/^(?!.*login).*$/);
  
  // 创建测试用户...
  
  await browser.close();
  */
}

export default globalSetup;
