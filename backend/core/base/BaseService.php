<?php
declare(strict_types=1);

namespace core\base;

use core\traits\TransTrait;

/**
 * 服务基类
 * Class BaseService
 * @package core\base
 */
abstract class BaseService
{
    use TransTrait;

    /**
     * 模型注入
     * @var mixed
     */
    protected $model;

    /**
     * 错误信息
     * @var string
     */
    protected string $error = '';

    /**
     * 应用实例
     * @var \think\App
     */
    protected $app;

    /**
     * 构造方法
     * @access public
     */
    public function __construct()
    {
        $this->app = app();
        // 服务初始化
        $this->initialize();
    }

    /**
     * 初始化
     * @return void
     */
    protected function initialize(): void
    {
    }

    /**
     * 获取错误描述
     * @return string
     */
    public function getError(): string
    {
        return $this->error;
    }

    /**
     * 设置错误信息
     * @param string $error 错误信息
     * @return void
     */
    protected function setError(string $error): void
    {
        $this->error = $error;
    }

    /**
     * 统一事务包装方法
     * 执行传入的闭包函数，成功则提交事务，失败则回滚并抛出异常
     * 
     * @param \Closure $callback 要执行的业务逻辑闭包
     * @param string $errorMsg 失败时的错误信息（可选）
     * @return mixed 闭包执行结果
     * @throws \Exception 当闭包执行失败时抛出异常
     */
    public function withTransaction(\Closure $callback, string $errorMsg = '事务执行失败'): mixed
    {
        try {
            $result = $this->transaction($callback);
            return $result;
        } catch (\Exception $e) {
            $this->setError($errorMsg . '：' . $e->getMessage());
            throw new \RuntimeException($errorMsg . '：' . $e->getMessage(), (int)$e->getCode(), $e);
        }
    }
}
