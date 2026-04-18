<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\adminapi\validate\system\RoleValidate;
use app\service\system\permission\RoleService;

/**
 * 角色控制器
 * Class Role
 * @package app\adminapi\controller\system
 */
class Role extends BaseController
{
    private RoleService $service;

    public function __construct(RoleService $service, \think\App $app)
    {
        parent::__construct($app);
        $this->service = $service;
    }

    /**
     * 列表
     * @return \think\Response
     */
    public function index(): \think\Response
    {
        $data = $this->service->getList();
        return $this->success($data);
    }

    /**
     * 所有角色
     * @return \think\Response
     */
    public function all(): \think\Response
    {
        $data = $this->service->getAll();
        return $this->success($data);
    }

    /**
     * 获取编辑的数据
     * @param int $id 角色ID
     * @return \think\Response
     */
    public function edit(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $this->service->edit($validatedId);
        return $this->success($data);
    }

    /**
     * 新增
     * @param RoleValidate $roleValidate 角色验证器
     * @return \think\Response
     */
    public function save(RoleValidate $roleValidate): \think\Response
    {
        $data = $roleValidate->validated();
        return $this->executeWithResult(
            fn() => $this->service->save($data),
            '角色新增成功'
        );
    }

    /**
     * 更新
     * @param int $id 角色ID
     * @param RoleValidate $roleValidate 角色验证器
     * @return \think\Response
     */
    public function update(int $id, RoleValidate $roleValidate): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $roleValidate->validated();
        return $this->executeWithResult(
            fn() => $this->service->update($validatedId, $data),
            '更新成功'
        );
    }

    /**
     * 删除
     * @param int $id 角色ID
     * @return \think\Response
     */
    public function delete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        return $this->executeWithResult(
            fn() => $this->service->delete($validatedId),
            '删除成功'
        );
    }
}
