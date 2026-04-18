<?php
// 检查菜单结构
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 用户管理相关菜单 ===\n";
$menus = Db::name('menu')
    ->whereIn('id', function($query) {
        $query->name('menu')->where('title', '用户管理')->field('id');
    })
    ->whereOr('pid', function($query) {
        $query->name('menu')->where('title', '用户管理')->field('id');
    })
    ->select();

foreach ($menus as $menu) {
    echo "ID: {$menu['id']}, PID: {$menu['pid']}, 名称: {$menu['title']}, 路径: {$menu['path']}, 类型: {$menu['type']}, 隐藏: {$menu['hidden']}\n";
}

echo "\n=== 回收站菜单详细信息 ===\n";
$recycled = Db::name('menu')->where('title', '回收站')->find();
if ($recycled) {
    print_r($recycled);
} else {
    echo "未找到回收站菜单\n";
}

echo "\n=== 左侧边栏可见的菜单 ===\n";
$sidebarMenus = Db::name('menu')->where('hidden', 0)->order('sort')->select();
foreach ($sidebarMenus as $menu) {
    echo "ID: {$menu['id']}, PID: {$menu['pid']}, 名称: {$menu['title']}, 路径: {$menu['path']}, 类型: {$menu['type']}\n";
}
