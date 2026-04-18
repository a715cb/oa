<?php
/**
 * 硬删除功能单元测试验证脚本
 * 验证硬删除用户时是否正确清理 user_role 关联表记录
 */

require_once __DIR__ . '/../vendor/autoload.php';
use think\facade\Db;
use app\model\system\User;

$app = new think\App();
$app->initialize();

echo "=== 硬删除功能测试验证 ===\n\n";

$passed = 0;
$failed = 0;

/**
 * 测试1: 硬删除拥有多个角色的用户
 */
echo "测试 1: 硬删除拥有多个角色的用户\n";
echo str_repeat("-", 50) . "\n";

$testUser = Db::name('user')->insertGetId([
    'username' => 'test_hd_' . time(),
    'password' => password_hash('test123', PASSWORD_BCRYPT),
    'realname' => '测试用户',
    'pinyin' => 'ceshi',
    'phone' => '138' . rand(10000000, 99999999),
    'email' => 'test_' . time() . '@example.com',
    'dept_id' => 1,
    'status' => 1,
    'create_time' => time(),
]);

if ($testUser) {
    echo "✓ 创建测试用户成功，ID: {$testUser}\n";

    // 为用户分配多个角色（避开超级管理员角色ID）
    $roles = [2, 3, 4];
    foreach ($roles as $roleId) {
        Db::name('user_role')->insert([
            'user_id' => $testUser,
            'role_id' => $roleId,
        ]);
    }

    echo "✓ 为用户分配了 " . count($roles) . " 个角色\n";

    $roleCount = Db::name('user_role')->where('user_id', $testUser)->count();
    echo "  当前 user_role 表中记录数: {$roleCount}\n";

    if ($roleCount == count($roles)) {
        echo "✓ 关联记录创建成功\n";

        // 使用 UserService 执行硬删除
        $service = app(\app\service\user\UserService::class);
        try {
            $result = $service->hardDelete($testUser);

            if ($result) {
                echo "✓ 硬删除操作执行成功\n";

                $userExists = Db::name('user')->where('id', $testUser)->find();
                if (!$userExists) {
                    echo "✓ 用户记录已从 oa_user 表中删除\n";

                    $roleCountAfter = Db::name('user_role')->where('user_id', $testUser)->count();
                    if ($roleCountAfter == 0) {
                        echo "✓ 用户角色关联记录已从 oa_user_role 表中删除\n";
                        $passed++;
                    } else {
                        echo "✗ 用户角色关联记录仍然存在，数量: {$roleCountAfter}\n";
                        $failed++;
                    }
                } else {
                    echo "✗ 用户记录仍然存在于 oa_user 表中\n";
                    $failed++;
                }
            } else {
                echo "✗ 硬删除操作执行失败\n";
                $failed++;
            }
        } catch (\Exception $e) {
            echo "✗ 硬删除操作抛出异常: " . $e->getMessage() . "\n";
            $failed++;

            Db::name('user')->where('id', $testUser)->delete();
            Db::name('user_role')->where('user_id', $testUser)->delete();
        }
    } else {
        echo "✗ 关联记录创建失败\n";
        $failed++;
    }
} else {
    echo "✗ 创建测试用户失败\n";
    $failed++;
}

echo "\n";

/**
 * 测试2: 硬删除没有角色的用户
 */
echo "测试 2: 硬删除没有角色的用户\n";
echo str_repeat("-", 50) . "\n";

$testUser2 = Db::name('user')->insertGetId([
    'username' => 'test_hd2_' . time(),
    'password' => password_hash('test123', PASSWORD_BCRYPT),
    'realname' => '测试用户2',
    'pinyin' => 'ceshi2',
    'phone' => '139' . rand(10000000, 99999999),
    'email' => 'test2_' . time() . '@example.com',
    'dept_id' => 1,
    'status' => 1,
    'create_time' => time(),
]);

