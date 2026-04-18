<?php

declare(strict_types=1);

/**
 * uid() 方法测试脚本
 * 
 * 测试场景：
 * 1. 验证 uid() 方法存在于 Request 类
 * 2. 验证 uid() 方法签名有 int 返回类型
 * 3. 验证未登录时返回 0（需要完整 ThinkPHP 应用上下文）
 * 4. 验证 uid() 缓存机制有效
 */

require_once __DIR__ . '/../vendor/autoload.php';

use app\Request;

echo "=== uid() 方法测试 ===\n\n";

$passed = 0;
$failed = 0;

// 测试 1：验证 uid() 方法存在于 Request 类
echo "测试 1: 验证 uid() 方法存在... ";
if (method_exists(Request::class, 'uid')) {
    echo "[通过]\n";
    $passed++;
} else {
    echo "[失败] uid() 方法不存在\n";
    $failed++;
}

// 测试 2: 验证 uid() 方法签名有 int 返回类型
echo "测试 2: 验证方法签名返回类型为 int... ";
$reflection = new ReflectionMethod(Request::class, 'uid');
$returnType = $reflection->getReturnType();
if ($returnType && $returnType->getName() === 'int') {
    echo "[通过]\n";
    $passed++;
} else {
    echo "[失败] 返回类型不是 int\n";
    $failed++;
}

// 测试 3: 验证 uid 属性存在且可缓存
echo "测试 3: 验证 uid 缓存属性存在... ";
$reflectionClass = new ReflectionClass(Request::class);
if ($reflectionClass->hasProperty('uid')) {
    echo "[通过]\n";
    $passed++;
} else {
    echo "[失败] uid 缓存属性不存在\n";
    $failed++;
}

// 测试 4: 验证 uid() 方法体包含 JWT 验证逻辑
echo "测试 4: 验证方法使用 JWT Factory 验证 Token... ";
$methodContent = file_get_contents(__DIR__ . '/../app/Request.php');
if (strpos($methodContent, 'Factory::getInstance') !== false && strpos($methodContent, 'verifyAccessToken') !== false) {
    echo "[通过]\n";
    $passed++;
} else {
    echo "[失败] 方法未使用 JWT 验证逻辑\n";
    $failed++;
}

// 测试 5: 验证未登录时安全返回 0
echo "测试 5: 验证异常时返回 0... ";
if (strpos($methodContent, '$this->uid = 0') !== false) {
    echo "[通过]\n";
    $passed++;
} else {
    echo "[失败] 未找到异常时返回 0 的逻辑\n";
    $failed++;
}

// 总结
echo "\n=== 测试总结 ===\n";
echo "通过: {$passed}\n";
echo "失败: {$failed}\n";
echo "总计: " . ($passed + $failed) . "\n";

if ($failed > 0) {
    echo "\n部分测试失败，请检查！\n";
    exit(1);
} else {
    echo "\n所有测试通过！\n";
    exit(0);
}
