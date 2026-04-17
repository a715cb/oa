/**
 * E2E 测试 TypeScript 类型定义
 */

/**
 * 用户角色类型
 */
export interface UserRole {
  username: string;
  password: string;
  role: string;
}

/**
 * 测试用户数据
 */
export interface TestUser {
  id?: number;
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  role_id?: number;
  department_id?: number;
  status?: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  fcp: number;              // 首次内容绘制 (ms)
  domInteractive: number;   // DOM 交互时间 (ms)
  domContentLoaded: number; // DOM 加载完成 (ms)
  fullyLoaded: number;      // 完全加载 (ms)
  resourceCount: number;    // 资源数量
  pageSize: number;         // 页面大小 (bytes)
}

/**
 * 测试配置选项
 */
export interface TestConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  workers: number;
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * API 响应结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * 用户信息响应数据
 */
export interface UserInfoResponse {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  role_name: string;
}
