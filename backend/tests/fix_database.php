<?php
declare(strict_types=1);

try {
    echo "=== 数据库字段检查和修复 ===\n";
    echo "执行时间: " . date('Y-m-d H:i:s') . "\n\n";

    $pdo = new PDO(
        'mysql:host=127.0.0.1;dbname=oa_office_v3;charset=utf8mb4',
        'root',
        'JackLove88',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "✓ 数据库连接成功\n\n";

    // 1. 检查 must_change_password 字段是否存在
    $stmt = $pdo->query("SHOW COLUMNS FROM oa_office_v3.user LIKE 'must_change_password'");
    $columnExists = $stmt->rowCount() > 0;

    if ($columnExists) {
        echo "✓ must_change_password 字段已存在\n";
    } else {
        echo "✗ must_change_password 字段不存在，正在添加...\n";
        $pdo->exec("ALTER TABLE oa_office_v3.user ADD COLUMN must_change_password TINYINT(1) DEFAULT 1 COMMENT '是否必须修改密码' AFTER password");
        echo "✓ must_change_password 字段添加成功\n";
    }

    // 2. 验证字段类型
    $stmt = $pdo->query("SHOW COLUMNS FROM oa_office_v3.user LIKE 'must_change_password'");
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n字段详情:\n";
    echo "  名称: {$column['Field']}\n";
    echo "  类型: {$column['Type']}\n";
    echo "  默认值: {$column['Default']}\n";
    echo "  允许NULL: {$column['Null']}\n";

    // 3. 检查其他登录所需的关键字段
    $requiredColumns = ['id', 'username', 'password', 'status', 'must_change_password'];
    echo "\n关键字段检查:\n";
    
    foreach ($requiredColumns as $col) {
        $stmt = $pdo->query("SHOW COLUMNS FROM oa_office_v3.user LIKE '$col'");
        $exists = $stmt->rowCount() > 0;
        echo "  " . ($exists ? '✓' : '✗') . " $col: " . ($exists ? '存在' : '缺失') . "\n";
    }

    // 4. 测试登录查询
    echo "\n测试登录查询:\n";
    $stmt = $pdo->query("SELECT id, username, password, status, must_change_password FROM oa_office_v3.user WHERE username = 'admin' LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "  ✓ 管理员账号查询成功\n";
        echo "  用户ID: {$user['id']}\n";
        echo "  用户名: {$user['username']}\n";
        echo "  状态: {$user['status']}\n";
        echo "  必须修改密码: {$user['must_change_password']}\n";
    } else {
        echo "  ✗ 未找到管理员账号\n";
    }

    echo "\n=== 修复完成 ===\n";

} catch (PDOException $e) {
    echo "✗ 数据库错误: " . $e->getMessage() . "\n";
    exit(1);
}
