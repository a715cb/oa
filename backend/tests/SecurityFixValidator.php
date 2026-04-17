<?php
declare(strict_types=1);

class SecurityFixValidator
{
    private string $rootPath;
    private int $passed = 0;
    private int $failed = 0;
    private array $results = [];

    public function __construct()
    {
        $this->rootPath = dirname(__DIR__);
    }

    private function assert(bool $condition, string $message, string $category): void
    {
        if ($condition) {
            $this->passed++;
            $this->results[] = ['status' => '✓ PASS', 'category' => $category, 'message' => $message];
        } else {
            $this->failed++;
            $this->results[] = ['status' => '✗ FAIL', 'category' => $category, 'message' => $message];
        }
    }

    public function runAll(): void
    {
        echo "=====================================\n";
        echo "高危漏洞修复 E2E 测试\n";
        echo "执行时间: " . date('Y-m-d H:i:s') . "\n";
        echo "=====================================\n\n";

        $this->testSec001EnvFiles();
        $this->testSec002JwtSecret();
        $this->testSec003TokenRestriction();
        $this->testSec004PasswordSecurity();
        $this->testSec005SqlGenerator();
        $this->testSec006DatabaseValidation();
        $this->testSec008XssProtection();
        $this->testComprehensiveSecurity();

        $this->printReport();
    }

    private function testSec001EnvFiles(): void
    {
        echo "\n[SEC-001] 敏感信息管理测试\n";
        echo str_repeat('-', 50) . "\n";

        $gitignore = file_get_contents($this->rootPath . '/.gitignore');
        $this->assert(strpos($gitignore, '.env') !== false,
            '.gitignore 必须排除 .env 文件', 'SEC-001');
        $this->assert(strpos($gitignore, '.env.*') !== false,
            '.gitignore 必须排除所有 .env.* 环境文件', 'SEC-001');
        $this->assert(strpos($gitignore, '!.env.example') !== false,
            '.gitignore 应保留 .env.example 模板文件', 'SEC-001');

        $this->assert(file_exists($this->rootPath . '/.env.example'),
            '.env.example 模板文件必须存在', 'SEC-001');

        $envExample = file_get_contents($this->rootPath . '/.env.example');
        $this->assert(strpos($envExample, 'DATABASE_HOST') !== false || strpos($envExample, 'HOSTNAME') !== false,
            '.env.example 应包含数据库配置模板', 'SEC-001');
        $this->assert(strpos($envExample, '127.0.0.1') === false,
            '.env.example 不应包含真实的数据库地址', 'SEC-001');
    }

    private function testSec002JwtSecret(): void
    {
        echo "\n[SEC-002] JWT Secret 配置测试\n";
        echo str_repeat('-', 50) . "\n";

        $this->assert(file_exists($this->rootPath . '/config/jwt.php'),
            'JWT 配置文件必须存在', 'SEC-002');

        $jwtConfig = file_get_contents($this->rootPath . '/config/jwt.php');

        $this->assert(strpos($jwtConfig, "env('jwt.SECRET')") !== false,
            'JWT_SECRET 必须从环境变量读取 (jwt.SECRET 格式)', 'SEC-002');
        $this->assert(strpos($jwtConfig, "env('jwt.API_SECRET')") !== false,
            'API_SECRET 必须从环境变量读取', 'SEC-002');
        $this->assert(strpos($jwtConfig, "throw new \\RuntimeException") !== false,
            '未配置 JWT_SECRET 时应抛出异常', 'SEC-002');

        $this->assert(strpos($jwtConfig, "'123456789'") === false,
            '配置文件中不得包含硬编码测试密钥', 'SEC-002');
        $this->assert(strpos($jwtConfig, "'secret_key_here'") === false,
            '配置文件中不得包含占位符密钥', 'SEC-002');
    }

