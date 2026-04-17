<?php

namespace core\command;

use think\console\Command;
use think\console\Input;
use think\console\Output;
use think\facade\Db;
use think\facade\Config;

class MigrateDatabase extends Command
{
    protected function configure()
    {
        $this->setName('migrate:run')
            ->setDescription('运行数据库迁移');
    }

    protected function execute(Input $input, Output $output)
    {
        try {
            $output->writeln('<comment>开始数据库迁移...</comment>');

            // 1. 删除已存在的数据库
            $output->writeln("\n<comment>[1/3] 清理旧数据库...</comment>");
            $this->dropDatabase();
            $output->writeln('<info>✓ 旧数据库已删除（如果存在）</info>');

            // 2. 创建新数据库
            $output->writeln("\n<comment>[2/3] 创建新数据库...</comment>");
            $this->createDatabase();
            $output->writeln('<info>✓ 数据库创建成功</info>');

            // 3. 执行 SQL 迁移
            $output->writeln("\n<comment>[3/3] 执行 SQL 迁移...</comment>");
            $this->executeSqlFile($output);

            $output->writeln("\n<info>数据库迁移成功！</info>");
            $output->writeln("<info>默认管理员账号：admin</info>");
            $output->writeln("<info>默认管理员密码：123456</info>");
            
            return 0;
        } catch (\Exception $e) {
            $output->writeln("\n<error>迁移失败：" . $e->getMessage() . "</error>");
            return 1;
        }
    }

    /**
     * 验证数据库名称格式
     * 防止 SQL 注入攻击
     * 
     * @param string $dbName 数据库名称
     * @return bool
     * @throws \InvalidArgumentException 当数据库名称格式不合法时抛出
     */
    protected function validateDatabaseName(string $dbName): bool
    {
        // 只允许字母、数字和下划线，且必须以字母或下划线开头
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $dbName)) {
            throw new \InvalidArgumentException('数据库名称格式不合法，只允许字母、数字和下划线');
        }
        return true;
    }

    /**
     * 删除数据库
     */
    protected function dropDatabase(): void
    {
        $config = Config::get('database.connections.mysql');
        $dbName = $config['database'];

        // 验证数据库名称
        $this->validateDatabaseName($dbName);

        $dsn = sprintf(
            '%s:host=%s;port=%s;charset=%s',
            $config['type'] ?? 'mysql',
            $config['hostname'] ?? '127.0.0.1',
            $config['hostport'] ?? '3306',
            $config['charset'] ?? 'utf8mb4'
        );

        $pdo = new \PDO(
            $dsn,
            $config['username'] ?? 'root',
            $config['password'] ?? '',
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );

        $pdo->exec("DROP DATABASE IF EXISTS `{$dbName}`");
    }

    /**
     * 创建数据库
     */
    protected function createDatabase(): void
    {
        $config = Config::get('database.connections.mysql');
        $dbName = $config['database'];

        // 验证数据库名称
        $this->validateDatabaseName($dbName);

        $dsn = sprintf(
            '%s:host=%s;port=%s',
            $config['type'] ?? 'mysql',
            $config['hostname'] ?? '127.0.0.1',
            $config['hostport'] ?? '3306'
        );

        $pdo = new \PDO(
            $dsn,
            $config['username'] ?? 'root',
            $config['password'] ?? '',
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );

        $charset = $config['charset'] ?? 'utf8mb4';
        // 验证字符集格式，防止注入
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $charset)) {
            throw new \InvalidArgumentException('字符集格式不合法');
        }
        $collation = 'utf8mb4_general_ci';

        $pdo->exec("CREATE DATABASE `{$dbName}` CHARACTER SET {$charset} COLLATE {$collation}");
    }

    /**
     * 执行 SQL 文件
     */
    protected function executeSqlFile(Output $output): void
    {
        $sqlFile = app()->getRootPath() . 'sql/install.sql';

        if (!file_exists($sqlFile)) {
            throw new \RuntimeException('未找到 SQL 文件：' . $sqlFile);
        }

        $sql = file_get_contents($sqlFile);
        $sqlList = array_filter(array_map('trim', explode(';', $sql)));

        $output->writeln("\n<comment>正在执行 " . count($sqlList) . " 条 SQL 语句...</comment>");

        $sqlTotal = count($sqlList);
        $sqlCurrent = 0;

        Db::startTrans();
        try {
            foreach ($sqlList as $sql) {
                if (!empty($sql)) {
                    Db::execute($sql);
                    $sqlCurrent++;
                    $this->showProgress($output, $sqlCurrent, $sqlTotal);
                }
            }
            Db::commit();
            $output->writeln("");
        } catch (\Exception $e) {
            Db::rollback();
            $output->writeln("");
            throw new \RuntimeException('SQL 执行失败：' . $e->getMessage());
        }
    }

    /**
     * 显示进度
     */
    protected function showProgress(Output $output, $current, $total, $barWidth = 50)
    {
        $percent = round(($current / $total) * 100);
        $filled = round(($barWidth * $current) / $total);
        $empty = $barWidth - $filled;

        $bar = str_repeat('=', $filled) . ($current < $total ? '>' : '=') . str_repeat(' ', $empty);
        $output->write(sprintf(
            "\r[%s] %3d%%",
            $bar,
            $percent
        ));

        if ($current >= $total) {
            $output->writeln('');
        }
    }
}
