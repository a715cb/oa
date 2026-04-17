import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Playwright E2E 测试配置
 * 
 * 支持多项目、多浏览器、多设备测试
 * 包含性能监控、截图/录屏、轨迹追踪
 */
export default defineConfig({
  // 测试目录
  testDir: './e2e/tests',
  
  // 全局设置/清理
  globalSetup: path.resolve(__dirname, './e2e/setup/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, './e2e/setup/global-teardown.ts'),
  
  // 并行执行设置
  fullyParallel: false,  // E2E 测试需要顺序执行
  forbidOnly: !!process.env.CI,  // CI 环境禁止使用 .only()
  retries: process.env.CI ? 2 : 1,  // 失败重试次数
  workers: process.env.CI ? 2 : 1,  // 并行工作进程数
  
  // 超时配置
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  
  // 测试报告配置
  reporter: [
    // HTML 报告（用于本地查看）
    ['html', { 
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    // 终端列表报告
    ['list'],
    // JUnit 报告（用于 CI/CD 集成）
    ['junit', { 
      outputFile: 'test-results/e2e-results.xml'
    }],
    // 行报告（简洁模式）
    process.env.CI ? ['dot'] : ['line'],
  ].filter(Boolean),
  
  // 全局测试配置
  use: {
    // 基础 URL
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // 浏览器选项
    headless: process.env.CI ? true : process.env.HEADLESS === 'true',
    viewport: { width: 1920, height: 1080 },
    
    // 操作超时
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // 轨迹追踪（失败时保留）
    trace: 'retain-on-failure',
    
    // 截图配置
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // 视频录制配置
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    
    // 本地存储状态
    storageState: undefined,
    
    // 忽略 HTTPS 错误
    ignoreHTTPSErrors: true,
  },
  
  // 测试项目配置
  projects: [
    // 桌面端 Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // 桌面端 Firefox
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
      // CI 环境才运行 Firefox
      grep: process.env.CI ? /./ : /^$/,  // CI 环境跳过
    },
    
    // 移动端 Chrome（模拟手机）
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
      // 仅运行移动端专用测试
      grep: /@mobile/,
    },
    
    // 平板设备
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
      },
      grep: /@tablet/,
    },
  ],
  
  // 输出目录
  outputDir: 'test-results/',
  
  // 保留失败测试的输出
  preserveOutput: 'failures-only',
  
  // 快照配置
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  
  // Web 服务器配置（可选，用于自动启动前端服务）
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   timeout: 120000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
