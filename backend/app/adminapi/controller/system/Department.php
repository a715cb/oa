<?php

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\DepartmentService;
use app\adminapi\validate\system\DepartmentValidate;
use core\exception\FailedException;

class Department extends BaseController
{

    private $service;

    function __construct(DepartmentService $service)
    {
        parent::__construct();
        $this->service = $service;
    }



    /**
     * 列表
     * 
     * @return \think\Response
     */
    public function index()
    {
        $data = $this->service->getList();
        $this->success($data);
    }


    /**
     * 新增
     *
     * @param  \think\Request
     * @return \think\Response
     */
    public function save()
    {
        $data = $this->request->param(['name', 'parent_id', 'sort', 'leader_id' => '']);
        $this->validateDepartmentData($data);
        validate(DepartmentValidate::class)->check($data);
        $result = $this->service->save($data);
        $result ? $this->success('添加成功') : $this->error('添加失败');
    }


    /**
     * 获取编辑的数据
     *
     * @param  int  $id
     * @return \think\Response 
     */
    public function edit($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            throw new FailedException('参数错误');
        }
        $data = $this->service->edit($id);
        $this->success($data);
    }


    /**
     * 更新
     *
     * @param  int  $id
     * @return \think\Response
     */
    public function update($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            throw new FailedException('参数错误');
        }
        $data = $this->request->param(['id', 'name', 'parent_id', 'sort',  'leader_id' => '']);
        $this->validateDepartmentData($data);
        validate(DepartmentValidate::class)->check($data);
        $result = $this->service->update($id, $data);
        $result ? $this->success('更新成功') : $this->error('更新失败');
    }


    /**
     * 删除
     *
     * @param  int  $id
     * @return mixed
     */
    public function delete($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            throw new FailedException('参数错误');
        }
        $result = $this->service->delete($id);
        $result ? $this->success('删除成功') : $this->error('删除失败');
    }

    /**
     * 验证部门数据
     *
     * @param array $data
     * @return void
     */
    private function validateDepartmentData(array $data)
    {
        if (isset($data['name'])) {
            $name = trim($data['name']);
            if (empty($name)) {
                throw new FailedException('部门名称不能为空');
            }
            if (mb_strlen($name) > 100) {
                throw new FailedException('部门名称长度超出限制');
            }
            if (!preg_match('/^[\x{4e00}-\x{9fa5}a-zA-Z0-9_\-\(\)\s]+$/u', $name)) {
                throw new FailedException('部门名称包含非法字符');
            }
            $data['name'] = $name;
        }

        if (isset($data['leader_id']) && !empty($data['leader_id'])) {
            $leaderId = intval($data['leader_id']);
            if ($leaderId <= 0) {
                throw new FailedException('负责人ID格式不正确');
            }
            $data['leader_id'] = $leaderId;
        }

        if (isset($data['parent_id'])) {
            $parentId = intval($data['parent_id']);
            if ($parentId < 0) {
                throw new FailedException('父级部门ID格式不正确');
            }
            $data['parent_id'] = $parentId;
        }

        if (isset($data['sort'])) {
            $sort = intval($data['sort']);
            if ($sort < 0 || $sort > 9999) {
                throw new FailedException('排序值超出范围');
            }
            $data['sort'] = $sort;
        }
    }
}
