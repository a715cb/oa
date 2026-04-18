<?php
// 执行用户表软删除字段迁移
require_once __DIR__ . '/../vendor/autoload.php';

use think\facade\Db;

$app = new think\App();
$app->initialize();

try {
    // 检查字段是否已存在
    $columns = Db::query("SHOW COLUMNS FROM oa_user LIKE 'is_deleted'");
    if (!empty($columns)) {
        echo "⚠️  is_deleted 字段已存在，跳过迁移\n";
    } else {
        echo "添加 is_deleted 字段...\n";
        Db::execute("ALTER TABLE `oa_user` ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除: 0-未删除, 1-已删除' AFTER `status`");
        echo "✅ is_deleted 字段添加成功\n";
    }

    $columns = Db::query("SHOW COLUMNS FROM oa_user LIKE 'delete_time'");
    if (!empty($columns)) {
        echo "⚠️  delete_time 字段已存在，跳过迁移\n";
    } else {
        echo "添加 delete_time 字段...\n";
        Db::execute("ALTER TABLE `oa_user` ADD COLUMN `delete_time` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间' AFTER `is_deleted`");
        echo "✅ delete_time 字段添加成功\n";
    }

    // 检查索引
    $indexes = Db::query("SHOW INDEX FROM oa_user WHERE Key_name = 'idx_is_deleted'");
    if (empty($indexes)) {
        echo "添加 idx_is_deleted 索引...\n";
        Db::execute("ALTER TABLE `oa_user` ADD INDEX `idx_is_deleted` (`is_deleted`)");
        echo "✅ 索引添加成功\n";
    } else {
        echo "⚠️  idx_is_deleted 索引已存在\n";
    }

    echo "\n✅ 迁移完成！\n";
} catch (\Exception $e) {
    echo "❌ 迁移失败: " . $e->getMessage() . "\n";
    exit(1);
}
