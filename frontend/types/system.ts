/**
 * 系统模块相关 TypeScript 接口定义
 */

/**
 * 统一 API 响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 用户信息接口
 */
export interface User {
  id: number | string;
  username: string;
  realname: string;
  phone: string;
  email: string;
  dept_id: number | string;
  avatar: string;
  status: number;
  is_admin: number;
  roles: Array<{ id: number | string; name: string }>;
  department?: Department;
  department_name?: string;
  role_name?: string;
  create_time: number;
  delete_time: number;
  [key: string]: any;
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  key?: string;
  roles?: number | string;
  status?: number;
  dept_id?: number | string;
  is_deleted?: number;
  create_time?: [string, string];
  page?: number;
  pageSize?: number;
}

/**
 * 用户保存/更新参数
 */
export interface UserSaveParams {
  id?: number | string;
  username?: string;
  realname?: string;
  phone?: string;
  email?: string;
  dept_id?: number | string;
  password?: string;
  role_ids?: Array<number | string>;
  status?: number;
  avatar?: string;
}

/**
 * 部门信息接口
 */
export interface Department {
  key?: string | number;
  id: number | string;
  name: string;
  parent_id: number | string;
  leader_id: number | string;
  leader_user?: User;
  sort: number;
  children?: Department[];
  [key: string]: any;
}

/**
 * 部门列表查询参数
 */
export interface DeptListParams {
  name?: string;
  status?: number;
}

/**
 * 部门保存/更新参数
 */
export interface DeptSaveParams {
  id?: number | string;
  name: string;
  parent_id: number | string;
  leader_id?: number | string;
  sort?: number;
}

/**
 * 角色信息接口
 */
export interface Role {
  id: number | string;
  name: string;
  sort: number;
  data_range: number;
  departments?: Department[];
  menus?: Menu[];
  [key: string]: any;
}

/**
 * 角色列表查询参数
 */
export interface RoleListParams {
  name?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

/**
 * 角色保存/更新参数
 */
export interface RoleSaveParams {
  id?: number | string;
  name: string;
  sort?: number;
  data_range?: number;
  dept_ids?: Array<number | string>;
}

/**
 * 角色权限树节点
 */
export interface RoleAuthNode {
  id: number | string;
  name: string;
  parent_id: number | string;
  type: number;
  route_name?: string;
  route_path?: string;
  component?: string;
  icon?: string;
  permission?: string;
  sort: number;
  children?: RoleAuthNode[];
  [key: string]: any;
}

/**
 * 角色权限响应
 */
export interface RoleAuthResponse {
  authNode: RoleAuthNode[];
  checked: Array<number | string>;
}

/**
 * 角色权限保存参数
 */
export interface RoleAuthParams {
  role_id: number | string;
  menu_id: Array<number | string>;
}

/**
 * 角色保存/更新参数
 */
export interface RoleSaveParams {
  id?: number | string;
  name: string;
  sort?: number;
  data_range?: number;
  dept_ids?: Array<number | string>;
}

/**
 * 菜单信息接口
 */
export interface Menu {
  id: number | string;
  name: string;
  parent_id: number | string;
  type: number;
  route_name: string;
  route_path: string;
  component: string;
  redirect: string;
  icon: string;
  permission: string;
  sort: number;
  visible: number;
  status: number;
  is_cached: number;
  children?: Menu[];
  [key: string]: any;
}

/**
 * 菜单列表查询参数
 */
export interface MenuListParams {
  name?: string;
  status?: number;
}

/**
 * 菜单保存/更新参数
 */
export interface MenuSaveParams {
  id?: number | string;
  name: string;
  parent_id: number | string;
  type: number;
  route_name?: string;
  route_path?: string;
  component?: string;
  redirect?: string;
  icon?: string;
  permission?: string;
  sort?: number;
  visible?: number;
  status?: number;
  is_cached?: number;
}

/**
 * 登录日志接口
 */
export interface LoginLog {
  id: number | string;
  user_id: number | string;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: number;
  msg: string;
  login_time: number;
}

/**
 * 登录日志列表查询参数
 */
export interface LoginLogListParams {
  username?: string;
  ip?: string;
  status?: number;
  login_time?: [string, string];
  page?: number;
  pageSize?: number;
}

/**
 * 操作日志接口
 */
export interface OperateLog {
  id: number | string;
  user_id: number | string;
  username: string;
  title: string;
  method: string;
  url: string;
  ip: string;
  params: string;
  result: string;
  status: number;
  error_msg: string;
  execute_time: number;
  create_time: number;
}

/**
 * 操作日志列表查询参数
 */
export interface OperateLogListParams {
  username?: string;
  title?: string;
  status?: number;
  create_time?: [string, string];
  page?: number;
  pageSize?: number;
}
