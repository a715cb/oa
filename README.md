# OA 办公管理系统

一个基于 ThinkPHP + Vue 的现代化 OA 办公管理系统。

## 技术栈

### 后端
- PHP 8.0+
- ThinkPHP 8.x
- MySQL 5.7+
- JWT 认证

### 前端
- Vue 3
- TypeScript
- Ant Design Vue
- Vite

## 功能特性

- 用户管理
- 角色权限管理
- 部门管理
- 菜单管理
- 字典管理
- 操作日志
- 登录日志
- 代码生成器

## 快速开始

### 环境要求

- PHP >= 8.0
- MySQL >= 5.7
- Node.js >= 16
- Composer

### 后端安装

```bash
cd backend
composer install
cp .env.example .env
# 配置数据库信息
```

### 前端安装

```bash
cd frontend
npm install
npm run dev
```

### 数据库初始化

```bash
mysql -u root -p < backend/sql/install.sql
```

## 目录结构

```
oa/
├── backend/          # 后端代码
│   ├── app/         # 应用代码
│   ├── config/      # 配置文件
│   └── sql/         # 数据库脚本
├── frontend/         # 前端代码
│   ├── src/         # 源代码
│   └── public/      # 静态资源
├── docs/            # 项目文档
└── scripts/         # 辅助脚本
```

---

## 架构概览

### 核心设计模式

本项目采用 **BaseController + BaseService** 分层架构模式，实现关注点分离和代码复用。

#### 架构图
```
┌─────────────────────────────────────────┐
│           Controller 层                  │
│  (处理 HTTP 请求、参数验证、响应格式化)     │
│         BaseController                   │
└────────────────┬────────────────────────┘
                 │ 调用
┌────────────────▼────────────────────────┐
│           Service 层                     │
│  (业务逻辑、事务管理、数据组装)            │
│          BaseService                     │
└────────────────┬────────────────────────┘
                 │ 调用
┌────────────────▼────────────────────────┐
│           Model 层                       │
│  (数据访问、查询构建、关联关系)            │
│          BaseModel                       │
└─────────────────────────────────────────┘
```

### BaseController 模式

所有控制器继承自 `core\base\BaseController`，提供统一的能力：

- **响应格式化**: 通过 `ResponseTrait` 提供 `success()` / `error()` 方法
- **参数验证**: `validateData()` 统一数据验证入口
- **ID 验证**: `validateId()` 确保 ID 参数有效性
- **执行封装**: `executeWithResult()` 统一处理业务执行和异常捕获

使用示例：
```php
class UserController extends BaseController
{
    public function save(): \think\Response
    {
        $data = $this->validateData(UserValidate::class, $this->request->param());
        return $this->executeWithResult(
            fn() => $this->userService->save($data),
            '创建用户'
        );
    }
}
```

### BaseService 模式

所有服务类继承自 `core\base\BaseService`，提供统一的能力：

- **事务管理**: `withTransaction()` 统一事务包装方法
- **错误处理**: `getError()` / `setError()` 错误信息管理
- **模型注入**: 通过构造函数注入 Model 实例

使用示例：
```php
class UserService extends BaseService
{
    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function save(array $data): bool
    {
        return $this->withTransaction(function () use ($data): void {
            $this->model->storeBy($data);
            $this->model->saveRoles($data['roles']);
        });
    }
}
```

### 事务管理指南

1. **所有写操作必须使用事务**: 通过 `withTransaction()` 包装
2. **事务内操作应尽量简短**: 减少锁持有时间
3. **避免在事务中执行外部 API 调用**: 防止长时间阻塞
4. **写操作后清除相关缓存**: 确保数据一致性

---

## 类型安全改进

### PHP 严格类型

- 所有 PHP 文件必须声明 `declare(strict_types=1);`
- 所有方法必须使用类型提示和返回类型
- 禁止隐式类型转换

### TypeScript 类型安全

- 前端使用严格的 TypeScript 类型检查
- 所有 API 接口定义在 `types/system.ts`
- E2E 测试复用相同的类型定义

---

## 代码质量标准

### PHP 规范
- 严格类型声明: `declare(strict_types=1);`
- 类型提示: 方法参数和返回值必须声明类型
- 命名规范: 类名 PascalCase, 方法/变量 camelCase
- 业务逻辑必须放在 Service 层
- 禁止硬编码敏感信息
- 禁止 SQL 字符串拼接，必须使用参数绑定
- 禁止使用 `eval()`, `system()` 等不安全函数

### TypeScript 规范
- 使用 Composition API (setup 语法糖)
- 严格 TypeScript 类型检查
- 组件名 PascalCase, 文件/目录 kebab-case
- 优先使用 interface 定义类型
- 禁止使用 `console.log`，使用 logger 工具

---

## 性能最佳实践

1. **缓存策略**: 高频读取数据使用 `cache(60)` 缓存
2. **N+1 查询预防**: 使用 `with()` 预加载关联数据
3. **字段选择**: 仅查询需要的字段，避免 `SELECT *`
4. **分页查询**: 列表数据必须使用 `paginate()` 分页

## License

MIT
