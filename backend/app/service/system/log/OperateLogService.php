<?php
declare(strict_types=1);

namespace app\service\system\log;

use core\base\BaseService;
use app\model\system\OperateLog;
use think\facade\Db;

/**
 * 操作日志服务类
 * Class OperateLogService
 * @package app\service\system\log
 */
class OperateLogService extends BaseService
{
    public function __construct(OperateLog $model)
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
     * 清空操作日志
     * @return int
     */
    public function clear(): int
    {
        $tableName = $this->model->getTable(); // 获取当前模型的表名
        return Db::execute("TRUNCATE TABLE {$tableName}");
    }
}
