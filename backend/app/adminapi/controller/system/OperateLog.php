<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\log\OperateLogService;

/**
 * 操作日志控制器
 * Class OperateLog
 * @package app\adminapi\controller\system
 */
class OperateLog extends BaseController
{
    private OperateLogService $service;

    public function __construct(OperateLogService $service)
    {
        parent::__construct(app());
        $this->service = $service;
    }

    /**
     * 列表
     * @return \think\Response
     */
    public function index(): \think\Response
    {
        return $this->success($this->service->getList());
    }

    /**
     * 删除
     * @return \think\Response
     */
    public function delete(): \think\Response
    {
        $id = $this->request->param('id');
        $result = $this->service->delete($id);
        return $result ? $this->success('删除成功') : $this->error('删除失败');
    }

    /**
     * 清空操作日志
     * @return \think\Response
     */
    public function clear(): \think\Response
    {
        $this->service->clear();
        return $this->success('清空成功');
    }
}
