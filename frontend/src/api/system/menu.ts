import request from "@/utils/request";
import type { Menu, MenuListParams, MenuSaveParams } from "@/@types/system";

/**
 * 获取菜单列表
 * @param params
 */
export function getMenuList(params?: MenuListParams) {
  return request.get<Menu[]>("/menu", { params });
}

/**
 * 保存
 * @param data
 */
export function save(data: MenuSaveParams) {
  return request<Menu>({
    url: data.id ? `/menu/${data.id}` : "/menu",
    method: data.id ? "put" : "post",
    data
  });
}

/**
 * 删除
 * @param id
 */
export function destroy(id: string) {
  return request.delete(`/menu/${id}`);
}
