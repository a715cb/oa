<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------
use think\facade\Route;
use think\middleware\Throttle;
use think\middleware\AllowCrossDomain;

// 登录相关路由（不需要认证，但需要 CORS 支持）
Route::group(function () {
    //账号登录
    Route::post('login', 'login.Index/login');
    //退出登录
    Route::post('logout', 'login.Index/logout');
    //刷新令牌
    Route::get('refreshToken', 'login.Index/refreshToken');
})->middleware(AllowCrossDomain::class);