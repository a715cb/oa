<?php
declare(strict_types=1);

try {
    echo "=== 检查 oa_user 表结构 ===\n\n";

    $pdo = new PDO(
        'mysql:host=127.0.0.1;dbname=oa_office_v3;charset=utf8mb4',
        'root',
        'JackLove88',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // 检查 must_change_password 字段是否存在
    $stmt = $pdo->query("SHOW COLUMNS FROM oa_user LIKE 'must_change_password'");
    $columnExists = $stmt->rowCount() > 0;

    if ($columnExists) {
        echo "✓ must_change_password 字段已存在\n";
    } else {
        echo "✗ must_change_password 字段不存在，正在添加...\n";
        $pdo->exec("ALTER TABLE oa_user ADD COLUMN must_change_password TINYINT(1) DEFAULT 1 COMMENT '是否必须修改密码' AFTER password");
        echo "✓ must_change_password 字段添加成功\n";
    }

    // 验证字段
    $stmt = $pdo->query("SHOW COLUMNS FROM oa_user LIKE 'must_change_password'");
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\n字段详情:\n";
    echo "  名称: {$column['Field']}\n";
    echo "  类型: {$column['Type']}\n";
    echo "  默认值: {$column['Default']}\n";

    // 测试查询
    echo "\n测试登录查询:\n";
    $stmt = $pdo->query("SELECT id, username, status, must_change_password FROM oa_user WHERE username = 'admin' LIMIT 1");
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

    echo "\n=== 完成 ===\n";

} catch (PDOException $e) {
    echo "✗ 数据库错误: " . $e->getMessage() . "\n";
    exit(1);
}
