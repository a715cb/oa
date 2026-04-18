<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\DictService;
use app\adminapi\validate\system\DictValidate;

/**
 * 字典控制器
 * Class Dict
 * @package app\adminapi\controller\system
 */
class Dict extends BaseController
{
    private DictService $service;

    public function __construct(DictService $service, \think\App $app)
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
     * 获取字典缓存
     * @return \think\Response
     */
    public function get(): \think\Response
    {
        $type = $this->request->param('type');
        $str = $this->request->param('str/b', false);
        $data = $this->service->getDictData($type, $str);
        return $data ? $this->success($data, '字典获取成功') : $this->error('字典获取失败');
    }

    /**
     * 新增
     * @return \think\Response
     */
    public function save(DictValidate $DictValidate): \think\Response
    {
        $data = $DictValidate->validated();
        $result = $this->service->save($data);
        return $result ? $this->success('添加成功') : $this->error('添加失败');
    }

    /**
     * 更新
     * @param int $id 字典ID
     * @return \think\Response
     */
    public function update(int $id, DictValidate $DictValidate): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $DictValidate->validated();
        $result = $this->service->update($validatedId, $data);
        return $result ? $this->success('更新成功') : $this->error('更新失败');
    }

    /**
     * 更新排序
     * @return \think\Response
     */
    public function updateSort(): \think\Response
    {
        $data = $this->request->param();
        $this->service->updateSort($data);
        return $this->success('更新成功');
    }

    /**
     * 删除
     * @param int $id 字典ID
     * @return \think\Response
     */
    public function delete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->delete($validatedId);
        return $result ? $this->success('删除成功') : $this->error('删除失败');
    }

    /**
     * 修改状态
     * @param int $id 字典ID
     * @return \think\Response
     */
    public function changeStatus(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->changeStatus($validatedId);
        return $result ? $this->success('修改成功') : $this->error('修改失败');
    }

    /**
     * 更新字典缓存
     * @return \think\Response
     */
    public function updateCache(): \think\Response
    {
        $result = $this->service->updateCache();
        return $result ? $this->success('缓存更新成功') : $this->error('缓存更新失败');
    }
}