if ($testUser2) {
    echo "✓ 创建测试用户成功，ID: {$testUser2}\n";
    echo "  (未分配任何角色)\n";

    $service = app(\app\service\user\UserService::class);
    try {
        $result = $service->hardDelete($testUser2);

        if ($result) {
            echo "✓ 硬删除操作执行成功\n";

            $userExists = Db::name('user')->where('id', $testUser2)->find();
            if (!$userExists) {
                echo "✓ 用户记录已从 oa_user 表中删除\n";

                $roleCountAfter = Db::name('user_role')->where('user_id', $testUser2)->count();
                if ($roleCountAfter == 0) {
                    echo "✓ 用户角色关联表无残留记录\n";
                    $passed++;
                } else {
                    echo "✗ 用户角色关联表存在异常记录，数量: {$roleCountAfter}\n";
                    $failed++;
                }
            } else {
                echo "✗ 用户记录仍然存在于 oa_user 表中\n";
                $failed++;
            }
        } else {
            echo "✗ 硬删除操作执行失败\n";
            $failed++;
        }
    } catch (\Exception $e) {
        echo "✗ 硬删除操作抛出异常: " . $e->getMessage() . "\n";
        $failed++;

        Db::name('user')->where('id', $testUser2)->delete();
    }
} else {
    echo "✗ 创建测试用户失败\n";
    $failed++;
}

echo "\n";

/**
 * 测试3: 硬删除已软删除的用户
 */
echo "测试 3: 硬删除已软删除的用户\n";
echo str_repeat("-", 50) . "\n";

$testUser3 = Db::name('user')->insertGetId([
    'username' => 'test_hd3_' . time(),
    'password' => password_hash('test123', PASSWORD_BCRYPT),
    'realname' => '测试用户3',
    'pinyin' => 'ceshi3',
    'phone' => '137' . rand(10000000, 99999999),
    'email' => 'test3_' . time() . '@example.com',
    'dept_id' => 1,
    'status' => 1,
    'create_time' => time(),
]);

if ($testUser3) {
    echo "✓ 创建测试用户成功，ID: {$testUser3}\n";

    Db::name('user_role')->insert([
        'user_id' => $testUser3,
        'role_id' => 2,  // 使用非超级管理员角色
    ]);
    echo "✓ 为用户分配了 1 个角色\n";

    $user = User::find($testUser3);
    if ($user) {
        $user->delete();
        echo "✓ 软删除操作执行成功\n";

        $softDeletedUser = Db::name('user')->where('id', $testUser3)->find();
        if ($softDeletedUser && $softDeletedUser['delete_time'] > 0) {
            echo "✓ 用户已标记为软删除状态\n";

            $service = app(\app\service\user\UserService::class);
            try {
                $result = $service->hardDelete($testUser3);

                if ($result) {
                    echo "✓ 硬删除操作执行成功\n";

                    $userExists = Db::name('user')->where('id', $testUser3)->find();
                    if (!$userExists) {
                        echo "✓ 用户记录已从 oa_user 表中彻底删除\n";

                        $roleCountAfter = Db::name('user_role')->where('user_id', $testUser3)->count();
                        if ($roleCountAfter == 0) {
                            echo "✓ 用户角色关联记录已从 oa_user_role 表中删除\n";
                            $passed++;
                        } else {
                            echo "✗ 用户角色关联记录仍然存在，数量: {$roleCountAfter}\n";
                            $failed++;
                        }
                    } else {
                        echo "✗ 用户记录仍然存在于 oa_user 表中\n";
                        $failed++;
                    }
                } else {
                    echo "✗ 硬删除操作执行失败\n";
                    $failed++;
                }
            } catch (\Exception $e) {
                echo "✗ 硬删除操作抛出异常: " . $e->getMessage() . "\n";
                $failed++;

                Db::name('user')->where('id', $testUser3)->delete();
                Db::name('user_role')->where('user_id', $testUser3)->delete();
            }
        } else {
            echo "✗ 用户未正确标记为软删除状态\n";
            $failed++;
        }
    } else {
        echo "✗ 找不到用户进行软删除\n";
        $failed++;
    }
} else {
    echo "✗ 创建测试用户失败\n";
    $failed++;
}

echo "\n";

/**
 * 测试总结
 */
echo "=== 测试总结 ===\n";
echo str_repeat("=", 50) . "\n";
echo "通过: {$passed} 个测试\n";
echo "失败: {$failed} 个测试\n";
echo "总计: " . ($passed + $failed) . " 个测试\n";

if ($failed == 0) {
    echo "\n✅ 所有测试通过！硬删除功能正常工作。\n";
} else {
    echo "\n❌ 部分测试失败，请检查上述错误信息。\n";
    exit(1);
}
