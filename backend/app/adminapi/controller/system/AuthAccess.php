<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\permission\AuthAccessService;

/**
 * 权限访问控制器
 * Class AuthAccess
 * @package app\adminapi\controller\system
 */
class AuthAccess extends BaseController
{
    private AuthAccessService $service;

    public function __construct(AuthAccessService $service, \think\App $app)
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
        $roleId = $this->request->param('id');
        $data = $this->service->getList($roleId);
        return $this->success($data);
    }

    /**
     * 新增
     * @return \think\Response
     */
    public function save(): \think\Response
    {
        $roleId = $this->request->param('role_id');
        $menuId = $this->request->param('menu_id');
        $this->service->save($roleId, $menuId);
        return $this->success('权限设置成功');
    }
}
