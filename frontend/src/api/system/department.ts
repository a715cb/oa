import request from "@/utils/request";
import type { Department, DeptListParams, DeptSaveParams } from "@/@types/system";

/**
 * 获取部门列表
 * @param params
 */
export function getDeptList(params?: DeptListParams) {
  return request.get<Department[]>("/department", { params });
}

/**
 * 保存
 * @param data
 */
export function save(data: DeptSaveParams) {
  return request<Department>({
    url: data.id ? `/department/${data.id}` : "/department",
    method: data.id ? "put" : "post",
    data
  });
}

/**
 * 删除部门
 * @param id
 */
export function destroy(id: string) {
  return request.delete(`/department/${id}`);
}

/**
 * 获取修改的数据
 * @param id
 */
export function getEdit(id: string) {
  return request.get<Department>(`/department/${id}/edit`);
}
