<?php
// 验证修复后 getRules 方法是否能正确获取回收站权限
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 验证修复后的 getRules 方法 ===\n\n";

$recycled = Db::name('menu')->where('title', '回收站')->find();

echo "回收站信息:\n";
echo "  ID: {$recycled['id']}\n";
echo "  类型: {$recycled['type']}\n";
echo "  rules: {$recycled['rules']}\n\n";

// 模拟 getRules 逻辑
$superAdminRoleId = 1;
$menuIds = Db::name('auth_access')
    ->where('role_id', $superAdminRoleId)
    ->column('menu_id');

$rules = Db::name('menu')
    ->whereIn('type', [1, 2])
    ->whereIn('id', $menuIds)
    ->where('rules', '<>', '')
    ->sort('asc')
    ->column('rules');

echo "超级管理员获得的权限列表 (共 " . count($rules) . " 个):\n";
$hasRecycled = false;
foreach ($rules as $rule) {
    echo "  - {$rule}\n";
    if ($rule === 'system:user:recycled') {
        $hasRecycled = true;
    }
}

echo "\n";
if ($hasRecycled) {
    echo "✅ 修复成功！system:user:recycled 已包含在权限列表中\n";
    echo "前端 v-auth 指令将能正确显示回收站按钮\n";
} else {
    echo "❌ 修复失败，回收站权限仍未包含在列表中\n";
}
