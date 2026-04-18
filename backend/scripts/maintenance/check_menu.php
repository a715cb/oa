<?php
// 检查菜单数据
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

// 查询用户管理菜单
echo "=== 查询'用户管理'菜单 ===\n";
$userMenu = Db::name('menu')->where('title', '用户管理')->select();
print_r($userMenu->toArray());

echo "\n=== 查询'/system/user'路径的菜单 ===\n";
$userMenu2 = Db::name('menu')->where('path', '/system/user')->select();
print_r($userMenu2->toArray());

echo "\n=== 查询'回收站'菜单 ===\n";
$recycledMenu = Db::name('menu')->where('title', '回收站')->select();
print_r($recycledMenu->toArray());

echo "\n=== 查询'/system/user/recycled'路径的菜单 ===\n";
$recycledMenu2 = Db::name('menu')->where('path', '/system/user/recycled')->select();
print_r($recycledMenu2->toArray());

echo "\n=== 最新5条菜单记录 ===\n";
$latestMenus = Db::name('menu')->order('id', 'desc')->limit(5)->select();
foreach ($latestMenus as $menu) {
    echo "ID: {$menu['id']}, PID: {$menu['pid']}, 名称: {$menu['title']}, 路径: {$menu['path']}, 组件: {$menu['component']}\n";
}
