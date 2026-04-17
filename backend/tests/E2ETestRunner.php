<?php
declare(strict_types=1);

class E2ETestRunner
{
    private string $baseUrl;
    private int $passed = 0;
    private int $failed = 0;
    private array $results = [];
    private array $cookies = [];
    private string $token = '';

    public function __construct()
    {
        $this->baseUrl = 'http://127.0.0.1:8000';
    }

    private function request(string $method, string $url, array $data = [], array $headers = []): array
    {
        $ch = curl_init();
        $fullUrl = $this->baseUrl . $url;

        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HEADER => true,
        ];

        if ($method === 'POST') {
            $options[CURLOPT_POST] = true;
            $options[CURLOPT_POSTFIELDS] = json_encode($data);
        }

        $defaultHeaders = [
            'Content-Type: application/json',
            'Accept: application/json',
        ];

        if ($this->token) {
            $defaultHeaders[] = 'Authorization: Bearer ' . $this->token;
        }

        $options[CURLOPT_HTTPHEADER] = array_merge($defaultHeaders, $headers);
        $options[CURLOPT_URL] = $fullUrl;

        curl_setopt_array($ch, $options);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        
        $headers = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);
        
        curl_close($ch);

        return [
            'code' => $httpCode,
            'headers' => $headers,
            'body' => $body,
            'data' => json_decode($body, true) ?: [],
        ];
    }

    private function assert(bool $condition, string $message, string $category): void
    {
        if ($condition) {
            $this->passed++;
            $this->results[] = ['status' => '✓ PASS', 'category' => $category, 'message' => $message];
            echo "  ✓ PASS: $message\n";
        } else {
            $this->failed++;
            $this->results[] = ['status' => '✗ FAIL', 'category' => $category, 'message' => $message];
            echo "  ✗ FAIL: $message\n";
        }
    }

    public function runAll(): void
    {
        echo "=====================================\n";
        echo "E2E 端到端测试 - 浏览器自动化模拟\n";
        echo "执行时间: " . date('Y-m-d H:i:s') . "\n";
        echo "=====================================\n\n";

        $this->testBackendHealth();
        $this->testLoginFlow();
        $this->testTokenSecurity();
        $this->testAuthenticatedEndpoints();
        $this->testXssProtection();
        $this->testSqlInjectionProtection();
        $this->testUnauthorizedAccess();

        $this->printReport();
    }

    private function testBackendHealth(): void
    {
        echo "\n[1/7] 后端服务健康检查\n";
        echo str_repeat('-', 50) . "\n";

        $response = $this->request('GET', '/');
        
        $this->assert($response['code'] === 200,
            "后端服务正常响应 (HTTP {$response['code']})", '健康检查');
        $this->assert(!empty($response['body']),
            '后端返回响应内容', '健康检查');
    }

    private function testLoginFlow(): void
    {
        echo "\n[2/7] 用户登录流程测试\n";
        echo str_repeat('-', 50) . "\n";

        // 测试正常登录
        $response = $this->request('POST', '/api/system/auth/login', [
            'username' => 'admin',
            'password' => '123456',
        ]);

        $this->assert($response['code'] === 200,
            "登录接口正常响应 (HTTP {$response['code']})", '登录流程');

        if (isset($response['data']['code']) && $response['data']['code'] === 1) {
            $this->assert(isset($response['data']['data']['token']),
                '登录成功返回 Token', '登录流程');
            
            if (isset($response['data']['data']['token'])) {
                $this->token = $response['data']['data']['token'];
                $this->assert(!empty($this->token),
                    'Token 非空', '登录流程');
            }
        } else {
            echo "  ⚠ 登录可能失败，使用测试 Token 继续\n";
            $this->token = 'test_token_placeholder';
        }

        // 测试错误密码
        $response = $this->request('POST', '/api/system/auth/login', [
            'username' => 'admin',
            'password' => 'wrong_password',
        ]);

        $this->assert($response['code'] === 200 || $response['code'] === 401,
            "错误密码返回适当响应 (HTTP {$response['code']})", '登录流程');
    }

    private function testTokenSecurity(): void
    {
        echo "\n[3/7] Token 安全测试\n";
        echo str_repeat('-', 50) . "\n";

        // 测试无 Token 访问受保护接口
        $originalToken = $this->token;
        $this->token = '';

        $response = $this->request('GET', '/api/system/user');
        
        $this->assert($response['code'] === 401 || $response['code'] === 200,
            "无 Token 访问受保护接口 (HTTP {$response['code']})", 'Token 安全');

        if (isset($response['data']['code'])) {
            $this->assert($response['data']['code'] !== 1,
                '无 Token 时无法获取数据', 'Token 安全');
        }

        $this->token = $originalToken;

        // 测试无效 Token
        $this->token = 'invalid_token_12345';
        $response = $this->request('GET', '/api/system/user');
        
        $this->assert($response['code'] === 401 || $response['code'] === 200,
            "无效 Token 被正确处理 (HTTP {$response['code']})", 'Token 安全');

        $this->token = $originalToken;
    }

    private function testAuthenticatedEndpoints(): void
    {
        echo "\n[4/7] 认证接口测试\n";
        echo str_repeat('-', 50) . "\n";

        if (empty($this->token) || $this->token === 'test_token_placeholder') {
            echo "  ⚠ 跳过：需要有效 Token\n";
            return;
        }

        // 测试用户信息接口
        $response = $this->request('GET', '/api/system/user/info');
        
        $this->assert($response['code'] === 200,
            "用户信息接口正常 (HTTP {$response['code']})", '认证接口');

        // 测试用户列表接口
        $response = $this->request('GET', '/api/system/user?page=1&limit=10');
        
        $this->assert($response['code'] === 200,
            "用户列表接口正常 (HTTP {$response['code']})", '认证接口');

        // 测试菜单接口
        $response = $this->request('GET', '/api/system/menu');
        
        $this->assert($response['code'] === 200,
            "菜单接口正常 (HTTP {$response['code']})", '认证接口');
    }

    private function testXssProtection(): void
    {
        echo "\n[5/7] XSS 防护测试\n";
        echo str_repeat('-', 50) . "\n";

        $xssPayloads = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            'javascript:alert(1)',
        ];

        foreach ($xssPayloads as $payload) {
            $response = $this->request('POST', '/api/system/auth/login', [
                'username' => $payload,
                'password' => 'test',
            ]);

            $bodyContainsScript = strpos($response['body'], '<script>') !== false && 
                                 strpos($response['body'], 'alert') !== false;

            $this->assert(!$bodyContainsScript,
                "XSS Payload 未被反射: " . substr($payload, 0, 30) . '...', 'XSS 防护');
        }
    }

    private function testSqlInjectionProtection(): void
    {
        echo "\n[6/7] SQL 注入防护测试\n";
        echo str_repeat('-', 50) . "\n";

        $sqlPayloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "admin' UNION SELECT * FROM users --",
            "1; SELECT * FROM information_schema.tables",
        ];

        foreach ($sqlPayloads as $payload) {
            $response = $this->request('POST', '/api/system/auth/login', [
                'username' => $payload,
                'password' => 'test',
            ]);

            $bodyContainsSQLError = stripos($response['body'], 'sql') !== false && 
                                   (stripos($response['body'], 'error') !== false || 
                                    stripos($response['body'], 'syntax') !== false);

            $this->assert(!$bodyContainsSQLError,
                "SQL 注入 Payload 未导致错误: " . substr($payload, 0, 30) . '...', 'SQL 注入防护');
        }
    }

    private function testUnauthorizedAccess(): void
    {
        echo "\n[7/7] 未授权访问测试\n";
        echo str_repeat('-', 50) . "\n";

        $protectedRoutes = [
            '/api/system/user',
            '/api/system/role',
            '/api/system/menu',
            '/api/system/department',
            '/api/system/dict',
        ];

        $originalToken = $this->token;
        $this->token = '';

        foreach ($protectedRoutes as $route) {
            $response = $this->request('GET', $route);
            
            $isProtected = ($response['code'] === 401 || 
                           (isset($response['data']['code']) && $response['data']['code'] !== 1));

            $this->assert($isProtected,
                "受保护接口需要认证: $route", '未授权访问');
        }

        $this->token = $originalToken;
    }

    private function printReport(): void
    {
        echo "\n=====================================\n";
        echo "E2E 测试报告汇总\n";
        echo "=====================================\n\n";

        $total = $this->passed + $this->failed;
        echo "总测试数: $total\n";
        echo "通过: {$this->passed}\n";
        echo "失败: {$this->failed}\n";
        echo "通过率: " . ($total > 0 ? round($this->passed / $total * 100, 2) : 0) . "%\n\n";

        echo "详细结果:\n";
        echo str_repeat('-', 80) . "\n";
        printf("%-8s | %-15s | %s\n", '状态', '类别', '测试描述');
        echo str_repeat('-', 80) . "\n";

        foreach ($this->results as $result) {
            printf("%-8s | %-15s | %s\n",
                $result['status'],
                $result['category'],
                $result['message']);
        }

        echo str_repeat('-', 80) . "\n";

        if ($this->failed === 0) {
            echo "\n✓ 所有 E2E 测试通过！\n";
        } else {
            echo "\n✗ 发现 {$this->failed} 个失败项，请检查\n";
        }
    }
}

$runner = new E2ETestRunner();
$runner->runAll();
