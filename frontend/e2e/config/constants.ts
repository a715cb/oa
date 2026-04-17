/**
 * E2E 测试常量配置
 * 集中管理测试环境中使用的所有常量
 */

// 角色定义
export const ROLES = {
  ADMIN: {
    username: 'admin',
    password: '123456',
    role: '超级管理员'
  },
  USER: {
    username: 'user',
    password: '123456',
    role: '普通用户'
  },
  NEW_USER: {
    username: 'newuser',
    password: '123456',
    role: '新用户'
  }
} as const;

// 路由路径
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  SYSTEM_USER: '/system/user',
  SYSTEM_ROLE: '/system/role',
  SYSTEM_DEPARTMENT: '/system/department',
  SYSTEM_MENU: '/system/menu',
  SYSTEM_DICT: '/system/dict',
  SYSTEM_LOGIN_LOG: '/system/login_log',
  SYSTEM_OPERATE_LOG: '/system/operate_log',
  ACCOUNT_CENTER: '/account/center'
} as const;

// API 路径
export const API_PATHS = {
  LOGIN: '/login',
  GET_USER_INFO: '/getUserInfo',
  USER_LIST: '/system/user/list',
  ROLE_LIST: '/system/role/list',
  DEPARTMENT_LIST: '/system/department/list',
  MENU_LIST: '/system/menu/list',
  DICT_LIST: '/system/dict/list'
} as const;

// 性能阈值
export const PERFORMANCE_THRESHOLDS = {
  FCP: 3000,              // 首次内容绘制 < 3s
  FULL_LOAD: 5000,        // 完全加载 < 5s
  DOM_INTERACTIVE: 2000,  // DOM 交互 < 2s
  RESOURCE_COUNT: 100,    // 资源数量 < 100
  PAGE_SIZE_MB: 10,       // 页面大小 < 10MB
  API_RESPONSE: 1000,     // API 响应 < 1s
  BUTTON_RESPONSE: 500    // 按钮响应 < 500ms
} as const;

// 超时配置
export const TIMEOUTS = {
  ACTION: 15000,
  NAVIGATION: 30000,
  EXPECT: 10000,
  LOAD: 60000
} as const;

// 视口配置
export const VIEWPORTS = {
  DESKTOP: { width: 1920, height: 1080 },
  LAPTOP: { width: 1366, height: 768 },
  TABLET: { width: 768, height: 1024 },
  MOBILE: { width: 375, height: 812 }
} as const;

// 测试数据
export const TEST_DATA = {
  NEW_USER: {
    username: 'testuser',
    nickname: '测试用户',
    password: 'Test123456',
    email: 'test@example.com',
    phone: '13800138000'
  },
  NEW_ROLE: {
    name: '测试角色',
    code: 'test_role',
    description: '用于E2E测试的角色'
  },
  NEW_DEPARTMENT: {
    name: '测试部门',
    code: 'test_dept',
    sort: 1
  },
  NEW_MENU: {
    name: '测试菜单',
    path: '/test/menu',
    sort: 1
  },
  NEW_DICT: {
    name: '测试字典',
    code: 'test_dict',
    sort: 1
  }
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  LOGIN_REQUIRED: '用户名或密码不能为空',
  LOGIN_FAILED: '用户名或密码错误',
  LOCKOUT: '由于多次输入错误密码',
  NO_PERMISSION: '无权限',
  EMPTY_TABLE: '暂无数据'
} as const;
