<?php
declare(strict_types=1);

namespace app\service\user;

use think\facade\Cache;
use think\facade\Request;

class LoginLimitService
{
    protected string $cachePrefix = 'login_attempts_';
    protected int $maxAttempts = 10;
    protected int $lockoutTime = 600; // 单位为秒，即10分钟

    public function __construct(int $maxAttempts = 10, int $lockoutTime = 600)
    {
        $this->maxAttempts = $maxAttempts;
        $this->lockoutTime = $lockoutTime;
    }

    /**
     * 检查是否需要锁定
     *
     * @param string $username 用户名
     * @return bool
     */
    public function checkLockout(string $username): bool
    {
        $ip = Request::ip();
        $cacheKey = $this->getCacheKey($ip, $username);

        // SEC-015: 同时检查 IP+用户名 和 纯用户名 两个维度的锁定状态
        // 如果任一维度被锁定，则拒绝登录
        if ($this->checkLockoutByKey($cacheKey)) {
            return true;
        }

        // 检查纯用户名维度的锁定
        $usernameCacheKey = $this->getUsernameCacheKey($username);
        if ($this->checkLockoutByKey($usernameCacheKey)) {
            return true;
        }

        return false;
    }

    /**
     * SEC-015: 根据指定键检查锁定状态
     *
     * @param string $cacheKey 缓存键
     * @return bool
     */
    protected function checkLockoutByKey(string $cacheKey): bool
    {
        $attemptsInfo = Cache::get($cacheKey);

        if (!$attemptsInfo) {
            return false;
        }

        if ($attemptsInfo['count'] >= $this->maxAttempts && (time() - $attemptsInfo['last_attempt_time']) < $this->lockoutTime) {
            return true;
        }

        return false;
    }

    /**
     * 记录一次失败的登录尝试
     *
     * @param string $username 用户名
     */
    public function recordFailedAttempt(string $username): void
    {
        $ip = Request::ip();
        $cacheKey = $this->getCacheKey($ip, $username);
        $this->recordFailedAttemptByKey($cacheKey);

        // SEC-015: 同时记录纯用户名维度的失败尝试
        $usernameCacheKey = $this->getUsernameCacheKey($username);
        $this->recordFailedAttemptByKey($usernameCacheKey);
    }

    /**
     * SEC-015: 根据指定键记录失败尝试
     *
     * @param string $cacheKey 缓存键
     */
    protected function recordFailedAttemptByKey(string $cacheKey): void
    {
        $attemptsInfo = Cache::get($cacheKey) ?: ['count' => 0, 'last_attempt_time' => time()];

        $attemptsInfo['count'] += 1;
        $attemptsInfo['last_attempt_time'] = time();

        Cache::set($cacheKey, $attemptsInfo, $this->lockoutTime);
    }

    /**
     * 清除登录尝试记录
     *
     * @param string $username 用户名
     */
    public function clearAttempts(string $username): void
    {
        $ip = Request::ip();
        $cacheKey = $this->getCacheKey($ip, $username);
        Cache::delete($cacheKey);

        // SEC-015: 同时清除纯用户名维度的尝试记录
        $usernameCacheKey = $this->getUsernameCacheKey($username);
        Cache::delete($usernameCacheKey);
    }

    /**
     * 获取缓存键名
     *
     * @param string $ip
     * @param string $username
     * @return string
     */
    protected function getCacheKey(string $ip, string $username): string
    {
        return $this->cachePrefix . md5($ip . '_' . $username);
    }

    /**
     * SEC-015: 获取纯用户名维度的缓存键名
     * 防止攻击者使用多个 IP 绕过锁定机制
     *
     * @param string $username
     * @return string
     */
    protected function getUsernameCacheKey(string $username): string
    {
        return $this->cachePrefix . 'username_' . md5($username);
    }
}
