<?php

namespace app\adminapi\event;

use app\model\system\{OperateLog, Menu};

class OperateLogEvent
{
    public function handle($permission)
    {

        $parentPermission = Menu::where('id', $permission->pid)->value('title');

        $requestParams = request()->param();

        // SEC-018: 过滤敏感信息，防止密码等敏感数据被记录到日志
        $sensitiveFields = ['password', 'password_old', 'password_confirm', 'token', 'refreshToken', 'refresh_token', 'access_token'];
        foreach ($sensitiveFields as $field) {
            if (isset($requestParams[$field])) {
                $requestParams[$field] = '***filtered***';
            }
        }

        // 如果参数过长则不记录
        if (!empty($requestParams)) {
            if (strlen(\json_encode($requestParams)) > 1000) {
                $requestParams = [];
            }
        }

        OperateLog::create([
            'user_id' => request()->uid(),
            'module'     => $parentPermission ?: '',
            'method'     => request()->method(),
            'operate'    => $permission->title,
            'route'      => $permission->rules,
            'params'     => !empty($requestParams) ? json_encode($requestParams, JSON_UNESCAPED_UNICODE) : '',
            'create_time' => time(),
            'ip'         => get_client_ip()
        ]);
    }
}
