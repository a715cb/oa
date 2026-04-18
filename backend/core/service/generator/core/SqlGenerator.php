<?php

declare(strict_types=1);

namespace core\service\generator\core;

use think\facade\Db;
use core\exception\FailedException;

class SqlGenerator extends BaseGenerator 
{

    /**
     * 允许的标识符字符正则（字母、数字、下划线、斜杠、冒号）
     * 用于验证表名、字段名、class_dir 等用户输入
     */
    private const VALID_IDENTIFIER_PATTERN = '/^[a-zA-Z0-9_\/:]+$/';

    /**
     * 危险 SQL 关键字列表
     * 用于防止恶意 SQL 注入执行
     */
    private const DANGEROUS_SQL_KEYWORDS = [
        'DROP DATABASE',
        'DROP TABLE',
        'DROP PROCEDURE',
        'DROP FUNCTION',
        'DROP TRIGGER',
        'DROP VIEW',
        'TRUNCATE',
        'ALTER DATABASE',
        'GRANT',
        'REVOKE',
        'CREATE USER',
        'DROP USER',
        'RENAME USER',
        'SET PASSWORD',
        'SHUTDOWN',
        'LOAD_FILE',
        'INTO OUTFILE',
        'INTO DUMPFILE',
        'SYSTEM',
        'EXEC ',
        'EXECUTE ',
        'xp_cmdshell',
    ];

    /**
     * @notes 替换变量
     * @return mixed|void
     */
    public function replaceVariables(): void
    {
        // 验证用户输入数据安全性
        $this->validateTableData();

        // 需要替换的变量
        $needReplace = [
            '{MENU_TABLE}',
            '{PID}',
            '{MENU_NAME}',
            '{PATH_NAME}',
            '{COMPONENT_NAME}',
            '{RULES}',
        ];

        // 等待替换的内容
        $waitReplace = [
            $this->getMenuTableNameContent(),
            $this->getMenuPidContent(),
            $this->getMenuNameContent(),
            $this->getLowerTableName(),
            $this->getComponentName(),
            $this->getRulesName(),
        ];

        $templatePath = $this->getTemplatePath('sql');

        // 替换内容
        $content = $this->replaceFileData($needReplace, $waitReplace, $templatePath);

        $this->setContent($content);
    }


    /**
     * @notes 菜单名称
     * @return mixed
     */
    public function getMenuNameContent(): mixed
    {
        return $this->tableData['menu_name'] ?? $this->tableData['table_comment'];
    }



    /**
     * @notes 组件地址
     * @return string
     */
    public function getComponentName(): string
    {
        return $this->tableData['class_dir'] . '/' .  $this->getLowerTableName() . '/index';
    }


    /**
     * @notes 权限节点
     * @return string
     */
    public function getRulesName(): string
    {
        return $this->tableData['class_dir'] . ':' .  $this->getLowerTableName();
        
    }



    /**
     * @notes 获取上级菜单内容
     * @return int|mixed
     */
    public function getMenuPidContent(): mixed
    {
        return $this->tableData['menu_pid'] ?? 0;
    }


    /**
     * @notes 获取菜单表内容
     * @return string
     */
    public function getMenuTableNameContent(): string
    {
        $tablePrefix = config('database.connections.mysql.prefix');
        return $tablePrefix . 'menu';
    }


    /**
     * @notes 是否构建菜单
     * @return bool
     */
    public function isBuildMenu(): bool
    {
        $menuType = $this->tableData['menu_type'] ?? 0;
        return $menuType == 1;
    }


    /**
     * 验证 tableData 中的用户输入安全性
     * 确保表名、class_dir 等标识符符合白名单规则（字母、数字、下划线）
     * 
     * @throws FailedException 当输入不合法时抛出异常
     */
    private function validateTableData(): void
    {
        // 验证表名
        if (isset($this->tableData['table_name'])) {
            $tableName = $this->getTableName();
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $tableName)) {
                throw new FailedException('表名格式不合法，仅允许字母、数字和下划线');
            }
        }

        // 验证 class_dir
        if (isset($this->tableData['class_dir'])) {
            $classDir = (string)$this->tableData['class_dir'];
            if (!preg_match(self::VALID_IDENTIFIER_PATTERN, $classDir)) {
                throw new FailedException('class_dir 格式不合法，仅允许字母、数字、下划线、斜杠和冒号');
            }
        }
    }

    /**
     * 验证 SQL 语句安全性
     * 检查是否包含危险的 SQL 关键字
     * 
     * @param string $sql SQL 语句
     * @return bool 安全返回 true
     * @throws FailedException 包含危险关键字时抛出异常
     */
    private function validateSqlSecurity(string $sql): bool
    {
        $sqlUpper = strtoupper(trim($sql));
        
        foreach (self::DANGEROUS_SQL_KEYWORDS as $keyword) {
            if (strpos($sqlUpper, $keyword) !== false) {
                throw new FailedException('SQL 语句包含危险关键字: ' . $keyword . '，操作被拒绝');
            }
        }
        
        return true;
    }

    /**
     * 验证 SQL 语句是否为允许的操作类型
     * 仅允许 INSERT 和 UPDATE 操作
     * 
     * @param string $sql SQL 语句
     * @return bool 允许返回 true
     * @throws FailedException 不允许的操作类型
     */
    private function validateSqlOperationType(string $sql): bool
    {
        $sqlUpper = strtoupper(trim($sql));
        
        // 提取 SQL 操作类型
        $firstWord = preg_split('/\s+/', $sqlUpper, 2)[0] ?? '';
        
        $allowedOperations = ['INSERT', 'UPDATE'];
        
        if (!in_array($firstWord, $allowedOperations)) {
            throw new FailedException('仅允许 INSERT 和 UPDATE 操作，当前操作类型: ' . $firstWord);
        }
        
        return true;
    }

    /**
     * @notes 构建菜单
     * @return bool
     * @throws FailedException 当 SQL 验证失败时抛出异常
     */
    public function buildMenuHandle(): bool
    {
        if (empty($this->content)) {
            return false;
        }
        
        $sqls = explode(';', trim($this->content));
        
        foreach ($sqls as $sql) {
            $sql = trim($sql);
            
            if (empty($sql)) {
                continue;
            }
            
            // 安全性验证：验证操作类型
            $this->validateSqlOperationType($sql);
            
            // 安全性验证：验证危险关键字
            $this->validateSqlSecurity($sql);
            
            // 执行验证通过的 SQL
            Db::execute($sql . ';');
        }
        
        return true;
    }


    /**
     * @notes 获取文件生成到模块的文件夹路径
     * @return string
     */
    public function getModuleGenerateDir(): string
    {
        $dir = $this->generatorDir . 'sql/';
        $this->checkDir($dir);
        return $dir;
    }


    /**
     * @notes 获取文件生成到runtime的文件夹路径
     * @return string
     */
    public function getRuntimeGenerateDir(): string
    {
        $dir = $this->generatorDir . 'sql/';
        $this->checkDir($dir);
        return $dir;
    }


    /**
     * @notes 生成的文件名
     * @return string
     */
    public function getGenerateName(): string
    {
        return 'menu.sql';
    }


    /**
     * @notes 文件信息
     * @return array
     */
    public function fileInfo(): array
    {
        return [
            'name' => $this->getGenerateName(),
            'type' => 'sql',
            'content' => $this->content
        ];
    }


}
