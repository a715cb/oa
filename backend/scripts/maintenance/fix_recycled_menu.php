<?php
// 修复回收站菜单配置
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

try {
    echo "=== 修复回收站菜单配置 ===\n\n";

    // 1. 将回收站菜单设置为隐藏（不从侧边栏显示）
    $recycled = Db::name('menu')->where('title', '回收站')->find();
    if ($recycled) {
        echo "回收站菜单ID: " . $recycled['id'] . "\n";
        echo "当前 hidden 值: " . $recycled['hidden'] . "\n";

        if ($recycled['hidden'] == 0) {
            Db::name('menu')->where('id', $recycled['id'])->update(['hidden' => 1]);
            echo "✅ 已将回收站菜单设置为隐藏\n";
        } else {
            echo "⚠️  回收站菜单已经是隐藏状态\n";
        }
    } else {
        echo "❌ 未找到回收站菜单\n";
        exit(1);
    }

    // 2. 验证回收站菜单配置
    echo "\n=== 回收站菜单当前配置 ===\n";
    $recycled = Db::name('menu')->where('id', $recycled['id'])->find();
    echo "ID: {$recycled['id']}\n";
    echo "名称: {$recycled['title']}\n";
    echo "路径: {$recycled['path']}\n";
    echo "组件: {$recycled['component']}\n";
    echo "类型: {$recycled['type']}\n";
    echo "隐藏: {$recycled['hidden']} (1=隐藏, 0=显示)\n";

    echo "\n✅ 修复完成！\n";
    echo "回收站功能现在只能通过用户列表页面的'回收站'按钮访问\n";

} catch (\Exception $e) {
    echo "❌ 修复失败: " . $e->getMessage() . "\n";
    exit(1);
}
