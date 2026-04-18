<?php
// 检查回收站权限规则标识格式
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 检查回收站权限规则 ===\n\n";

// 1. 查找回收站菜单记录
$recycled = Db::name('menu')->where('title', '回收站')->find();
if (!$recycled) {
    echo "❌ 未找到回收站菜单\n";
    exit(1);
}

echo "回收站菜单配置:\n";
echo "  ID: {$recycled['id']}\n";
echo "  rules 字段: '{$recycled['rules']}'\n";
echo "  类型: {$recycled['type']}\n\n";

// 2. 检查超级管理员角色关联的权限
echo "超级管理员(角色ID=1)关联的菜单权限:\n";
$roleMenus = Db::name('auth_access')
    ->alias('aa')
    ->join('menu m', 'aa.menu_id = m.id')
    ->where('aa.role_id', 1)
    ->where('m.rules', '<>', '')
    ->field('m.id, m.title, m.rules')
    ->select();

$rulesFound = false;
foreach ($roleMenus as $menu) {
    echo "  ID: {$menu['id']}, 名称: {$menu['title']}, rules: '{$menu['rules']}'\n";
    if ($menu['id'] == $recycled['id']) {
        $rulesFound = true;
    }
}

if (!$rulesFound) {
    echo "\n❌ 超级管理员没有回收站权限关联\n";
    echo "需要添加 auth_access 记录\n";
} else {
    echo "\n✅ 权限关联存在\n";
}

// 3. 检查用户获取权限时使用的规则字段
echo "\n=== 检查前端权限匹配逻辑 ===\n";
echo "前端 v-auth 指令匹配的是: system:user:recycled\n";
echo "数据库中 rules 字段值: '{$recycled['rules']}'\n";

if ($recycled['rules'] === 'system:user:recycled') {
    echo "✅ 规则标识完全匹配\n";
} else {
    echo "❌ 规则标识不匹配！需要修正\n";
}

// 4. 检查用户规则获取逻辑
echo "\n=== 检查用户规则获取方式 ===\n";
$permissionsFile = __DIR__ . '/../core/Permissions.php';
if (file_exists($permissionsFile)) {
    $content = file_get_contents($permissionsFile);
    if (strpos($content, 'rules') !== false) {
        echo "Permissions.php 中存在 rules 相关代码\n";
    }
}
