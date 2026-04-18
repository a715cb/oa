import request from "@/utils/request";
import type { User, UserListParams, UserSaveParams } from "@/@types/system";

/**
 * 获取用户列表
 * @param params
 */
export function getUserList(params: UserListParams) {
  return request.get<User[]>("/user", { params });
}

/**
 * 获取激活的用户
 * @param params
 */
export function getActiveUsers(params: Record<string, any>) {
  return request.get<User[]>("/user/getActiveUsers", { params });
}

/**
 * 根据id获取用户
 * @param id
 */
export function getUserById(id: string | number | (string | number)[]) {
  return request.get<User[]>("/user/getUserById", { params: { id } });
}

/**
 * 保存
 * @param data
 */
export function save(data: UserSaveParams) {
  const url = data.id ? `/user/${data.id}` : "/user";
  const method = data.id ? "put" : "post";
  return request[method]<User>(url, data);
}

/**
 * 获取修改的数据
 * @param id
 */
export function getEdit(id: string | number) {
  return request.get<User>(`/user/${id}/edit`);
}

/**
 * 软删除用户
 * @param id
 */
export function destroy(id: string | number) {
  return request.delete(`/user/${id}`);
}

/**
 * 硬删除用户（永久删除）
 * @param id
 */
export function hardDelete(id: string | number) {
  return request.delete(`/user/hardDelete/${id}`);
}

/**
 * 恢复已删除用户
 * @param id
 */
export function restore(id: string | number) {
  return request.put(`/user/restore/${id}`);
}

/**
 * 修改状态
 * @param id
 */
export function changeStatus(id: string | number) {
  return request.put(`/user/changeStatus/${id}`);
}

/**
 * 重置密码
 * @param id
 */
export function resetPassword(id: string | number) {
  return request.put(`/user/resetPassword/${id}`);
}

/**
 * 更新个人信息
 * @param data
 */
export function updateInfo(data: UserSaveParams) {
  return request.put("/user/updateInfo", data);
}

/**
 * 修改密码
 * @param data
 */
export function changePassword(data: Record<string, any>) {
  return request.put("/user/changePassword", data);
}
