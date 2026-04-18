<?php
declare(strict_types=1);

/**
 * UTF-8 编码验证脚本
 * 
 * 用于验证系统的 UTF-8 编码配置是否正确
 * 包括：PHP 配置、数据库连接、JSON 响应、文件编码等
 */

echo "=====================================\n";
echo "UTF-8 编码配置验证\n";
echo "=====================================\n\n";

$errors = [];
$success = [];

// 1. 检查 PHP 默认编码
echo "[1/6] 检查 PHP 默认编码...\n";
$default_charset = ini_get('default_charset');
if (stripos($default_charset, 'utf-8') !== false || stripos($default_charset, 'utf8') !== false) {
    echo "  ✓ PHP 默认编码: {$default_charset}\n";
    $success[] = "PHP 默认编码正确: {$default_charset}";
} else {
    echo "  ✗ PHP 默认编码不正确: {$default_charset}\n";
    $errors[] = "PHP 默认编码应为 UTF-8，当前为: {$default_charset}";
}

// 2. 检查 mbstring 扩展
echo "\n[2/6] 检查 mbstring 扩展...\n";
if (extension_loaded('mbstring')) {
    $mb_encoding = mb_internal_encoding();
    if (stripos($mb_encoding, 'utf-8') !== false || stripos($mb_encoding, 'utf8') !== false) {
        echo "  ✓ mbstring 已加载，内部编码: {$mb_encoding}\n";
        $success[] = "mbstring 编码正确: {$mb_encoding}";
    } else {
        echo "  ✗ mbstring 编码不正确: {$mb_encoding}\n";
        $errors[] = "mbstring 内部编码应为 UTF-8，当前为: {$mb_encoding}";
    }
} else {
    echo "  ✗ mbstring 扩展未加载\n";
    $errors[] = "mbstring 扩展未加载";
}

// 3. 检查数据库配置
echo "\n[3/6] 检查数据库字符集配置...\n";
try {
    $env_file = __DIR__ . '/../.env';
    if (file_exists($env_file)) {
        $env_content = file_get_contents($env_file);
        if (strpos($env_content, 'charset=utf8mb4') !== false || strpos($env_content, "charset = utf8mb4") !== false) {
            echo "  ✓ 数据库配置使用 utf8mb4\n";
            $success[] = "数据库配置使用 utf8mb4";
        } elseif (strpos($env_content, 'charset=utf8') !== false) {
            echo "  ⚠ 数据库配置使用 utf8（建议 utf8mb4）\n";
            $errors[] = "数据库配置建议改为 utf8mb4";
        } else {
            echo "  - 未找到 charset 配置（使用默认 utf8mb4）\n";
        }
    }
} catch (Exception $e) {
    echo "  ✗ 读取配置失败: " . $e->getMessage() . "\n";
}

// 4. 检查 JSON 编码
echo "\n[4/6] 检查 JSON 编码支持...\n";
$test_string = "中文测试 日本語テスト 🎉";
$json_encoded = json_encode($test_string, JSON_UNESCAPED_UNICODE);
if ($json_encoded && $json_encoded !== 'null') {
    $decoded = json_decode($json_encoded, true);
    if ($decoded === $test_string) {
        echo "  ✓ JSON UTF-8 编码正常\n";
        $success[] = "JSON UTF-8 编码支持正常";
    } else {
        echo "  ✗ JSON 解码失败\n";
        $errors[] = "JSON UTF-8 编解码异常";
    }
} else {
    echo "  ✗ JSON 编码失败\n";
    $errors[] = "JSON UTF-8 编码失败";
}

// 5. 检查文件编码
echo "\n[5/6] 检查关键文件编码...\n";
$files_to_check = [
    __DIR__ . '/../app/adminapi/controller/login/Index.php',
    __DIR__ . '/../config/database.php',
    __DIR__ . '/../config/app.php',
];

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $is_utf8 = mb_check_encoding($content, 'UTF-8');
        $filename = basename($file);
        if ($is_utf8) {
            echo "  ✓ {$filename}: UTF-8 编码\n";
            $success[] = "文件 {$filename} 编码正确";
        } else {
            echo "  ✗ {$filename}: 非 UTF-8 编码\n";
            $errors[] = "文件 {$filename} 编码不是 UTF-8";
        }
    }
}

// 6. 检查 HTTP 响应头配置
echo "\n[6/6] 检查 HTTP 响应头配置...\n";
$config_file = __DIR__ . '/../core/service/JsonServer.php';
if (file_exists($config_file)) {
    $content = file_get_contents($config_file);
    // 检查 Response::create 是否指定 json 类型
    if (strpos($content, "Response::create(\$response, 'json'") !== false) {
        echo "  ✓ JSON 响应类型已配置\n";
        $success[] = "JSON 响应类型配置正确";
    } else {
        echo "  ⚠ 未找到明确的 JSON 响应类型配置\n";
        $errors[] = "建议明确指定 JSON 响应类型";
    }
}

// 总结
echo "\n=====================================\n";
echo "验证结果汇总\n";
echo "=====================================\n";

if (empty($errors)) {
    echo "✓ 所有检查项均通过！\n\n";
    echo "通过项：\n";
    foreach ($success as $msg) {
        echo "  ✓ {$msg}\n";
    }
    exit(0);
} else {
    echo "✗ 发现 " . count($errors) . " 个问题\n\n";
    echo "通过项：\n";
    foreach ($success as $msg) {
        echo "  ✓ {$msg}\n";
    }
    echo "\n失败项：\n";
    foreach ($errors as $msg) {
        echo "  ✗ {$msg}\n";
    }
    exit(1);
}
