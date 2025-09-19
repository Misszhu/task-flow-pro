# Task Flow Pro Backend API 文档

## 基础信息

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`
- **API Version**: v1

## 通用响应格式

### 成功响应

```json
{
  "data": "响应数据",
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "error": "错误信息",
  "details": "详细错误信息（开发环境）"
}
```

## API 接口

### 1. 基础接口

#### 1.1 获取 API 信息

- **URL**: `GET /`
- **描述**: 获取 API 基本信息
- **响应**:

```json
{
  "message": "Task Flow Pro Backend API"
}
```

### 2. 健康检查接口

#### 2.1 健康检查

- **URL**: `GET /api/health`
- **描述**: 检查服务健康状态
- **响应**:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2.2 数据库连接测试

- **URL**: `GET /api/health/test-db`
- **描述**: 测试数据库连接状态
- **成功响应**:

```json
{
  "message": "数据库连接成功"
}
```

- **错误响应**:

```json
{
  "error": "数据库连接失败",
  "details": "错误详情"
}
```

### 3. 项目管理接口

#### 3.1 获取所有项目

- **URL**: `GET /api/projects`
- **描述**: 获取所有项目列表
- **响应**:

```json
[
  {
    "id": "project_id",
    "name": "项目名称",
    "ownerId": "owner_id",
    "visibility": "PRIVATE",
    "description": "项目描述",
    "deadline": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "owner": {
      "id": "user_id",
      "name": "用户名",
      "email": "user@example.com"
    }
  }
]
```

#### 3.2 创建新项目

- **URL**: `POST /api/projects`
- **描述**: 创建新项目
- **请求体**:

```json
{
  "name": "项目名称",
  "ownerId": "owner_id",
  "visibility": "PRIVATE",
  "description": "项目描述",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

- **参数说明**:
  - `name` (string, 必填): 项目名称
  - `ownerId` (string, 必填): 项目所有者 ID
  - `visibility` (string, 可选): 项目可见性，可选值: `PUBLIC`, `PRIVATE`，默认: `PRIVATE`
  - `description` (string, 可选): 项目描述
  - `deadline` (string, 可选): 项目截止日期，ISO 8601 格式
- **成功响应** (201):

```json
{
  "id": "project_id",
  "name": "项目名称",
  "ownerId": "owner_id",
  "visibility": "PRIVATE",
  "description": "项目描述",
  "deadline": "2024-12-31T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "owner": {
    "id": "user_id",
    "name": "用户名",
    "email": "user@example.com"
  }
}
```

#### 3.3 获取单个项目

- **URL**: `GET /api/projects/:id`
- **描述**: 根据 ID 获取项目详情
- **路径参数**:
  - `id` (string): 项目 ID
- **成功响应**:

```json
{
  "id": "project_id",
  "name": "项目名称",
  "ownerId": "owner_id",
  "visibility": "PRIVATE",
  "description": "项目描述",
  "deadline": "2024-12-31T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "owner": {
    "id": "user_id",
    "name": "用户名",
    "email": "user@example.com"
  },
  "members": [
    {
      "id": "member_id",
      "projectId": "project_id",
      "userId": "user_id",
      "role": "VIEWER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "name": "用户名",
        "email": "user@example.com"
      }
    }
  ]
}
```

- **错误响应** (404):

```json
{
  "error": "项目不存在"
}
```

### 4. 项目成员管理接口

#### 4.1 添加项目成员

- **URL**: `POST /api/projects/:projectId/members`
- **描述**: 向项目添加新成员
- **路径参数**:
  - `projectId` (string): 项目 ID
- **请求体**:

```json
{
  "userId": "user_id",
  "role": "VIEWER"
}
```

- **参数说明**:
  - `userId` (string, 必填): 用户 ID
  - `role` (string, 可选): 成员角色，可选值: `VIEWER`, `COLLABORATOR`, `MANAGER`，默认: `VIEWER`
- **成功响应** (201):

```json
{
  "id": "member_id",
  "projectId": "project_id",
  "userId": "user_id",
  "role": "VIEWER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "name": "用户名",
    "email": "user@example.com"
  }
}
```

- **错误响应**:
  - 400: `{"error": "用户已经是项目成员"}` 或 `{"error": "无效的角色类型"}`
  - 404: `{"error": "项目不存在"}` 或 `{"error": "用户不存在"}`

#### 4.2 获取项目成员列表

- **URL**: `GET /api/projects/:projectId/members`
- **描述**: 获取项目的所有成员
- **路径参数**:
  - `projectId` (string): 项目 ID
- **响应**:

```json
[
  {
    "id": "member_id",
    "projectId": "project_id",
    "userId": "user_id",
    "role": "VIEWER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user_id",
      "name": "用户名",
      "email": "user@example.com"
    }
  }
]
```

#### 4.3 更新项目成员角色

- **URL**: `PUT /api/projects/:projectId/members/:userId`
- **描述**: 更新项目成员的角色
- **路径参数**:
  - `projectId` (string): 项目 ID
  - `userId` (string): 用户 ID
- **请求体**:

```json
{
  "role": "COLLABORATOR"
}
```

- **参数说明**:
  - `role` (string, 必填): 新的成员角色，可选值: `VIEWER`, `COLLABORATOR`, `MANAGER`
- **成功响应**:

```json
{
  "id": "member_id",
  "projectId": "project_id",
  "userId": "user_id",
  "role": "COLLABORATOR",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "name": "用户名",
    "email": "user@example.com"
  }
}
```

- **错误响应**:
  - 400: `{"error": "无效的角色类型"}`

#### 4.4 移除项目成员

- **URL**: `DELETE /api/projects/:projectId/members/:userId`
- **描述**: 从项目中移除成员
- **路径参数**:
  - `projectId` (string): 项目 ID
  - `userId` (string): 用户 ID
- **成功响应**:

```json
{
  "message": "成员已移除"
}
```

## 数据模型

### 项目 (Project)

```typescript
interface Project {
  id: string;
  name: string;
  ownerId: string;
  visibility: "PUBLIC" | "PRIVATE";
  description?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  members: ProjectMember[];
}
```

### 项目成员 (ProjectMember)

```typescript
interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: "VIEWER" | "COLLABORATOR" | "MANAGER";
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
```

### 用户 (User)

```typescript
interface User {
  id: string;
  name?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 错误码说明

| HTTP 状态码 | 说明           |
| ----------- | -------------- |
| 200         | 请求成功       |
| 201         | 创建成功       |
| 400         | 请求参数错误   |
| 404         | 资源不存在     |
| 500         | 服务器内部错误 |

## 使用示例

### 创建项目并添加成员

```bash
# 1. 创建项目
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的项目",
    "ownerId": "user123",
    "description": "这是一个测试项目",
    "visibility": "PRIVATE"
  }'

# 2. 添加项目成员
curl -X POST http://localhost:3001/api/projects/project_id/members \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user456",
    "role": "COLLABORATOR"
  }'

# 3. 获取项目详情
curl http://localhost:3001/api/projects/project_id
```

## 注意事项

1. 所有日期时间字段都使用 ISO 8601 格式
2. 项目 ID 和用户 ID 使用 CUID 格式
3. 角色字段区分大小写，必须使用预定义的值
4. 在开发环境中，错误响应会包含详细的错误信息
5. 所有 API 都支持 CORS 跨域请求
