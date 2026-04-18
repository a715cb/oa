<?php
// 排查用户管理和回收站菜单问题
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 用户管理菜单信息 ===\n";
$userMenu = Db::name('menu')->where('title', '用户管理')->find();
if ($userMenu) {
    print_r($userMenu);
} else {
    echo "❌ 未找到用户管理菜单\n";
    exit(1);
}

echo "\n=== 回收站菜单信息 ===\n";
$recycled = Db::name('menu')->where('title', '回收站')->find();
if ($recycled) {
    print_r($recycled);
} else {
    echo "❌ 未找到回收站菜单\n";
    exit(1);
}

echo "\n=== 检查是否存在冲突的菜单配置 ===\n";
// 检查是否有重复或配置错误的菜单
$conflicts = Db::name('menu')
    ->where('pid', $userMenu['id'])
    ->where('hidden', 0)
    ->where('type', 1)
    ->select();

if ($conflicts->count() > 1) {
    echo "⚠️  发现多个子菜单可能导致冲突：\n";
    foreach ($conflicts as $menu) {
        echo "  ID: {$menu['id']}, 名称: {$menu['title']}, 路径: {$menu['path']}\n";
    }
}

echo "\n=== 已删除用户数量 ===\n";
$deletedCount = Db::name('user')->where('is_deleted', 1)->count();
echo "已删除用户: {$deletedCount} 个\n";

if ($deletedCount > 0) {
    echo "\n已删除用户列表:\n";
    $deletedUsers = Db::name('user')
        ->where('is_deleted', 1)
        ->field('id,username,realname,delete_time,is_deleted')
        ->select();
    foreach ($deletedUsers as $user) {
        echo "  ID: {$user['id']}, 用户名: {$user['username']}, 删除时间: {$user['delete_time']}\n";
    }
} else {
    echo "⚠️  当前没有已删除用户，请先测试软删除功能\n";
}
