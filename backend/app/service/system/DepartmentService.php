<?php
declare(strict_types=1);

namespace app\service\system;

use core\base\BaseService;
use app\model\system\{Department, User};
use core\exception\FailedException;

/**
 * 部门服务类
 * Class DepartmentService
 * @package app\service\system
 */
class DepartmentService extends BaseService
{
    public function __construct(Department $model)
    {
        $this->model = $model;
    }

    /**
     * 获取列表
     * @return mixed
     */
    public function getList(): mixed
    {
        return $this->model->search()->field(['*', 'id' => 'value', 'name' => 'title'])->select()->toTree(0, 'parent_id');
    }

    /**
     * 保存
     * @param array $data 部门数据
     * @return int|bool
     */
    public function save(array $data): int|bool
    {
        return $this->model->storeBy($data);
    }

    /**
     * 修改
     * @param int $id 部门ID
     * @param array $data 更新数据
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        return $this->model->updateBy($id, $data);
    }

    /**
     * 获取编辑的数据
     * @param int $id 部门ID
     * @return mixed
     */
    public function edit(int $id): mixed
    {
        $data = $this->model->findOrFail($id);
        $data->leader_user = User::where('id', $data->leader_id)->field('id,realname')->find();
        return $data;
    }

    /**
     * 删除
     * @param int $id 部门ID
     * @return bool
     * @throws FailedException
     */
    public function delete(int $id): bool
    {
        $data = $this->model->find($id);
        if (!$data) {
            throw new FailedException('数据不存在');
        }
        //是否存在子部门
        $children = $this->model->where('parent_id', $id)->find();
        if ($children) {
            throw new FailedException('存在子部门,无法删除!');
        }
        //是否存在用户
        $user = User::where('dept_id', $id)->find();
        if (!is_null($user)) {
            throw new FailedException('该部门下存在用户,无法删除!');
        }
        return $this->model->deleteBy($id);
    }
}
