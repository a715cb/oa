# OnLine OA - 后端服务

企业级办公自动化系统后端服务，基于 ThinkPHP 8 框架构建，提供完善的组织架构管理、RBAC 权限控制、业务流程审批等核心功能。

## 🚀 技术栈

- **框架**: ThinkPHP 8.1
- **语言**: PHP 8.0+
- **数据库**: MySQL 5.7+ / 8.0+
- **认证**: JWT (JSON Web Token)
- **权限**: RBAC (基于角色的访问控制)

## 📦 核心依赖

```json
{
  "topthink/framework": "^8.1.0",
  "topthink/think-orm": "^3.0",
  "phpoffice/phpspreadsheet": "^3.9",
  "hashids/hashids": "^4.0",
  "w7corp/easywechat": "^5.0",
  "overtrue/pinyin": "^4.0",
  "lcobucci/jwt": "^4.0",
  "spatie/macroable": "^2.0"
}
```

## 🏗 项目结构

```
backend/
├─📂 app/               // 应用目录
│  ├─📂 adminapi/      // 后台管理接口
│  │  ├─📂 controller/ // 控制器层
│  │  ├─📂 middleware/ // 中间件
│  │  ├─📂 route/      // 路由配置
│  │  ├─📂 event/      // 事件类
│  │  └─📂 validate/   // 验证器
│  ├─📂 api/           // 前端 API 接口
│  ├─📂 model/         // 模型层
│  ├─📂 service/       // 业务逻辑层
│  └─📂 common.php     // 公共函数
├─📂 config/           // 配置文件目录
├─📂 core/             // 核心扩展目录
│  ├─📂 base/         // 基础类库
│  ├─📂 command/      // 自定义命令
│  ├─📂 exception/    // 异常处理
│  ├─📂 facade/       // 门面类
│  ├─📂 middleware/   // 中间件
│  ├─📂 service/      // 核心服务
│  ├─📂 traits/       // 特性 trait
│  └─📂 utils/        // 工具类
├─📂 public/           // 公共资源目录
├─📂 runtime/          // 运行时目录
├─📂 sql/              // SQL 脚本
├─📂 vendor/           // 第三方依赖
├─📄 composer.json     // 依赖配置
├─📄 .env              // 环境配置
└─📄 think            // 命令行入口
```

## ✨ 核心功能模块

### 1. 系统管理

#### 用户管理
- 用户 CRUD 操作
- 用户状态管理（启用/禁用）
- 密码重置功能
- 部门关联管理
- 角色分配

#### 角色管理
- 角色 CRUD 操作
- 菜单权限分配
- 数据权限控制
- 角色用户关联

#### 菜单管理
- 树形菜单结构
- 路由配置管理
- 按钮权限标识
- 菜单图标配置

#### 部门管理
- 树形组织架构
- 部门层级管理
- 部门负责人设置
- 部门排序管理

#### 字典管理
- 字典类型管理
- 字典数据管理
- 字典缓存更新
- 字典排序管理

### 2. 安全认证

#### JWT 认证
- 双 Token 机制（Access Token + Refresh Token）
- Token 自动刷新
- Token 黑名单管理
- 多场景令牌配置

#### 权限控制
- RBAC 权限模型
- 菜单权限验证
- 按钮权限验证
- 数据范围权限
- 中间件鉴权

#### 安全特性
- SQL 注入防护（参数绑定）
- XSS 攻击防护
- 请求频率限制
- 操作日志记录
- 登录日志记录

### 3. 日志管理

#### 登录日志
- 用户登录记录
- 登录 IP 追踪
- 登录地点定位
- 登录设备识别
- 日志导出功能

#### 操作日志
- 操作行为记录
- 请求参数记录
- 操作结果记录
- 日志清理功能

### 4. 文件管理

#### 上传服务
- 文件上传（支持多种存储方式）
- 图片上传（自动压缩）
- 附件上传
- 文件类型验证
- 文件大小限制

#### 存储服务
- 本地存储
- 阿里云 OSS
- 七牛云存储
- 腾讯云 COS

### 5. 代码生成器

- 数据库表预览
- 代码模板生成
- 模型代码生成
- 控制器代码生成
- 验证器代码生成
- 路由代码生成
- 前端代码生成

### 6. 微信集成

- 微信公众号集成
- 微信小程序支持
- OAuth2.0 认证
- 微信消息处理
- 微信支付接口

### 7. Excel 处理

- Excel 导入
- Excel 导出
- 数据格式转换
- 批量数据处理

## 🔧 安装部署

### 环境要求

- PHP >= 8.0
- MySQL >= 5.7
- Composer >= 2.0
- Redis (可选，用于缓存)

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd backend
```

#### 2. 安装依赖

```bash
composer install
```

#### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
APP_DEBUG = false

[APP]
DEFAULT_TIMEZONE = Asia/Shanghai

[DATABASE]
HOSTNAME = 127.0.0.1
DATABASE = your_database
USERNAME = your_username
PASSWORD = your_password
HOSTPORT = 3306
CHARSET = utf8mb4
PREFIX = oa_
```

#### 4. 导入数据库

```bash
mysql -u username -p database_name < sql/install.sql
```

#### 5. 初始化数据库

```bash
php think migrate:run
```

#### 6. 设置目录权限

```bash
chmod -R 775 runtime/
chmod -R 775 public/
```

#### 7. 配置 Web 服务器

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/backend/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

**Apache 配置示例：**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]
</IfModule>
```

## 🛠 开发指南

### 目录结构规范

#### Controller 层
- 继承 `core\base\BaseController`
- 使用验证器进行参数验证
- 使用 trait 复用响应方法

```php
namespace app\adminapi\controller\system;

