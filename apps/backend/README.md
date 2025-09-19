# Task Flow Pro Backend

任务流程管理系统的后端服务，基于 Node.js + Express + Prisma 构建。

## 技术栈

- **Node.js** - 运行时环境
- **Express** - Web 框架
- **TypeScript** - 类型安全的 JavaScript
- **Prisma** - 数据库 ORM
- **PostgreSQL** - 数据库

## 项目结构

```
src/
├── controllers/          # 控制器层
├── services/            # 服务层
├── routes/              # 路由层
├── middleware/          # 中间件
├── lib/                 # 工具库
└── index.ts            # 应用入口
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env` 文件：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow"
PORT=3001
NODE_ENV=development
```

### 数据库设置

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 查看数据库（可选）
npx prisma studio
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## API 文档

- [API 概览](./API_OVERVIEW.md) - 快速查看所有接口
- [详细文档](./API_DOCUMENTATION.md) - 完整的 API 文档
- [Swagger 文档](./swagger.json) - OpenAPI 3.0 格式

## 开发指南

### 添加新的 API 模块

1. 在 `controllers/` 下创建控制器
2. 在 `services/` 下创建服务
3. 在 `routes/` 下创建路由
4. 在 `routes/index.ts` 中注册路由

详细说明请参考 [架构文档](./src/ARCHITECTURE.md)。

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写清晰的注释和文档

## 测试

```bash
# 运行测试
npm test

# 健康检查
curl http://localhost:3001/api/health

# 数据库连接测试
curl http://localhost:3001/api/health/test-db
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t task-flow-pro-backend .

# 运行容器
docker run -p 3001:3001 task-flow-pro-backend
```

### 环境变量

生产环境需要设置以下环境变量：

- `DATABASE_URL` - 数据库连接字符串
- `PORT` - 服务端口（默认 3001）
- `NODE_ENV` - 环境模式（production）

## 许可证

MIT License
