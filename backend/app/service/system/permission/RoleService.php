<?php
declare(strict_types=1);

namespace app\service\system\permission;

use core\base\BaseService;
use app\model\system\Role;
use core\exception\FailedException;

/**
 * 角色服务类
 * Class RoleService
 * @package app\service\system\permission
 */
class RoleService extends BaseService
{
    public function __construct(Role $model)
    {
        $this->model = $model;
    }

    /**
     * 获取列表
     * @return mixed
     */
    public function getList(): mixed
    {
        return $this->model->search()->paginate();
    }

    /**
     * 获取所有列表
     * @return mixed
     */
    public function getAll(): mixed
    {
        return $this->model->field('id,name')->select();
    }

    /**
     * 保存
     * @param array $data 角色数据
     * @return int
     */
    public function save(array $data): int
    {
        $id = $this->model->storeBy($data);
        if ($data['data_range'] == 2) {
            $this->model->saveDepartments($data['departments']);
        }
        return $id;
    }

    /**
     * 更新
     * @param int $id 角色ID
     * @param array $data 更新数据
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $result = $this->model->updateBy($id, $data);
        $this->model->find($id)->updateDepartments($data['departments']);
        return $result;
    }

    /**
     * 获取编辑的数据
     * @param int $id 角色ID
     * @return mixed
     */
    public function edit(int $id): mixed
    {
        $role = $this->model->findOrFail($id);
        $role->departments = $role->getDepartmentId();
        return $role;
    }

    /**
     * 删除
     * @param int $id 角色ID
     * @return bool
     * @throws FailedException
     */
    public function delete(int $id): bool
    {
        // 超级管理员不能删除
        if ($id == config('system.super_admin_id')) {
            throw new FailedException('超级管理员不能删除');
        }
        $role = $this->model->find($id);
        if (!$role) {
            throw new FailedException('数据不存在');
        }
        // 判断角色是否已分配用户
        $isEmpty = $role->getUsers()->isEmpty();
        if (!$isEmpty) {
            throw new FailedException('删除失败,该角色已分配用户');
        }
        try {
            $this->transaction(function () use ($id, $role): void {
                // 删除角色
                $this->model->deleteBy($id);
                // 删除部门关联
                $role->departments()->detach();
                // 删除菜单关联
                $role->menus()->detach();
            });
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
