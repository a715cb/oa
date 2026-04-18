<?php
// 验证 getRules 方法只查询 type=2 的菜单
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 验证 rules 获取问题 ===\n\n";

$recycled = Db::name('menu')->where('title', '回收站')->find();
echo "回收站信息:\n";
echo "  ID: {$recycled['id']}\n";
echo "  类型: {$recycled['type']} (0=目录, 1=菜单, 2=权限)\n";
echo "  rules: {$recycled['rules']}\n\n";

echo "getRules 方法查询: type=2 的菜单\n";
$type2Menus = Db::name('menu')->where('type', 2)->where('rules', '<>', '')->select();
echo "找到 " . $type2Menus->count() . " 个 type=2 的权限\n";

$hasRecycled = false;
foreach ($type2Menus as $menu) {
    if ($menu['id'] == $recycled['id']) {
        $hasRecycled = true;
    }
}

echo "\n❌ 问题确认: 回收站是 type=1（菜单），不在 getRules 查询范围内\n";
echo "   所以 system:user:recycled 不会出现在用户的 rules 数组中\n";
echo "   导致 v-auth 指令将回收站按钮隐藏\n\n";

echo "解决方案:\n";
echo "  方案1: 将回收站 type 改为 2（权限类型），同时保留路由配置\n";
echo "  方案2: 修改 getRules 方法，同时查询 type=1 且 rules 非空的记录\n\n";

echo "推荐方案2，因为菜单也可以作为权限控制点\n";
