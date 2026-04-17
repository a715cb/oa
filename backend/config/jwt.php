<?php

use Lcobucci\JWT\Signer\Hmac\Sha256;

return [
    'default' => [
        // 自定义数据中必须存在uid的键值，这个key你可以自行定义，只要自定义数据中存在该键即可
        'key'                => 'id',
        // 密钥 - 生产环境必须通过环境变量配置，不允许使用默认值
        'secret'             => env('jwt.SECRET') ?: throw new \RuntimeException('JWT_SECRET must be configured in environment variables'),
        // 过期时间
        'ttl'                => env('jwt.TTL', 3600),
        // 刷新令牌过期时间
        'refresh_ttl'        => env('jwt.REFRESH_TTL', 7200),
        // jwt使用到的缓存前缀
        'cache_prefix'           => 'oa_jwt',
        // 黑名单缓存过期时间
        'blacklist_ttl' => 7200,
        //黑名单宽限期
        'blacklist_grace_period' => 10,
        // 签名算法 
        'alg' => new Sha256(),
    ],
    // 其他场景的令牌配置，比如api应用的令牌可以定义不同的密钥、过期时间满足多种类型的应用接口认证
    'api' => [
        'secret'     => env('jwt.API_SECRET') ?: throw new \RuntimeException('JWT_API_SECRET must be configured in environment variables'),
        'ttl'        => env('jwt.API_TTL', 3600),
        'refresh_ttl' => env('jwt.API_REFRESH_TTL', 7200),
    ],
];
