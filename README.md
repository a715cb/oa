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

## License

MIT
