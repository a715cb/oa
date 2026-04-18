<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\permission\MenuService;
use app\adminapi\validate\system\MenuValidate;

/**
 * 菜单控制器
 * Class Menu
 * @package app\adminapi\controller\system
 */
class Menu extends BaseController
{
    private MenuService $service;

    public function __construct(MenuService $service, \think\App $app)
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
     * 获取路由
     * @return \think\Response
     */
    public function getRouter(): \think\Response
    {
        $menus = $this->service->getRouter();
        return $this->success($menus);
    }

    /**
     * 新增
     * @return \think\Response
     */
    public function save(): \think\Response
    {
        $data = $this->request->param();
        $this->validateData(MenuValidate::class, $data);
        $result = $this->service->save($data);
        return $result ? $this->success('添加成功') : $this->error('添加失败');
    }

    /**
     * 更新
     * @param int $id 菜单ID
     * @return \think\Response
     */
    public function update(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $this->request->param();
        $this->validateData(MenuValidate::class, $data);
        $result = $this->service->update($validatedId, $data);
        return $result ? $this->success('更新成功') : $this->error('更新失败');
    }

    /**
     * 删除
     * @param int $id 菜单ID
     * @return \think\Response
     */
    public function delete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->delete($validatedId);
        return $result ? $this->success('删除成功') : $this->error('删除失败');
    }
}
