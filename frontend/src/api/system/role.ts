import request from "@/utils/request";
import type { Role, RoleListParams, RoleSaveParams, RoleAuthParams, RoleAuthResponse } from "@/@types/system";

/**
 * 获取角色列表
 * @param params
 */
export function getRoleList(params: RoleListParams) {
  return request.get<Role[]>("/role", { params });
}

/**
 * 获取所有角色
 */
export function getRoleAll() {
  return request.get<Role[]>("/role/all");
}

/**
 * 获取角色权限
 * @param id
 */
export function getTreeAuth(id: string) {
  return request.get<RoleAuthResponse>("/authAccess", { params: { id } });
}

/**
 * 保存角色权限
 * @param data
 */
export function saveAuth(data: RoleAuthParams) {
  return request.post<void>("/authAccess", data);
}

/**
 * 保存
 * @param data
 */
export function save(data: RoleSaveParams) {
  return request<Role>({
    url: data.id ? `/role/${data.id}` : "/role",
    method: data.id ? "put" : "post",
    data
  });
}

/**
 * 删除
 * @param id
 */
export function destroy(id: string) {
  return request.delete(`/role/${id}`);
}

/**
 * 获取修改的数据
 * @param id
 */
export function getEdit(id: string) {
  return request.get<Role>(`/role/${id}/edit`);
}
