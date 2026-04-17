<?php
// +----------------------------------------------------------------------
// | Cookie设置
// +----------------------------------------------------------------------
return [
    // cookie 保存时间
    'expire'    => 0,
    // cookie 保存路径
    'path'      => '/',
    // cookie 有效域名
    'domain'    => '',
    // SEC-020: 启用安全传输，生产环境应设置为 true
    'secure'    => false,
    // SEC-020: 启用 httponly，防止 JavaScript 访问 Cookie
    'httponly'  => true,
    // 是否使用 setcookie
    'setcookie' => true,
    // SEC-020: 设置 samesite，防止 CSRF 攻击
    'samesite'  => 'Lax',
];
