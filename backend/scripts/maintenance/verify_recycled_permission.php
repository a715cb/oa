<?php
// 验证回收站权限配置
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 回收站当前配置 ===\n";
$recycled = Db::name('menu')->where('title', '回收站')->find();
if ($recycled) {
    echo "ID: {$recycled['id']}\n";
    echo "类型: {$recycled['type']} (0=目录, 1=菜单, 2=权限)\n";
    echo "路径: {$recycled['path']}\n";
    echo "组件: {$recycled['component']}\n";
    echo "隐藏: {$recycled['hidden']}\n";
    echo "权限标识: {$recycled['rules']}\n";
} else {
    echo "❌ 未找到回收站\n";
    exit(1);
}

echo "\n=== 已分配回收站权限的角色 ===\n";
$access = Db::name('auth_access')
    ->alias('aa')
    ->join('role r', 'aa.role_id = r.id')
    ->where('aa.menu_id', $recycled['id'])
    ->field('aa.role_id, r.name')
    ->select();

if ($access->count() > 0) {
    foreach ($access as $a) {
        echo "角色ID: {$a['role_id']}, 角色名称: {$a['name']}\n";
    }
} else {
    echo "未分配任何角色\n";
}

echo "\n=== 用户管理子菜单列表 ===\n";
$userMenu = Db::name('menu')->where('title', '用户管理')->find();
$children = Db::name('menu')
    ->where('pid', $userMenu['id'])
    ->where('type', 1)
    ->select();

foreach ($children as $child) {
    echo "ID: {$child['id']}, 名称: {$child['title']}, 隐藏: {$child['hidden']}\n";
}
