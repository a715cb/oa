<?php
// 将回收站从菜单转换为权限功能
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

try {
    echo "=== 将回收站转换为权限功能 ===\n\n";

    // 1. 查找当前回收站菜单
    $recycled = Db::name('menu')->where('title', '回收站')->where('path', 'recycled')->find();
    
    if (!$recycled) {
        echo "❌ 未找到回收站菜单\n";
        exit(1);
    }

    echo "当前回收站配置:\n";
    echo "  ID: {$recycled['id']}\n";
    echo "  类型: {$recycled['type']} (0=目录, 1=菜单, 2=权限)\n";
    echo "  路径: {$recycled['path']}\n";
    echo "  组件: {$recycled['component']}\n";
    echo "  隐藏: {$recycled['hidden']}\n\n";

    // 2. 将回收站菜单转换为权限项
    echo "转换为权限功能...\n";
    Db::name('menu')->where('id', $recycled['id'])->update([
        'type' => 2,           // 从菜单(1)改为权限(2)
        'path' => '',          // 清空路径，权限不需要路由
        'component' => '',     // 清空组件，权限不绑定组件
        'hidden' => 0,         // 设置为显示
        'rules' => 'system:user:recycled'  // 权限标识
    ]);

    echo "✅ 回收站已转换为权限功能\n\n";

    // 3. 验证转换结果
    $recycled = Db::name('menu')->where('id', $recycled['id'])->find();
    echo "转换后配置:\n";
    echo "  ID: {$recycled['id']}\n";
    echo "  类型: {$recycled['type']} (2=权限)\n";
    echo "  权限标识: {$recycled['rules']}\n";
    echo "  路径: '{$recycled['path']}' (空)\n";
    echo "  组件: '{$recycled['component']}' (空)\n\n";

    // 4. 为超级管理员角色分配回收站权限
    echo "为超级管理员分配回收站权限...\n";
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

    echo "\n✅ 回收站功能转换完成！\n";
    echo "现在回收站功能通过权限控制，不再作为独立菜单项显示。\n";
    echo "用户需要先获得 system:user:recycled 权限才能访问回收站功能。\n";

} catch (\Exception $e) {
    echo "❌ 转换失败: " . $e->getMessage() . "\n";
    exit(1);
}
