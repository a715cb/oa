<?php
// 修复回收站路由配置 - 恢复为隐藏菜单，保留权限控制
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

try {
    echo "=== 修复回收站路由配置 ===\n\n";

    // 1. 查找回收站记录
    $recycled = Db::name('menu')->where('title', '回收站')->find();
    
    if (!$recycled) {
        echo "❌ 未找到回收站记录，重新创建...\n";
        
        // 查找用户管理菜单ID
        $userMenu = Db::name('menu')->where('title', '用户管理')->find();
        if (!$userMenu) {
            echo "❌ 未找到用户管理菜单\n";
            exit(1);
        }
        
        $menuId = Db::name('menu')->insertGetId([
            'pid' => $userMenu['id'],
            'path' => 'recycled',
            'component' => 'system/user/recycled',
            'title' => '回收站',
            'icon' => 'delete-outlined',
            'rules' => 'system:user:recycled',
            'sort' => 10,
            'type' => 1,       // 恢复为菜单类型
            'hidden' => 1      // 隐藏在侧边栏
        ]);
        
        // 分配权限
        Db::name('auth_access')->insert([
            'menu_id' => $menuId,
            'role_id' => 1
        ]);
        
        echo "✅ 回收站菜单重新创建成功，ID: {$menuId}\n";
    } else {
        echo "当前回收站配置:\n";
        echo "  ID: {$recycled['id']}\n";
        echo "  类型: {$recycled['type']}\n";
        echo "  路径: {$recycled['path']}\n";
        echo "  组件: {$recycled['component']}\n\n";

        // 2. 修复配置 - 恢复为隐藏菜单
        echo "修复路由配置...\n";
        Db::name('menu')->where('id', $recycled['id'])->update([
            'type' => 1,                    // 恢复为菜单类型（需要路由）
            'path' => 'recycled',           // 恢复路由路径
            'component' => 'system/user/recycled',  // 恢复组件路径
            'hidden' => 1,                  // 隐藏在侧边栏（不在菜单中显示）
            'rules' => 'system:user:recycled'  // 保持权限标识
        ]);
        
        echo "✅ 回收站配置已修复\n\n";

        // 3. 验证修复结果
        $recycled = Db::name('menu')->where('id', $recycled['id'])->find();
        echo "修复后配置:\n";
        echo "  ID: {$recycled['id']}\n";
        echo "  类型: {$recycled['type']} (1=菜单)\n";
        echo "  路径: {$recycled['path']}\n";
        echo "  组件: {$recycled['component']}\n";
        echo "  隐藏: {$recycled['hidden']} (1=隐藏)\n";
        echo "  权限标识: {$recycled['rules']}\n\n";

        // 4. 确保权限已分配
        echo "检查权限分配...\n";
        $accessExists = Db::name('auth_access')
            ->where('menu_id', $recycled['id'])
            ->where('role_id', 1)
            ->find();

        if (!$accessExists) {
            Db::name('auth_access')->insert([
                'menu_id' => $recycled['id'],
                'role_id' => 1
            ]);
            echo "✅ 权限已分配给超级管理员\n";
        } else {
            echo "⚠️  权限已存在\n";
        }
    }

    echo "\n✅ 修复完成！\n";
    echo "回收站现在是一个隐藏菜单，可通过用户管理页面的按钮访问。\n";
    echo "访问权限由 v-auth 指令和权限配置共同控制。\n";

} catch (\Exception $e) {
    echo "❌ 修复失败: " . $e->getMessage() . "\n";
    exit(1);
}
