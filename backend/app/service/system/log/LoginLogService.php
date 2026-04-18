<?php
declare(strict_types=1);

namespace app\service\system\log;

use core\base\BaseService;
use app\model\system\LoginLog;
use think\facade\Db;

/**
 * 登录日志服务类
 * Class LoginLogService
 * @package app\service\system\log
 */
class LoginLogService extends BaseService
{
    public function __construct(LoginLog $model)
    {
        $this->model = $model;
    }

    /**
     * 获取列表
     * @return mixed
     */
    public function getList(): mixed
    {
        return $this->model->search()->order('id', 'desc')->with(['user'])->paginate();
    }

    /**
     * 删除
     * @param mixed $id 日志ID
     * @return mixed
     */
    public function delete(mixed $id): mixed
    {
        return $this->model->deleteBy($id);
    }

    /**
     * 清空登录日志
     * @return int
     */
    public function clear(): int
    {
        $tableName = $this->model->getTable(); // 获取当前模型的表名
        return Db::execute("TRUNCATE TABLE {$tableName}");
    }

    /**
     * 导出日志
     * @return void
     */
    public function export(): void
    {
        $column = [
            'account' => '登录账号',
            'realname' => '姓名',
            'login_ip' => '登录IP',
            'login_time' => '登录时间',
            'browser' => '浏览器',
            'os' => '操作系统',
        ];
        $this->model->search()->order('id', 'desc')->with(['user'])->select()->export('登录日志', $column);
    }
}
