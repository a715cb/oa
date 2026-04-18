<?php
// 检查回收站菜单配置
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 回收站菜单详细信息 ===\n";
$recycled = Db::name('menu')->where('title', '回收站')->find();
if ($recycled) {
    echo "ID: {$recycled['id']}\n";
    echo "PID: {$recycled['pid']}\n";
    echo "名称: {$recycled['title']}\n";
    echo "路径: {$recycled['path']}\n";
    echo "组件: {$recycled['component']}\n";
    echo "类型: {$recycled['type']} (0=目录, 1=菜单, 2=权限)\n";
    echo "隐藏: {$recycled['hidden']} (0=显示, 1=隐藏)\n";
    echo "排序: {$recycled['sort']}\n";
} else {
    echo "未找到回收站菜单\n";
}

echo "\n=== 用户管理子菜单列表 ===\n";
$userMenu = Db::name('menu')->where('title', '用户管理')->find();
if ($userMenu) {
    $children = Db::name('menu')->where('pid', $userMenu['id'])->select();
    foreach ($children as $child) {
        echo "ID: {$child['id']}, 名称: {$child['title']}, 类型: {$child['type']}, 隐藏: {$child['hidden']}\n";
    }
}
