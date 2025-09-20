# 认证功能使用指南

本文档详细介绍了 Task Flow Pro 后端系统的 JWT 认证功能的使用方法。

## 功能概述

系统实现了基于 JWT（JSON Web Token）的用户认证功能，包括：

- 用户注册
- 用户登录
- Token 刷新
- 用户信息获取
- 用户登出
- 受保护路由的访问控制

## 环境配置

### 1. 环境变量设置

在项目根目录创建 `.env` 文件：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskflowpro"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"
```

### 2. 数据库迁移

更新数据库 schema 以包含新的用户字段：

```bash
# 生成Prisma客户端
npx prisma generate

# 执行数据库迁移
npx prisma db push
```

## API 端点

### 1. 用户注册

**POST** `/api/auth/register`

注册新用户账户。

**请求体：**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "用户名",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "注册成功"
}
```

### 2. 用户登录

**POST** `/api/auth/login`

用户登录获取访问令牌。

**请求体：**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "用户名",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "登录成功"
}
```

### 3. 刷新访问令牌

**POST** `/api/auth/refresh`

使用 refresh token 获取新的 access token。

**请求体：**

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token"
  },
  "message": "Token刷新成功"
}
```

### 4. 获取当前用户信息

**GET** `/api/auth/me`

获取当前登录用户的详细信息。

**请求头：**

```
Authorization: Bearer jwt_access_token
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "用户名",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "获取用户信息成功"
}
```

### 5. 用户登出

**POST** `/api/auth/logout`

用户登出（客户端需要删除本地存储的 token）。

**请求头：**

```
Authorization: Bearer jwt_access_token
```

**响应：**

```json
{
  "success": true,
  "message": "登出成功"
}
```

## 中间件使用

### 1. 认证中间件

用于保护需要认证的路由：

```typescript
import { authenticateToken } from "../middleware/auth";

// 保护单个路由
router.get("/protected", authenticateToken, (req, res) => {
  // req.user 包含解码后的JWT payload
  res.json({ user: req.user });
});
```

### 2. 角色验证中间件

用于验证用户角色权限：

```typescript
import { requireRole } from "../middleware/auth";

// 只允许管理员访问
router.get(
  "/admin-only",
  authenticateToken,
  requireRole(["ADMIN"]),
  (req, res) => {
    res.json({ message: "管理员专用" });
  }
);

// 允许管理员和项目经理访问
router.get(
  "/management",
  authenticateToken,
  requireRole(["ADMIN", "PROJECT_MANAGER"]),
  (req, res) => {
    res.json({ message: "管理层专用" });
  }
);
```

### 3. 可选认证中间件

用于可选认证的路由：

```typescript
import { optionalAuth } from "../middleware/auth";

// 可选认证，有token时获取用户信息，没有时继续执行
router.get("/public", optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: "已登录用户", user: req.user });
  } else {
    res.json({ message: "匿名用户" });
  }
});
```

## 错误处理

### 常见错误码

- `400` - 请求参数错误
- `401` - 未认证或认证失败
- `403` - 权限不足
- `404` - 用户不存在
- `409` - 用户已存在

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

## 安全注意事项

1. **密码安全**：密码使用 bcrypt 进行哈希加密，盐值轮数为 12
2. **Token 安全**：
   - Access token 有效期：15 分钟
   - Refresh token 有效期：7 天
   - 使用不同的密钥签名 access token 和 refresh token
3. **环境变量**：确保 JWT 密钥足够复杂且保密
4. **HTTPS**：生产环境建议使用 HTTPS 传输

## 测试

使用提供的测试文件 `test-auth.http` 进行 API 测试：

1. 启动服务器：`npm run dev`
2. 使用 VS Code 的 REST Client 插件或 Postman 导入测试文件
3. 按顺序执行测试用例

## 数据库 Schema

用户表包含以下字段：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ... 其他关联字段
}

enum UserRole {
  ADMIN
  PROJECT_MANAGER
  USER
}
```

## 开发建议

1. **前端集成**：

   - 登录成功后保存 token 到 localStorage 或 sessionStorage
   - 在每个 API 请求的 Authorization 头中携带 token
   - 实现 token 自动刷新机制

2. **错误处理**：

   - 处理 401 错误时自动跳转到登录页
   - 处理 403 错误时显示权限不足提示

3. **用户体验**：
   - 实现记住登录状态功能
   - 提供友好的错误提示信息

## 相关文件

- 认证服务：`src/services/auth/authService.ts`
- 认证控制器：`src/controllers/auth/authController.ts`
- 认证路由：`src/routes/auth/auth.routes.ts`
- 认证中间件：`src/middleware/auth.ts`
- 类型定义：`packages/shared-types/src/index.ts`
- 测试文件：`test-auth.http`
