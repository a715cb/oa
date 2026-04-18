<?php

declare(strict_types=1);

namespace app;

use app\service\user\AuthService;
use core\service\jwt\Factory;
use core\exception\FailedException;
use Spatie\Macroable\Macroable;
use app\model\system\User;

// 应用请求对象类
class Request extends \think\Request
{
    use Macroable;

    protected $filter = ['htmlspecialchars', 'trim'];

    protected ?int $uid = null;

    /**
     * 获取当前登录用户的 ID
     *
     * @return int 用户 ID，未登录时返回 0
     */
    public function uid(): int
    {
        if ($this->uid !== null) {
            return $this->uid;
        }

        try {
            $jwtAuth = Factory::getInstance();
            $claims = $jwtAuth->verifyAccessToken();
            $this->uid = (int) ($claims['id'] ?? 0);
        } catch (\Exception) {
            $this->uid = 0;
        }

        return $this->uid;
    }

    /**
     * 当前登录的后台用户
     *
     * @return User
     */
    public function user()
    {
        try {
            $user = app()->make(AuthService::class)->user();
        } catch (\Exception $e) {
              throw new FailedException($e->getMessage(), httpCode:401);
        }
        return $user;
    }
}
