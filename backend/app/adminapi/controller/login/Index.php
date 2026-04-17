<?php

namespace app\adminapi\controller\login;

use core\base\BaseController;
use app\service\user\AuthService;
use core\exception\FailedException;

class Index extends BaseController
{
    /**
     * 登录
     * @return \think\Response
     */
    public function login(AuthService $auth)
    {
        $username = trim($this->request->post('username'));
        $password = $this->request->post('password');
        
        if (!$username || !$password) {
            throw new FailedException('用户名或密码不能为空');
        }
        
        if (mb_strlen($username) > 50 || mb_strlen($password) > 100) {
            throw new FailedException('用户名或密码长度超出限制');
        }
        
        if (!preg_match('/^[a-zA-Z0-9_\x{4e00}-\x{9fa5}]+$/u', $username)) {
            throw new FailedException('用户名格式不正确');
        }
        
        $token = $auth->login($username, $password);
        $this->success($token, '登录成功');
    }

    /**
     * 退出登录
     * @return \think\Response
     */
    public function logout(AuthService $auth)
    {
        $refreshToken = trim($this->request->post('refreshToken'));
        if ($refreshToken) {
            $auth->logout($refreshToken);
            $this->success('退出登录成功');
        }
        $this->error('退出登录失败');
    }

    
    /**
     * 刷新令牌
     * @return \think\Response
     */
    public function refreshToken(AuthService $auth)
    {
        try {
            $token = $auth->refreshToken();
        } catch (\Exception $e) {
           throw new FailedException('令牌刷新失败', httpCode: 401);
        }
        $this->success($token);
    }
}
