<?php
// 清理并重新创建回收站菜单
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

try {
    // 删除可能存在的回收站菜单
    $recycled = Db::name('menu')->where('title', '回收站')->find();
    if ($recycled) {
        echo "发现已存在的回收站菜单，ID: " . $recycled['id'] . "\n";
        echo "删除旧数据...\n";
        Db::name('auth_access')->where('menu_id', $recycled['id'])->delete();
        Db::name('menu')->where('id', $recycled['id'])->delete();
        echo "旧数据已删除\n";
    }
    
    // 确认用户管理菜单ID
    $userMenu = Db::name('menu')->where('title', '用户管理')->find();
    if (!$userMenu) {
        echo "❌ 未找到用户管理菜单\n";
        exit(1);
    }
    echo "\n用户管理菜单ID: " . $userMenu['id'] . "\n";
    
    // 插入回收站子菜单
    echo "创建回收站菜单...\n";
    $menuId = Db::name('menu')->insertGetId([
        'pid' => $userMenu['id'],
        'path' => 'recycled',
        'component' => 'system/user/recycled',
        'title' => '回收站',
        'icon' => 'delete-outlined',
        'rules' => 'system:user:recycled',
        'sort' => 10,
        'type' => 1
    ]);
    echo "菜单创建成功，ID: " . $menuId . "\n";
    
    // 为超级管理员角色(角色ID=1)添加此菜单权限
    echo "分配权限...\n";
    Db::name('auth_access')->insert([
        'menu_id' => $menuId,
        'role_id' => 1
    ]);
    echo "权限分配成功\n";
    
    // 验证
    echo "\n✅ 回收站菜单创建完成！\n";
    echo "菜单ID: " . $menuId . "\n";
    echo "父级ID: " . $userMenu['id'] . "\n";
    echo "路径: recycled\n";
    echo "组件: system/user/recycled\n";
    
} catch (\Exception $e) {
    echo "❌ 执行失败: " . $e->getMessage() . "\n";
    exit(1);
}