    private function testSec003TokenRestriction(): void
    {
        echo "\n[SEC-003] Token 获取限制测试\n";
        echo str_repeat('-', 50) . "\n";

        $jwtAuthFile = file_get_contents($this->rootPath . '/core/service/jwt/JwtAuth.php');

        $this->assert(strpos($jwtAuthFile, "Request::header('Authorization')") !== false,
            'Token 必须从 Authorization 请求头获取', 'SEC-003');
        $this->assert(strpos($jwtAuthFile, "Request::param('token')") === false,
            '禁止从 URL 参数获取 Token', 'SEC-003');
        $this->assert(strpos($jwtAuthFile, "Request::cookie('token')") === false,
            '禁止从 Cookie 获取 Token', 'SEC-003');
        $this->assert(strpos($jwtAuthFile, "throw new TokenInvalidException") !== false,
            '缺少 Token 时必须抛出异常', 'SEC-003');
    }

    private function testSec004PasswordSecurity(): void
    {
        echo "\n[SEC-004] 密码安全增强测试\n";
        echo str_repeat('-', 50) . "\n";

        $userModel = file_get_contents($this->rootPath . '/app/model/system/User.php');

        $this->assert(strpos($userModel, 'PASSWORD_BCRYPT') !== false,
            '密码哈希必须使用 bcrypt 算法', 'SEC-004');
        $this->assert(strpos($userModel, "'cost' => 12") !== false,
            'bcrypt cost 必须设置为 12', 'SEC-004');
        $this->assert(strpos($userModel, 'password_hash') !== false,
            '必须使用 password_hash() 函数', 'SEC-004');
        $this->assert(strpos($userModel, "'must_change_password'") !== false,
            '用户模型必须包含 must_change_password 字段', 'SEC-004');
    }

    private function testSec005SqlGenerator(): void
    {
        echo "\n[SEC-005] 代码生成器 SQL 安全测试\n";
        echo str_repeat('-', 50) . "\n";

        $sqlGenerator = file_get_contents($this->rootPath . '/core/service/generator/core/SqlGenerator.php');

        $dangerousKeywords = ['DROP DATABASE', 'DROP TABLE', 'TRUNCATE', 'GRANT', 'SHUTDOWN'];
        foreach ($dangerousKeywords as $keyword) {
            $this->assert(strpos($sqlGenerator, "'$keyword'") !== false,
                "SQL 生成器必须拦截危险关键字: $keyword", 'SEC-005');
        }

        $this->assert(strpos($sqlGenerator, 'validateSqlOperationType') !== false,
            'SQL 生成器必须验证操作类型', 'SEC-005');
        $this->assert(strpos($sqlGenerator, 'INSERT') !== false,
            'SQL 生成器应允许 INSERT 操作', 'SEC-005');
        $this->assert(strpos($sqlGenerator, 'UPDATE') !== false,
            'SQL 生成器应允许 UPDATE 操作', 'SEC-005');
    }

    private function testSec006DatabaseValidation(): void
    {
        echo "\n[SEC-006] 数据库名称验证测试\n";
        echo str_repeat('-', 50) . "\n";

        $installCommand = file_get_contents($this->rootPath . '/core/command/InstallDatabase.php');
        $this->assert(strpos($installCommand, 'validateDatabaseName') !== false,
            '安装命令必须验证数据库名称格式', 'SEC-006');
        $this->assert(strpos($installCommand, 'preg_match') !== false,
            '必须使用正则表达式验证数据库名称', 'SEC-006');

        $migrateCommand = file_get_contents($this->rootPath . '/core/command/MigrateDatabase.php');
        $this->assert(strpos($migrateCommand, 'validateDatabaseName') !== false,
            '迁移命令必须验证数据库名称格式', 'SEC-006');
    }

