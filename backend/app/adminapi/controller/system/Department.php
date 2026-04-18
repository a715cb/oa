<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\DepartmentService;
use app\adminapi\validate\system\DepartmentValidate;

/**
 * 部门控制器
 * Class Department
 * @package app\adminapi\controller\system
 */
class Department extends BaseController
{
    private DepartmentService $service;

    public function __construct(DepartmentService $service, \think\App $app)
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
     * 新增
     * @return \think\Response
     */
    public function save(): \think\Response
    {
        $data = $this->request->param(['name', 'parent_id', 'sort', 'leader_id' => '']);
        $this->validateData(DepartmentValidate::class, $data);
        $result = $this->service->save($data);
        return $result ? $this->success('添加成功') : $this->error('添加失败');
    }

    /**
     * 获取编辑的数据
     * @param int $id 部门ID
     * @return \think\Response
     */
    public function edit(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $this->service->edit($validatedId);
        return $this->success($data);
    }

    /**
     * 更新
     * @param int $id 部门ID
     * @return \think\Response
     */
    public function update(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $this->request->param(['id', 'name', 'parent_id', 'sort', 'leader_id' => '']);
        $this->validateData(DepartmentValidate::class, $data);
        $result = $this->service->update($validatedId, $data);
        return $result ? $this->success('更新成功') : $this->error('更新失败');
    }

    /**
     * 删除
     * @param int $id 部门ID
     * @return \think\Response
     */
    public function delete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->delete($validatedId);
        return $result ? $this->success('删除成功') : $this->error('删除失败');
    }
}
