/**
 * 测试数据生成辅助函数
 */

/**
 * 生成随机用户名
 */
export function generateUsername(prefix = 'testuser'): string {
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}`;
}

/**
 * 生成随机密码
 */
export function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * 生成随机邮箱
 */
export function generateEmail(domain = 'test.com'): string {
  const timestamp = Date.now().toString(36);
  return `test_${timestamp}@${domain}`;
}

/**
 * 生成随机手机号
 */
export function generatePhone(): string {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '186', '187', '188'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

/**
 * 生成随机角色名称
 */
export function generateRoleName(prefix = 'testrole'): string {
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}`;
}

/**
 * 生成随机部门名称
 */
export function generateDepartmentName(prefix = 'testdept'): string {
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}`;
}

/**
 * 生成完整的测试用户数据
 */
export function generateTestData() {
  return {
    username: generateUsername(),
    password: generatePassword(),
    nickname: `测试用户_${Date.now()}`,
    email: generateEmail(),
    phone: generatePhone()
  };
}
