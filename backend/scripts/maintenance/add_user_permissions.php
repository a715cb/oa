<?php
// 添加用户管理相关权限菜单
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

try {
    // 查找"用户管理"菜单ID
    $userMenu = Db::name('menu')->where('title', '用户管理')->find();
    if (!$userMenu) {
        echo "❌ 未找到用户管理菜单\n";
        exit(1);
    }
    $userMenuId = $userMenu['id'];
    echo "用户管理菜单ID: " . $userMenuId . "\n";

    // 检查并添加软删除权限
    $softDeleteMenu = Db::name('menu')->where('rules', 'system:user:delete')->find();
    if (!$softDeleteMenu) {
        echo "添加软删除权限...\n";
        Db::name('menu')->insert([
            'pid' => $userMenuId,
            'type' => 2,
            'rules' => 'system:user:delete',
            'title' => '软删除'
        ]);
        $menuId = Db::name('menu')->getLastInsID();
        Db::name('auth_access')->insert(['menu_id' => $menuId, 'role_id' => 1]);
        echo "✅ 软删除权限添加成功\n";
    } else {
        echo "⚠️  软删除权限已存在\n";
    }

    // 检查并添加硬删除权限
    $hardDeleteMenu = Db::name('menu')->where('rules', 'system:user:hardDelete')->find();
    if (!$hardDeleteMenu) {
        echo "添加硬删除权限...\n";
        Db::name('menu')->insert([
            'pid' => $userMenuId,
            'type' => 2,
            'rules' => 'system:user:hardDelete',
            'title' => '硬删除'
        ]);
        $menuId = Db::name('menu')->getLastInsID();
        Db::name('auth_access')->insert(['menu_id' => $menuId, 'role_id' => 1]);
        echo "✅ 硬删除权限添加成功\n";
    } else {
        echo "⚠️  硬删除权限已存在\n";
    }

    // 检查并添加恢复权限
    $restoreMenu = Db::name('menu')->where('rules', 'system:user:restore')->find();
    if (!$restoreMenu) {
        echo "添加恢复权限...\n";
        Db::name('menu')->insert([
            'pid' => $userMenuId,
            'type' => 2,
            'rules' => 'system:user:restore',
            'title' => '恢复用户'
        ]);
        $menuId = Db::name('menu')->getLastInsID();
        Db::name('auth_access')->insert(['menu_id' => $menuId, 'role_id' => 1]);
        echo "✅ 恢复权限添加成功\n";
    } else {
        echo "⚠️  恢复权限已存在\n";
    }

    // 检查并添加回收站查看权限
    $recycledMenu = Db::name('menu')->where('rules', 'system:user:recycled')->find();
    if (!$recycledMenu) {
        echo "添加回收站查看权限...\n";
        Db::name('menu')->insert([
            'pid' => $userMenuId,
            'type' => 2,
            'rules' => 'system:user:recycled',
            'title' => '回收站查看'
        ]);
        $menuId = Db::name('menu')->getLastInsID();
        Db::name('auth_access')->insert(['menu_id' => $menuId, 'role_id' => 1]);
        echo "✅ 回收站查看权限添加成功\n";
    } else {
        echo "⚠️  回收站查看权限已存在\n";
    }

    echo "\n✅ 所有权限菜单添加完成！\n";
    echo "请重新登录系统以刷新权限\n";

} catch (\Exception $e) {
    echo "❌ 执行失败: " . $e->getMessage() . "\n";
    exit(1);
}
