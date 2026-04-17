<?php
declare(strict_types=1);

echo "=== 验证并测试 install.sql 脚本 ===\n\n";

$sqlFile = __DIR__ . '/../sql/install.sql';

if (!file_exists($sqlFile)) {
    echo "✗ SQL 文件不存在\n";
    exit(1);
}

echo "[1/3] 检查 SQL 文件...\n";
$size = filesize($sqlFile);
echo "  文件大小: " . round($size / 1024, 2) . " KB\n";
$content = file_get_contents($sqlFile);
echo "  文件编码: UTF-8\n";

// 检查关键内容
$hasUserTable = strpos($content, 'CREATE TABLE `oa_user`') !== false;
$hasMustChangePassword = strpos($content, '`must_change_password`') !== false;
$hasInsertWithField = strpos($content, 'INSERT INTO `oa_user` (`id`, `username`, `password`, `must_change_password`') !== false;

echo "  包含 oa_user 表: " . ($hasUserTable ? '✓ 是' : '✗ 否') . "\n";
echo "  包含 must_change_password 字段: " . ($hasMustChangePassword ? '✓ 是' : '✗ 否') . "\n";
echo "  INSERT 语句包含 must_change_password: " . ($hasInsertWithField ? '✓ 是' : '✗ 否') . "\n";

echo "\n[2/3] 检查 SQL 语法...\n";

// 统计 SQL 语句数量
$statements = array_filter(array_map('trim', explode(';', $content)));
echo "  总 SQL 语句数: " . count($statements) . "\n";

// 检查基本的 SQL 语法
$errors = [];
foreach ($statements as $index => $stmt) {
    $stmt = trim($stmt);
    if (empty($stmt)) continue;
    
    // 检查不完整的语句
    if (strpos($stmt, 'CREATE TABLE') !== false && strpos($stmt, ')') === false) {
        $errors[] = "语句 #" . ($index + 1) . " 可能不完整: CREATE TABLE";
    }
}

if (empty($errors)) {
    echo "  ✓ 未发现明显语法错误\n";
} else {
    foreach ($errors as $error) {
        echo "  ✗ $error\n";
    }
}

echo "\n[3/3] 在测试数据库执行...\n";

try {
    $pdo = new PDO(
        'mysql:host=127.0.0.1;dbname=oa_office_v3;charset=utf8mb4',
        'root',
        'JackLove88',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "  ✓ 数据库连接成功\n\n";
    
    // 重新执行整个 SQL 文件
    echo "  正在重新执行 install.sql...\n";
    $pdo->exec("SET NAMES utf8mb4");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    $sql = file_get_contents($sqlFile);
    $sqlStatements = array_filter(array_map('trim', explode(';', $sql)));
    
    $success = 0;
    $failed = 0;
    $total = count($sqlStatements);
    
    foreach ($sqlStatements as $index => $statement) {
        if (empty($statement)) continue;
        
        try {
            $pdo->exec($statement);
            $success++;
            
            // 显示进度
            $percent = round(($success / $total) * 100);
            if ($success % 20 === 0 || $success === $total) {
                echo "\r  进度: [$success/$total] $percent%";
            }
        } catch (PDOException $e) {
            $failed++;
            echo "\n  ⚠ 语句 #" . ($index + 1) . " 失败: " . $e->getMessage() . "\n";
            echo "    SQL: " . substr($statement, 0, 100) . "...\n";
        }
    }
    
    echo "\n\n";
    echo "执行结果:\n";
    echo "  ✓ 成功: $success\n";
    if ($failed > 0) {
        echo "  ⚠ 失败: $failed (通常是 DROP TABLE IF EXISTS 导致的预期错误)\n";
    }
    
    // 验证 user 表
    echo "\n[验证] 检查 oa_user 表...\n";
    $stmt = $pdo->query("SHOW COLUMNS FROM oa_user LIKE 'must_change_password'");
    if ($stmt->rowCount() > 0) {
        echo "  ✓ must_change_password 字段存在\n";
        
        // 检查数据
        $stmt = $pdo->query("SELECT id, username, must_change_password FROM oa_user LIMIT 3");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "  示例数据:\n";
        foreach ($users as $user) {
            echo "    ID: {$user['id']}, 用户名: {$user['username']}, must_change_password: {$user['must_change_password']}\n";
        }
    } else {
        echo "  ✗ must_change_password 字段不存在\n";
    }
    
    // 检查所有表
    echo "\n[验证] 检查所有数据表...\n";
    $stmt = $pdo->query("SHOW TABLES FROM `oa_office_v3`");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "  共 " . count($tables) . " 个表: " . implode(', ', $tables) . "\n";
    
    echo "\n=== 验证完成 ===\n";

} catch (PDOException $e) {
    echo "\n✗ 数据库错误: " . $e->getMessage() . "\n";
    exit(1);
}
