<?php

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\permission\MenuService;
use core\exception\FailedException;

class Menu extends BaseController
{

    private $service;

    function __construct(MenuService $service)
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
     * 获取路由
     * 
     * @return  \think\Response
     */
    public function getRouter()
    {
        $menus = $this->service->getRouter();
        $this->success($menus);
    }


    /**
     * 新增
     *
     * @return \think\Response
     */
    public function save()
    {
        $data = $this->request->param();
        $this->validateMenuData($data);
        $result = $this->service->save($data);
        $result ? $this->success('添加成功') : $this->error('添加失败');
    }



    /**
     * 更新
     *
     * @param  int  $id
     * @return \think\Request
     */
    public function update($id)
    {
        $data = $this->request->param();
        $this->validateMenuData($data);
        $result = $this->service->update($id, $data);
        $result ? $this->success('更新成功') : $this->error('更新失败');
    }


    /**
     * 删除
     *
     * @param  int  $id
     * @return \think\Response
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
     * 验证菜单数据
     *
     * @param array $data
     * @return void
     */
    private function validateMenuData(array $data)
    {
        if (isset($data['name'])) {
            $name = trim($data['name']);
            if (mb_strlen($name) > 100) {
                throw new FailedException('菜单名称长度超出限制');
            }
            if (!preg_match('/^[\x{4e00}-\x{9fa5}a-zA-Z0-9_\-\/\s]+$/u', $name)) {
                throw new FailedException('菜单名称包含非法字符');
            }
            $data['name'] = $name;
        }

        if (isset($data['path'])) {
            $path = trim($data['path']);
            if (mb_strlen($path) > 200) {
                throw new FailedException('路径长度超出限制');
            }
            if (!preg_match('/^[a-zA-Z0-9_\-\/\.\?\=\&\#]*$/u', $path)) {
                throw new FailedException('路径包含非法字符');
            }
            $data['path'] = $path;
        }

        if (isset($data['component'])) {
            $component = trim($data['component']);
            if (mb_strlen($component) > 200) {
                throw new FailedException('组件路径长度超出限制');
            }
            if (!preg_match('/^[a-zA-Z0-9_\-\/\.]+$/u', $component)) {
                throw new FailedException('组件路径包含非法字符');
            }
            $data['component'] = $component;
        }

        if (isset($data['icon']) && !empty($data['icon'])) {
            $icon = trim($data['icon']);
            if (mb_strlen($icon) > 100) {
                throw new FailedException('图标名称长度超出限制');
            }
            if (!preg_match('/^[a-z0-9\-]+$/u', $icon)) {
                throw new FailedException('图标名称格式不正确');
            }
            $data['icon'] = $icon;
        }

        if (isset($data['sort'])) {
            $sort = intval($data['sort']);
            if ($sort < 0 || $sort > 9999) {
                throw new FailedException('排序值超出范围');
            }
            $data['sort'] = $sort;
        }

        if (isset($data['parent_id'])) {
            $parentId = intval($data['parent_id']);
            if ($parentId < 0) {
                throw new FailedException('父级ID格式不正确');
            }
            $data['parent_id'] = $parentId;
        }

        if (isset($data['type'])) {
            $type = intval($data['type']);
            if (!in_array($type, [0, 1, 2, 3])) {
                throw new FailedException('菜单类型不正确');
            }
            $data['type'] = $type;
        }
    }
}
