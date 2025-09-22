# 任务管理功能使用指南

## 🎯 功能概述

任务管理模块提供了完整的任务生命周期管理功能，包括创建、读取、更新、删除任务，以及状态管理、优先级管理、任务分配等核心功能。

## 📋 核心功能

### 1. 任务 CRUD 操作

- ✅ **创建任务** - 支持设置标题、描述、优先级、截止日期等
- ✅ **读取任务** - 支持获取单个任务和任务列表
- ✅ **更新任务** - 支持修改任务的所有属性
- ✅ **删除任务** - 支持删除任务（仅创建者可删除）

### 2. 状态管理

- ✅ **TODO** - 待办任务
- ✅ **IN_PROGRESS** - 进行中
- ✅ **COMPLETED** - 已完成（自动设置完成时间）
- ✅ **CANCELLED** - 已取消

### 3. 优先级管理

- ✅ **LOW** - 低优先级
- ✅ **MEDIUM** - 中等优先级（默认）
- ✅ **HIGH** - 高优先级
- ✅ **URGENT** - 紧急

### 4. 任务分配

- ✅ **分配任务** - 将任务分配给团队成员
- ✅ **我的任务** - 查看分配给自己的任务
- ✅ **我创建的任务** - 查看自己创建的任务

### 5. 截止日期

- ✅ **设置截止日期** - 支持设置任务的截止时间
- ✅ **日期筛选** - 支持按日期范围筛选任务

## 🔗 API 端点

### 基础任务操作

```
POST   /api/tasks                    # 创建任务
GET    /api/tasks                    # 获取任务列表
GET    /api/tasks/:id                # 获取单个任务
PUT    /api/tasks/:id                # 更新任务
DELETE /api/tasks/:id                # 删除任务
```

### 任务状态管理

```
PATCH  /api/tasks/:id/status         # 更新任务状态
PATCH  /api/tasks/:id/assign         # 分配任务
```

### 个人任务视图

```
GET    /api/tasks/my                 # 获取我的任务
GET    /api/tasks/created            # 获取我创建的任务
```

## 📊 查询参数

### 任务列表筛选

- `projectId` - 按项目筛选
- `assigneeId` - 按分配者筛选
- `creatorId` - 按创建者筛选
- `status` - 按状态筛选 (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - 按优先级筛选 (LOW, MEDIUM, HIGH, URGENT)
- `search` - 按标题或描述搜索
- `dueDateFrom` - 截止日期开始
- `dueDateTo` - 截止日期结束

### 分页参数

- `page` - 页码（默认：1）
- `limit` - 每页数量（默认：10）

## 🔐 权限控制

### 任务访问权限

- **任务创建者** - 拥有所有权限
- **任务分配者** - 可以编辑状态和优先级
- **项目成员** - 可以查看项目相关任务
- **其他用户** - 无权限访问

### 任务编辑权限

- **任务创建者** - 可以编辑所有字段
- **任务分配者** - 可以编辑状态和优先级
- **项目管理员** - 可以管理项目内所有任务

## 📝 请求示例

### 创建任务

```json
POST /api/tasks
{
  "title": "实现用户认证功能",
  "description": "完成JWT认证系统的开发",
  "priority": "HIGH",
  "projectId": "project_id_here",
  "assigneeId": "user_id_here",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

### 更新任务状态

```json
PATCH /api/tasks/:id/status
{
  "status": "IN_PROGRESS"
}
```

### 分配任务

```json
PATCH /api/tasks/:id/assign
{
  "assigneeId": "new_assignee_id"
}
```

## 📈 响应格式

所有 API 响应都遵循统一的格式：

```json
{
  "data": {
    // 实际数据
  },
  "message": "操作成功",
  "success": true,
  "statusCode": 200,
  "timestamp": "2025-01-20T09:05:23.891Z"
}
```

### 任务列表响应

```json
{
  "data": {
    "data": [
      {
        "id": "task_id",
        "title": "任务标题",
        "description": "任务描述",
        "status": "TODO",
        "priority": "HIGH",
        "dueDate": "2024-12-31T23:59:59.000Z",
        "completedAt": null,
        "createdAt": "2025-01-20T09:05:07.711Z",
        "updatedAt": "2025-01-20T09:05:07.711Z",
        "projectId": null,
        "assigneeId": null,
        "creatorId": "creator_id",
        "assignee": null,
        "creator": {
          "id": "creator_id",
          "email": "user@example.com",
          "name": "User Name",
          "role": "USER"
        },
        "project": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "获取任务列表成功",
  "success": true,
  "statusCode": 200,
  "timestamp": "2025-01-20T09:05:23.891Z"
}
```

## 🧪 测试

使用 `test-tasks.http` 文件进行 API 测试：

1. 首先注册/登录获取 JWT token
2. 将 token 替换到测试文件中的 `@token` 变量
3. 运行各种测试用例

### 测试用例包括：

- ✅ 创建任务（各种优先级和状态）
- ✅ 获取任务列表（带筛选和分页）
- ✅ 更新任务状态
- ✅ 分配任务
- ✅ 获取个人任务视图
- ✅ 错误情况测试
- ✅ 权限测试

## 🚀 下一步功能

### Phase 2: 协作功能

- [ ] 任务评论系统
- [ ] 任务标签
- [ ] 子任务支持
- [ ] 活动日志

### Phase 3: 高级功能

- [ ] 任务依赖关系
- [ ] 时间跟踪
- [ ] 文件附件
- [ ] 通知系统

## 📚 相关文档

- [API 文档](http://localhost:3001/api-docs) - Swagger UI
- [认证指南](./AUTH_GUIDE.md) - JWT 认证使用
- [响应格式](./RESPONSE_FORMAT.md) - 统一响应结构
- [项目 API](./API_OVERVIEW.md) - 项目管理功能

## 🔧 技术实现

### 数据库设计

- 使用 Prisma ORM
- PostgreSQL 数据库
- 支持任务与用户、项目的关联关系

### 权限控制

- JWT token 认证
- 基于角色的访问控制
- 任务级别的权限验证

### 性能优化

- 分页查询
- 索引优化
- 关联查询优化

---

**任务管理功能已成功实现！** 🎉

所有核心功能都已测试通过，可以开始使用任务管理功能了。
