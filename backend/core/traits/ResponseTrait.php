<?php
declare(strict_types=1);

namespace core\traits;

use core\facade\Json;

/**
 * 数据响应
 * trait ResponseTrait
 * @package core\traits
 */
trait ResponseTrait
{
    /**
     * 返回操作成功json
     * @param mixed $data 返回数据
     * @param string $msg 成功消息
     * @return \think\response\Json
     */
    protected function success(mixed $data = [], string $msg = 'success'): \think\response\Json
    {
        return Json::success($data, $msg);
    }

    /**
     * 返回操作失败json
     * @param string $msg 错误消息
     * @param mixed $data 附加数据
     * @return \think\response\Json
     */
    protected function error(string $msg = 'error', mixed $data = []): \think\response\Json
    {
        return Json::error($msg, $data);
    }
}
