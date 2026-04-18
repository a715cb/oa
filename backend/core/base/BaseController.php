<?php
declare(strict_types=1);

namespace core\base;

use think\App;
use core\traits\ResponseTrait;
use think\exception\ValidateException;
use core\exception\FailedException;

/**
 * 控制器基类
 * Class BaseController
 * @package core\base
 */
abstract class BaseController
{
    use ResponseTrait;

    /**
     * Request实例
     * @var \think\Request
     */
    protected $request;

    /**
     * 应用实例
     * @var \think\App
     */
    protected $app;

    /**
     * 是否批量验证
     * @var bool
     */
    protected $batchValidate = false;

    /**
     * 控制器中间件
     * @var array
     */
    protected $middleware = [];

    /**
     * 构造方法
     * @access public
     * @param  App  $app  应用对象
     */
    public function __construct(App $app)
    {
        $this->app     = $app;
        $this->request = $this->app->request;
        // 控制器初始化
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
     * 验证ID是否为有效的正整数
     * @param mixed $id 待验证的ID
     * @return int 返回转换后的整数ID
     * @throws FailedException 当ID无效时抛出异常
     */
    protected function validateId($id): int
    {
        if (!is_numeric($id) || (int)$id <= 0) {
            throw new FailedException('ID参数错误');
        }
        return (int)$id;
    }

    /**
     * 统一执行并返回结果
     * @param callable $action 要执行的操作（闭包或可调用的方法）
     * @param string $successMsg 成功消息
     * @return \think\Response
     * @throws \Exception 当操作失败时抛出异常
     */
    protected function executeWithResult(callable $action, string $successMsg = '操作成功'): \think\Response
    {
        try {
            $result = $action();
            if ($result === false) {
                return $this->error('操作失败');
            }
            return $this->success(is_array($result) || is_object($result) ? $result : [], $successMsg);
        } catch (FailedException $e) {
            return $this->error($e->getMessage());
        } catch (\Exception $e) {
            return $this->error('操作失败：' . $e->getMessage());
        }
    }

    /**
     * 统一数据验证
     * @param string $validateClass 验证器类名（完整命名空间）
     * @param array $data 待验证的数据
     * @param string|null $scene 验证场景
     * @return array 验证后的数据
     * @throws ValidateException 当验证失败时抛出异常
     */
    protected function validateData(string $validateClass, array $data, ?string $scene = null): array
    {
        $validate = validate($validateClass);
        
        if ($scene) {
            $validate->scene($scene);
        }
        
        $validate->check($data);
        
        return $data;
    }
}