    private function testSec008XssProtection(): void
    {
        echo "\n[SEC-008] XSS 防护测试\n";
        echo str_repeat('-', 50) . "\n";

        $frontendPath = dirname($this->rootPath) . '/frontend/src';

        $treeSearch = file_get_contents($frontendPath . '/views/system/menu/useTreeSearch.ts');
        $this->assert(strpos($treeSearch, 'escapeHtml') !== false,
            '前端必须实现 HTML 转义函数', 'SEC-008');
        $this->assert(strpos($treeSearch, 'createTextNode') !== false,
            '必须使用 createTextNode 安全地处理文本', 'SEC-008');
        $this->assert(strpos($treeSearch, 'highlightText') !== false,
            '高亮文本函数必须存在', 'SEC-008');

        // 验证 useMessage.tsx 中 innerHTML 的安全使用
        $useMessage = file_get_contents($frontendPath . '/hooks/web/useMessage.tsx');
        $lines = explode("\n", $useMessage);
        $inRenderContent = false;
        $innerHtmlInRender = false;

        foreach ($lines as $line) {
            if (strpos($line, 'function renderContent') !== false) {
                $inRenderContent = true;
            } elseif ($inRenderContent && strpos($line, '}') !== false && strpos($line, 'function') === false) {
                $inRenderContent = false;
            }

            if ($inRenderContent && strpos($line, 'innerHTML') !== false) {
                $innerHtmlInRender = true;
                break;
            }
        }

        $this->assert(!$innerHtmlInRender,
            'renderContent 函数中不得使用 innerHTML 渲染用户输入', 'SEC-008');
    }

    private function testComprehensiveSecurity(): void
    {
        echo "\n[综合] 全面安全测试\n";
        echo str_repeat('-', 50) . "\n";

        $fixes = [
            'SEC-001' => file_exists($this->rootPath . '/.gitignore'),
            'SEC-002' => file_exists($this->rootPath . '/config/jwt.php'),
            'SEC-003' => file_exists($this->rootPath . '/core/service/jwt/JwtAuth.php'),
            'SEC-004' => file_exists($this->rootPath . '/app/model/system/User.php'),
            'SEC-005' => file_exists($this->rootPath . '/core/service/generator/core/SqlGenerator.php'),
            'SEC-006' => file_exists($this->rootPath . '/core/command/InstallDatabase.php'),
            'SEC-008' => file_exists(dirname($this->rootPath) . '/frontend/src/views/system/menu/useTreeSearch.ts'),
        ];

        foreach ($fixes as $fix => $exists) {
            $this->assert($exists, "$fix 修复文件必须存在", '综合');
        }

        $configFiles = glob($this->rootPath . '/config/*.php');
        foreach ($configFiles as $configFile) {
            $content = file_get_contents($configFile);
            $filename = basename($configFile);

            $this->assert(strpos($content, 'password_123') === false,
                "$filename 不得包含硬编码密码 'password_123'", '综合');
            $this->assert(strpos($content, 'admin123') === false,
                "$filename 不得包含硬编码密码 'admin123'", '综合');
            $this->assert(strpos($content, 'sk_live_') === false,
                "$filename 不得包含 API 密钥 'sk_live_'", '综合');
        }
    }

    private function printReport(): void
    {
        echo "\n=====================================\n";
        echo "测试报告汇总\n";
        echo "=====================================\n\n";

        $total = $this->passed + $this->failed;
        echo "总测试数: $total\n";
        echo "通过: {$this->passed}\n";
        echo "失败: {$this->failed}\n";
        echo "通过率: " . ($total > 0 ? round($this->passed / $total * 100, 2) : 0) . "%\n\n";

        echo "详细结果:\n";
        echo str_repeat('-', 80) . "\n";
        printf("%-8s | %-10s | %s\n", '状态', '类别', '测试描述');
        echo str_repeat('-', 80) . "\n";

        foreach ($this->results as $result) {
            printf("%-8s | %-10s | %s\n",
                $result['status'],
                $result['category'],
                $result['message']);
        }

        echo str_repeat('-', 80) . "\n";

        if ($this->failed === 0) {
            echo "\n✓ 所有高危漏洞修复验证通过！\n";
        } else {
            echo "\n✗ 发现 {$this->failed} 个失败项，请检查修复情况\n";
        }
    }
}

$validator = new SecurityFixValidator();
$validator->runAll();
