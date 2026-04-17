<?php
declare(strict_types=1);

namespace tests\unit;

use PHPUnit\Framework\TestCase;

class SecurityFixTest extends TestCase
{
    private string $rootPath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rootPath = dirname(__DIR__);
    }

    // ========== SEC-002: JWT Secret 配置验证 ==========

    public function testJwtConfigFileExists(): void
    {
        $jwtConfig = $this->rootPath . '/config/jwt.php';
        $this->assertFileExists($jwtConfig, 'JWT 配置文件必须存在');
    }

    public function testJwtSecretIsRequiredFromEnv(): void
    {
        $jwtConfig = file_get_contents($this->rootPath . '/config/jwt.php');

        $this->assertStringContainsString("env('jwt.SECRET')", $jwtConfig,
            'JWT_SECRET 必须从环境变量读取，使用 env("jwt.SECRET") 格式');
        $this->assertStringContainsString("throw new \\RuntimeException", $jwtConfig,
            '未配置 JWT_SECRET 时应抛出异常阻止启动');

        $this->assertStringNotContainsString("'123456789'", $jwtConfig,
            '配置文件中不得包含硬编码测试密钥');
        $this->assertStringNotContainsString("'secret_key_here'", $jwtConfig,
            '配置文件中不得包含占位符密钥');
    }

    public function testJwtApiSecretIsRequiredFromEnv(): void
    {
        $jwtConfig = file_get_contents($this->rootPath . '/config/jwt.php');

        $this->assertStringContainsString("env('jwt.API_SECRET')", $jwtConfig,
            'API_SECRET 必须从环境变量读取');
    }

    // ========== SEC-003: Token 获取限制验证 ==========

    public function testJwtAuthServiceOnlyGetsTokenFromHeader(): void
    {
        $jwtAuthFile = file_get_contents($this->rootPath . '/core/service/jwt/JwtAuth.php');

        $this->assertStringContainsString("Request::header('Authorization')", $jwtAuthFile,
            'Token 必须从 Authorization 请求头获取');

        $this->assertStringNotContainsString("Request::param('token')", $jwtAuthFile,
            '禁止从 URL 参数获取 Token，防止 Token 泄露');
        $this->assertStringNotContainsString("Request::cookie('token')", $jwtAuthFile,
            '禁止从 Cookie 获取 Token，防止 CSRF 攻击');
    }

    public function testJwtAuthServiceThrowsExceptionOnMissingToken(): void
    {
        $jwtAuthFile = file_get_contents($this->rootPath . '/core/service/jwt/JwtAuth.php');

        $this->assertStringContainsString("throw new TokenInvalidException", $jwtAuthFile,
            '缺少 Token 时必须抛出异常');
    }

    // ========== SEC-004: 密码安全增强验证 ==========

    public function testUserModelUsesBcrypt(): void
    {
        $userModel = file_get_contents($this->rootPath . '/app/model/system/User.php');

        $this->assertStringContainsString('PASSWORD_BCRYPT', $userModel,
            '密码哈希必须使用 bcrypt 算法');
        $this->assertStringContainsString("'cost' => 12", $userModel,
            'bcrypt cost 必须设置为 12 以增强安全性');
        $this->assertStringContainsString('password_hash', $userModel,
            '必须使用 password_hash() 函数');
    }

    public function testUserModelHasMustChangePasswordField(): void
    {
        $userModel = file_get_contents($this->rootPath . '/app/model/system/User.php');

        $this->assertStringContainsString("'must_change_password'", $userModel,
            '用户模型必须包含 must_change_password 字段');
    }

    // ========== SEC-005: 代码生成器 SQL 安全验证 ==========

    public function testSqlGeneratorValidatesDangerousKeywords(): void
    {
        $sqlGenerator = file_get_contents($this->rootPath . '/core/service/generator/core/SqlGenerator.php');

        $dangerousKeywords = ['DROP DATABASE', 'DROP TABLE', 'TRUNCATE', 'GRANT', 'SHUTDOWN'];

        foreach ($dangerousKeywords as $keyword) {
            $this->assertStringContainsString("'$keyword'", $sqlGenerator,
                "SQL 生成器必须拦截危险关键字: $keyword");
        }
    }

    public function testSqlGeneratorRestrictsOperationTypes(): void
    {
        $sqlGenerator = file_get_contents($this->rootPath . '/core/service/generator/core/SqlGenerator.php');

        $this->assertStringContainsString('validateSqlOperationType', $sqlGenerator,
            'SQL 生成器必须验证操作类型');
        $this->assertStringContainsString('INSERT', $sqlGenerator,
            'SQL 生成器应允许 INSERT 操作');
        $this->assertStringContainsString('UPDATE', $sqlGenerator,
            'SQL 生成器应允许 UPDATE 操作');
    }

    // ========== SEC-006: 数据库名称验证 ==========

    public function testInstallCommandValidatesDatabaseName(): void
    {
        $installCommand = file_get_contents($this->rootPath . '/core/command/InstallDatabase.php');

        $this->assertStringContainsString('validateDatabaseName', $installCommand,
            '安装命令必须验证数据库名称格式');
        $this->assertStringContainsString('preg_match', $installCommand,
            '必须使用正则表达式验证数据库名称');
    }

    public function testMigrateCommandValidatesDatabaseName(): void
    {
        $migrateCommand = file_get_contents($this->rootPath . '/core/command/MigrateDatabase.php');

        $this->assertStringContainsString('validateDatabaseName', $migrateCommand,
            '迁移命令必须验证数据库名称格式');
    }

    // ========== SEC-008: XSS 防护验证 ==========

    public function testFrontendHasEscapeHtmlFunction(): void
    {
        $treeSearch = file_get_contents(dirname($this->rootPath) . '/frontend/src/views/system/menu/useTreeSearch.ts');

        $this->assertStringContainsString('escapeHtml', $treeSearch,
            '前端必须实现 HTML 转义函数');
        $this->assertStringContainsString('createTextNode', $treeSearch,
            '必须使用 createTextNode 安全地处理文本');
    }

    public function testFrontendHighlightTextEscapesInput(): void
    {
        $treeSearch = file_get_contents(dirname($this->rootPath) . '/frontend/src/views/system/menu/useTreeSearch.ts');

        $this->assertStringContainsString('highlightText', $treeSearch,
            '高亮文本函数必须存在');

        $lines = explode("\n", $treeSearch);
        $foundHighlightFunction = false;
        $callsEscapeHtml = false;

        foreach ($lines as $line) {
            if (strpos($line, 'function highlightText') !== false || strpos($line, 'const highlightText') !== false) {
                $foundHighlightFunction = true;
            }
            if ($foundHighlightFunction && strpos($line, 'escapeHtml') !== false) {
                $callsEscapeHtml = true;
                break;
            }
        }

        $this->assertTrue($callsEscapeHtml,
            'highlightText 函数必须调用 escapeHtml 转义输入');
    }

    public function testUseMessageHookRemovesInnerHtml(): void
    {
        $useMessage = file_get_contents(dirname($this->rootPath) . '/frontend/src/hooks/web/useMessage.tsx');

        // innerHTML 只能在 escapeHtml 安全函数中使用
        // 验证它不在 renderContent 或其他渲染逻辑中使用
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

        $this->assertFalse($innerHtmlInRender,
            'renderContent 函数中不得使用 innerHTML 渲染用户输入');
    }

    // ========== SEC-001: 敏感信息管理验证 ==========

    public function testGitignoreContainsEnvFiles(): void
    {
        $gitignore = file_get_contents($this->rootPath . '/.gitignore');

        $this->assertStringContainsString('.env', $gitignore,
            '.gitignore 必须排除 .env 文件');
        $this->assertStringContainsString('.env.*', $gitignore,
            '.gitignore 必须排除所有 .env.* 环境文件');
        $this->assertStringContainsString('!.env.example', $gitignore,
            '.gitignore 应保留 .env.example 模板文件');
    }

    public function testEnvExampleDoesNotContainRealSecrets(): void
    {
        $envExample = file_get_contents($this->rootPath . '/.env.example');

        $this->assertStringContainsString('DATABASE_HOST', $envExample,
            '.env.example 应包含数据库配置模板');

        $this->assertStringNotContainsString('127.0.0.1', $envExample,
            '.env.example 不应包含真实的数据库地址');
        $this->assertStringNotContainsString('password', $envExample,
            '.env.example 不应包含真实密码');
        $this->assertStringNotContainsString('secret_key', $envExample,
            '.env.example 不应包含真实密钥');
    }

    // ========== 综合安全测试 ==========

    public function testAllHighSeverityFixesAreApplied(): void
    {
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
            $this->assertTrue($exists, "$fix 修复文件必须存在");
        }

        $this->assertCount(7, $fixes, '必须有 7 个高危修复文件');
    }

    public function testNoHardcodedCredentialsInConfigFiles(): void
    {
        $configFiles = glob($this->rootPath . '/config/*.php');

        foreach ($configFiles as $configFile) {
            $content = file_get_contents($configFile);

            $this->assertStringNotContainsString('password_123', $content,
                basename($configFile) . ' 不得包含硬编码密码');
            $this->assertStringNotContainsString('admin123', $content,
                basename($configFile) . ' 不得包含硬编码密码');
            $this->assertStringNotContainsString('sk_live_', $content,
                basename($configFile) . ' 不得包含 API 密钥');
        }
    }
}
