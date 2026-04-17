<?php
declare(strict_types=1);

echo "=== 数据库初始化 ===\n";
echo "执行时间: " . date('Y-m-d H:i:s') . "\n\n";

try {
    // 1. 连接 MySQL（不指定数据库）
    echo "[1/3] 连接 MySQL 服务器...\n";
    $pdo = new PDO(
        'mysql:host=127.0.0.1;charset=utf8mb4',
        'root',
        'JackLove88',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "  ✓ 连接成功\n\n";

    // 2. 创建数据库
    echo "[2/3] 创建数据库...\n";
    $pdo->exec("DROP DATABASE IF EXISTS `oa_office_v3`");
    $pdo->exec("CREATE DATABASE `oa_office_v3` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    echo "  ✓ 数据库创建成功\n\n";

    // 3. 执行 SQL 文件
    echo "[3/3] 执行 SQL 文件...\n";
    $sqlFile = __DIR__ . '/../sql/install.sql';
    
    if (!file_exists($sqlFile)) {
        throw new RuntimeException('SQL 文件不存在: ' . $sqlFile);
    }

    $sql = file_get_contents($sqlFile);
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "  共 " . count($statements) . " 条 SQL 语句\n\n";

    // 连接到目标数据库
    $pdo->exec("USE `oa_office_v3`");

    $success = 0;
    $failed = 0;
    $total = count($statements);

    foreach ($statements as $index => $statement) {
        if (empty($statement)) continue;
        
        try {
            $pdo->exec($statement);
            $success++;
            
            // 显示进度
            $percent = round(($success / $total) * 100);
            if ($success % 10 === 0 || $success === $total) {
                echo "\r  进度: [$success/$total] $percent%";
            }
        } catch (PDOException $e) {
            $failed++;
            echo "\n  ✗ 语句 #" . ($index + 1) . " 失败: " . $e->getMessage() . "\n";
            echo "    SQL: " . substr($statement, 0, 100) . "...\n";
        }
    }

    echo "\n\n";
    echo "执行结果:\n";
    echo "  ✓ 成功: $success\n";
    if ($failed > 0) {
        echo "  ✗ 失败: $failed\n";
    }

    // 4. 验证表创建
    echo "\n[验证] 检查数据表...\n";
    $stmt = $pdo->query("SHOW TABLES FROM `oa_office_v3`");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "  共创建 " . count($tables) . " 个表\n";
    
    // 检查 user 表
    if (in_array('oa_user', $tables) || in_array('user', $tables)) {
        echo "  ✓ user 表已创建\n";
        
        // 检查 must_change_password 字段
        $tableName = in_array('oa_user', $tables) ? 'oa_user' : 'user';
        $stmt = $pdo->query("SHOW COLUMNS FROM `$tableName` LIKE 'must_change_password'");
        if ($stmt->rowCount() > 0) {
            echo "  ✓ must_change_password 字段存在\n";
        } else {
            echo "  ⚠ must_change_password 字段不存在，添加中...\n";
            $pdo->exec("ALTER TABLE `$tableName` ADD COLUMN `must_change_password` TINYINT(1) DEFAULT 1 COMMENT '是否必须修改密码' AFTER `password`");
            echo "  ✓ must_change_password 字段已添加\n";
        }
    } else {
        echo "  ✗ user 表未找到\n";
        echo "  可用表: " . implode(', ', array_slice($tables, 0, 10)) . "...\n";
    }

    echo "\n=== 数据库初始化完成 ===\n";

} catch (PDOException $e) {
    echo "\n✗ 数据库错误: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "\n✗ 错误: " . $e->getMessage() . "\n";
    exit(1);
}
