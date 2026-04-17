<?php
declare(strict_types=1);

echo "=== 导出数据库架构 ===\n\n";

try {
    $pdo = new PDO(
        'mysql:host=127.0.0.1;dbname=oa_office_v3;charset=utf8mb4',
        'root',
        'JackLove88',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // 导出所有表结构
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "共找到 " . count($tables) . " 个表\n\n";

    foreach ($tables as $table) {
        echo "-- 表: $table\n";
        $stmt = $pdo->query("SHOW CREATE TABLE `$table`");
        $create = $stmt->fetch(PDO::FETCH_ASSOC);
        echo $create['Create Table'] . ";\n\n";

        // 如果是 user 表，特别关注字段
        if (strpos($table, 'user') !== false) {
            echo "-- 字段详情:\n";
            $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($columns as $col) {
                echo "--   {$col['Field']} | {$col['Type']} | {$col['Null']} | {$col['Default']}\n";
            }
            echo "\n";
        }
    }

} catch (PDOException $e) {
    echo "错误: " . $e->getMessage() . "\n";
    exit(1);
}
