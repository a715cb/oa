<?php
// +----------------------------------------------------------------------
// | 控制台配置
// +----------------------------------------------------------------------
return [
    // 指令定义
    'commands' => [
        'migrate:run'       => 'core\command\MigrateDatabase',
        'install:database'  => 'core\command\InstallDatabase',
    ],
];