use app\adminapi\validate\system\UserValidate;
use core\base\BaseController;

class User extends BaseController
{
    protected array $search = ['keyword', 'department_id', 'status'];
    
    public function list()
    {
        $this->validate(UserValidate::class, 'list');
        // 业务逻辑
    }
}
```

#### Service 层
- 继承 `core\base\BaseService`
- 处理复杂业务逻辑
- 封装数据访问

```php
namespace app\service\user;

use core\base\BaseService;

class UserService extends BaseService
{
    public function getUserInfo(int $userId): array
    {
        // 业务逻辑
    }
}
```

#### Model 层
- 继承 `core\base\BaseModel`
- 定义表名和主键
- 使用访问器修改器
- 定义关联关系

```php
namespace app\model\system;

use core\base\BaseModel;

class User extends BaseModel
{
    protected string $name = 'user';
    protected string $pk = 'id';
    
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
```

#### Validate 层
- 继承 `core\base\BaseValidate`
- 定义验证规则
- 定义场景验证

```php
namespace app\adminapi\validate\system;

use core\base\BaseValidate;

class UserValidate extends BaseValidate
{
    protected array $rule = [
        'username' => 'require|length:3,20',
        'password' => 'require|length:6,20',
        'email'    => 'email',
    ];
    
    protected array $scene = [
        'create' => ['username', 'password', 'email'],
        'update' => ['email', 'status'],
    ];
}
```

### 路由配置

路由文件位于 `app/adminapi/route/` 目录：

```php
<?php
use think\facade\Route;

Route::group('user', function () {
    Route::get('list', 'system.user/list');
    Route::post('create', 'system.user/create');
    Route::put('update/:id', 'system.user/update');
    Route::delete('delete/:id', 'system.user/delete');
});
```

### 中间件使用

#### JWT 认证中间件

```php
// 在 controller 中定义中间件
protected array $middleware = [
    \app\adminapi\middleware\JwtAuth::class,
    \app\adminapi\middleware\Permissions::class,
];
```

#### 自定义中间件

```php
namespace app\adminapi\middleware;

class RecordOperate
{
    public function handle($request, \Closure $next)
    {
        // 记录操作日志
        $response = $next($request);
        return $response;
    }
}
```

### 缓存使用

```php
use think\facade\Cache;

// 设置缓存
Cache::set('key', 'value', 3600);

// 获取缓存
$value = Cache::get('key');

// 删除缓存
Cache::delete('key');

// 清空缓存
Cache::clear();
```

### 日志记录

```php
use think\facade\Log;

// 记录信息
Log::info('操作成功');

// 记录错误
Log::error('操作失败', ['error' => $e->getMessage()]);

// 记录警告
Log::warning('数据异常');
```

## 🔐 安全最佳实践

### 1. 输入验证

所有用户输入必须通过验证器验证：

```php
$this->validate(UserValidate::class, 'create');
```

### 2. SQL 注入防护

禁止字符串拼接 SQL，必须使用参数绑定：

```php
// ✅ 正确
Db::name('user')->where('id', $id)->find();

// ❌ 错误
Db::query("SELECT * FROM user WHERE id = {$id}");
```

### 3. XSS 防护

输出数据时进行转义：

```php
htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
```

### 4. 敏感信息保护

- 密码使用 bcrypt 加密
- 密钥存储在环境变量
- 禁止提交敏感文件到版本控制

### 5. 访问控制

- 所有 API 接口必须验证 Token
- 敏感操作必须验证权限
- 实现数据范围控制

## 📝 API 接口规范

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "time": 1234567890
}
```

### 状态码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器错误

### 分页格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

## 🧪 测试

### 运行测试

```bash
php vendor/bin/phpunit
```

### 代码检查

```bash
php scripts/check-code.php
```

## 🚀 性能优化

### 1. 数据库优化

- 使用索引优化查询
- 避免 N+1 查询问题
- 使用缓存减少数据库压力
- 启用查询缓存

### 2. 缓存策略

- 热点数据缓存
- 字典数据缓存
- 配置数据缓存
- 会话数据缓存

### 3. 代码优化

- 启用 OPcache
- 使用自动加载
- 避免重复计算
- 延迟加载资源

## 📊 监控与日志

### 1. 性能监控

- SQL 执行时间监控
- 接口响应时间监控
- 内存使用监控
- QPS 监控

### 2. 错误监控

- 异常捕获记录
- 错误日志分析
- 告警通知配置

### 3. 业务监控

- 用户行为分析
- 接口调用统计
- 业务流程追踪

## 🔧 常见问题

### 1. 权限不足

检查用户角色和菜单权限配置，确保用户有所需的权限。

### 2. Token 过期

检查 JWT 配置，适当调整 Token 过期时间，或实现 Token 刷新机制。

### 3. 缓存不更新

手动清除缓存或更新缓存版本号。

### 4. 数据库连接失败

检查数据库配置信息，确保数据库服务正常运行。

## 📄 许可证

Apache-2.0 License

## 👥 开发团队

- 核心开发：OnLine OA Team
- 技术栈：ThinkPHP + Vue3 + TypeScript

## 📞 联系方式

- 项目地址：[GitHub](#)
- 问题反馈：[Issues](#)

---

**注意**: 生产环境部署时，请务必：
1. 关闭调试模式 (`APP_DEBUG = false`)
2. 修改默认密钥
3. 设置正确的目录权限
4. 配置 HTTPS
5. 定期备份数据
