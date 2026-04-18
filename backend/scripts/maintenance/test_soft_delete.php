<?php
// 测试软删除功能
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

echo "=== 软删除功能测试 ===\n\n";

// 查找一个测试用户
$testUser = Db::name('user')
    ->where('is_deleted', 0)
    ->where('id', '>', 1)  // 不删除超级管理员
    ->find();

if (!$testUser) {
    echo "❌ 未找到可删除的测试用户\n";
    exit(1);
}

echo "找到测试用户:\n";
echo "  ID: {$testUser['id']}\n";
echo "  用户名: {$testUser['username']}\n";
echo "  当前 is_deleted: {$testUser['is_deleted']}\n";
echo "  当前 delete_time: {$testUser['delete_time']}\n";

// 执行软删除
echo "\n执行软删除...\n";
$now = time();
$result = Db::name('user')
    ->where('id', $testUser['id'])
    ->update([
        'is_deleted' => 1,
        'delete_time' => $now
    ]);

if ($result) {
    echo "✅ 软删除成功\n\n";
    
    // 验证删除状态
    $deletedUser = Db::name('user')->where('id', $testUser['id'])->find();
    echo "删除后用户状态:\n";
    echo "  is_deleted: {$deletedUser['is_deleted']}\n";
    echo "  delete_time: {$deletedUser['delete_time']} (" . date('Y-m-d H:i:s', $deletedUser['delete_time']) . ")\n";
    
    // 查询已删除用户列表
    echo "\n已删除用户列表:\n";
    $deletedUsers = Db::name('user')
        ->where('is_deleted', 1)
        ->field('id,username,realname,delete_time')
        ->select();
    
    foreach ($deletedUsers as $user) {
        echo "  ID: {$user['id']}, 用户名: {$user['username']}, 删除时间: " . date('Y-m-d H:i:s', $user['delete_time']) . "\n";
    }
    
    echo "\n✅ 测试完成！现在可以验证回收站页面\n";
} else {
    echo "❌ 软删除失败\n";
    exit(1);
}
