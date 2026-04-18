<?php
// 最终验证回收站配置
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 回收站最终验证 ===\n\n";

$recycled = Db::name('menu')->where('title', '回收站')->find();
if (!$recycled) {
    echo "❌ 未找到回收站\n";
    exit(1);
}

// 验证配置
$checks = [
    '类型=1 (菜单)' => $recycled['type'] == 1,
    '路径=recycled' => $recycled['path'] == 'recycled',
    '组件=system/user/recycled' => $recycled['component'] == 'system/user/recycled',
    '隐藏=1' => $recycled['hidden'] == 1,
    '权限标识存在' => !empty($recycled['rules']),
];

echo "配置检查:\n";
$allPassed = true;
foreach ($checks as $check => $passed) {
    $status = $passed ? '✅' : '❌';
    echo "  {$status} {$check}\n";
    if (!$passed) $allPassed = false;
}

// 验证权限分配
$access = Db::name('auth_access')
    ->where('menu_id', $recycled['id'])
    ->where('role_id', 1)
    ->find();

echo "\n权限检查:\n";
echo "  " . ($access ? "✅" : "❌") . " 超级管理员已分配权限\n";

// 验证已删除用户
$deletedCount = Db::name('user')->where('is_deleted', 1)->count();
echo "\n数据检查:\n";
echo "  已软删除用户: {$deletedCount} 个\n";

if ($deletedCount > 0) {
    echo "\n已删除用户列表:\n";
    $users = Db::name('user')
        ->where('is_deleted', 1)
        ->field('id,username,realname,delete_time')
        ->select();
    foreach ($users as $u) {
        echo "  - {$u['username']} ({$u['realname']}), 删除时间: " . date('Y-m-d H:i:s', $u['delete_time']) . "\n";
    }
}

echo "\n回收站访问路径: /system/user/recycled\n";
echo "访问方式: 用户管理页面 -> 工具栏 回收站 按钮\n";
