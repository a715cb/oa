<?php

declare(strict_types=1);

namespace core\service\generator\core;

use think\facade\Db;
use core\exception\FailedException;

class SqlGenerator extends BaseGenerator 
{

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
    public function replaceVariables()
    {
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
    public function getMenuNameContent()
    {
        return $this->tableData['menu_name'] ?? $this->tableData['table_comment'];
    }



    /**
     * @notes 组件地址
     * @return mixed
     */
    public function getComponentName(){
        return $this->tableData['class_dir'] . '/' .  $this->getLowerTableName() . '/index';
    }


    /**
     * @notes 权限节点
     * @return mixed
     */
    public function getRulesName(){
   
        return $this->tableData['class_dir'] . ':' .  $this->getLowerTableName();
        
    }



    /**
     * @notes 获取上级菜单内容
     * @return int|mixed
     */
    public function getMenuPidContent()
    {
        return $this->tableData['menu_pid'] ?? 0;
    }


    /**
     * @notes 获取菜单表内容
     * @return string
     */
    public function getMenuTableNameContent()
    {
        $tablePrefix = config('database.connections.mysql.prefix');
        return $tablePrefix . 'menu';
    }


    /**
     * @notes 是否构建菜单
     * @return bool
     */
    public function isBuildMenu()
    {
        $menuType = $this->tableData['menu_type'] ?? 0;
        return $menuType == 1;
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
    public function buildMenuHandle()
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
     * @return mixed|void
     */
    public function getModuleGenerateDir()
    {
        $dir = $this->generatorDir . 'sql/';
        $this->checkDir($dir);
        return $dir;
    }


    /**
     * @notes 获取文件生成到runtime的文件夹路径
     * @return string
     */
    public function getRuntimeGenerateDir()
    {
        $dir = $this->generatorDir . 'sql/';
        $this->checkDir($dir);
        return $dir;
    }


    /**
     * @notes 生成的文件名
     * @return string
     */
    public function getGenerateName()
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