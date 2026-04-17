<?php
declare(strict_types=1);

$pdo = new PDO(
    'mysql:host=127.0.0.1;dbname=oa_office_v3;charset=utf8mb4',
    'root',
    'JackLove88',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

echo "=== 检查 user 表结构 ===\n\n";

// 获取 user 表结构
$stmt = $pdo->query("SHOW FULL COLUMNS FROM oa_user");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "user 表字段列表:\n";
echo str_repeat('-', 100) . "\n";
printf("%-25s | %-20s | %-6s | %-10s | %s\n", '字段名', '类型', 'Null', 'Default', 'Comment');
echo str_repeat('-', 100) . "\n";

foreach ($columns as $col) {
    printf("%-25s | %-20s | %-6s | %-10s | %s\n",
        $col['Field'],
        $col['Type'],
        $col['Null'],
        $col['Default'] ?? 'NULL',
        $col['Comment']
    );
}

echo str_repeat('-', 100) . "\n";

// 检查 must_change_password 字段
$hasMustChangePassword = false;
foreach ($columns as $col) {
    if ($col['Field'] === 'must_change_password') {
        $hasMustChangePassword = true;
        echo "\n✓ must_change_password 字段存在\n";
        echo "  类型: " . $col['Type'] . "\n";
        echo "  默认值: " . ($col['Default'] ?? 'NULL') . "\n";
        echo "  注释: " . $col['Comment'] . "\n";
        break;
    }
}

if (!$hasMustChangePassword) {
    echo "\n✗ must_change_password 字段不存在\n";
}

// 获取完整的 CREATE TABLE 语句
echo "\n\n=== CREATE TABLE 语句 ===\n\n";
$stmt = $pdo->query("SHOW CREATE TABLE oa_user");
$create = $stmt->fetch(PDO::FETCH_ASSOC);
echo $create['Create Table'] . ";\n";
