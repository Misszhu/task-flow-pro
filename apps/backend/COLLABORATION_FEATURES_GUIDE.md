# 任务协作功能使用指南

## 🎯 功能概述

Phase 2 协作功能为任务管理系统添加了强大的团队协作能力，包括任务评论、标签管理、子任务支持和活动日志等核心功能。

## 📋 协作功能

### 1. 任务评论系统 💬

- ✅ **创建评论** - 为任务添加评论和讨论
- ✅ **获取评论列表** - 查看任务的所有评论
- ✅ **更新评论** - 编辑自己的评论
- ✅ **删除评论** - 删除自己的评论
- ✅ **权限控制** - 只有任务相关人员可以评论

### 2. 任务标签管理 🏷️

- ✅ **创建标签** - 创建自定义标签
- ✅ **标签搜索** - 按名称搜索标签
- ✅ **分配标签** - 为任务分配多个标签
- ✅ **获取任务标签** - 查看任务的标签
- ✅ **标签颜色** - 支持自定义标签颜色

### 3. 子任务支持 📝

- ✅ **创建子任务** - 将复杂任务分解为子任务
- ✅ **子任务列表** - 查看父任务的所有子任务
- ✅ **继承项目** - 子任务自动继承父任务的项目
- ✅ **独立管理** - 子任务可以独立分配和更新
- ✅ **权限控制** - 基于父任务的权限控制

### 4. 活动日志 📊

- ✅ **自动记录** - 自动记录所有任务操作
- ✅ **操作类型** - 创建、更新、评论、分配等操作
- ✅ **详细信息** - 记录操作的具体内容和变更
- ✅ **用户追踪** - 记录操作用户和时间
- ✅ **统计分析** - 提供活动统计功能

## 🔗 API 端点

### 任务评论

```
POST   /api/tasks/{taskId}/comments          # 创建评论
GET    /api/tasks/{taskId}/comments          # 获取评论列表
PUT    /api/tasks/comments/{commentId}       # 更新评论
DELETE /api/tasks/comments/{commentId}       # 删除评论
```

### 任务标签

```
POST   /api/tasks/tags                       # 创建标签
GET    /api/tasks/tags                       # 获取所有标签
GET    /api/tasks/tags/search                # 搜索标签
PATCH  /api/tasks/{taskId}/tags              # 分配标签
GET    /api/tasks/{taskId}/tags              # 获取任务标签
```

### 子任务

```
POST   /api/tasks/{taskId}/subtasks          # 创建子任务
GET    /api/tasks/{taskId}/subtasks          # 获取子任务列表
```

### 活动日志

```
GET    /api/tasks/{taskId}/activities        # 获取任务活动日志
GET    /api/tasks/activities/my              # 获取我的活动日志
GET    /api/tasks/{taskId}/activities/stats  # 获取活动统计
```

## 📊 数据模型

### 任务评论 (TaskComment)

```typescript
interface TaskComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorId: string;
  author?: UserWithoutPassword;
}
```

### 任务标签 (TaskTag)

```typescript
interface TaskTag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 任务活动 (TaskActivity)

```typescript
interface TaskActivity {
  id: string;
  action: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  taskId: string;
  userId: string;
  user?: UserWithoutPassword;
}
```

## 🔐 权限控制

### 评论权限

- **任务创建者** - 可以查看和评论
- **任务分配者** - 可以查看和评论
- **项目成员** - 可以查看和评论项目任务
- **评论作者** - 可以编辑和删除自己的评论

### 标签权限

- **所有用户** - 可以创建和搜索标签
- **任务相关人员** - 可以为任务分配标签

### 子任务权限

- **父任务创建者** - 可以创建和管理子任务
- **父任务分配者** - 可以创建和管理子任务
- **项目管理员** - 可以管理项目内所有子任务

## 📝 使用示例

### 创建任务评论

```json
POST /api/tasks/{taskId}/comments
{
  "content": "开始处理这个任务，预计需要2天完成"
}
```

### 创建标签

```json
POST /api/tasks/tags
{
  "name": "前端开发",
  "color": "#4ecdc4"
}
```

### 分配标签

```json
PATCH /api/tasks/{taskId}/tags
{
  "tagIds": ["tag_id_1", "tag_id_2"]
}
```

### 创建子任务

```json
POST /api/tasks/{taskId}/subtasks
{
  "title": "设计数据库表结构",
  "description": "为任务管理系统设计相关表结构",
  "priority": "HIGH",
  "dueDate": "2024-02-15T18:00:00.000Z"
}
```

## 🧪 测试

使用 `test-collaboration.http` 文件进行 API 测试：

1. 首先注册/登录获取 JWT token
2. 创建测试任务
3. 测试各种协作功能
4. 验证权限控制

### 测试用例包括：

- ✅ 任务评论的 CRUD 操作
- ✅ 标签的创建、搜索和分配
- ✅ 子任务的创建和管理
- ✅ 活动日志的查看和统计
- ✅ 权限控制测试
- ✅ 错误情况测试

## 📈 功能特点

### 1. 实时协作

- 团队成员可以实时评论和讨论任务
- 活动日志记录所有操作历史
- 支持@提及和通知功能（待实现）

### 2. 灵活组织

- 标签系统支持多维度分类
- 子任务支持复杂任务分解
- 支持任务依赖关系（待实现）

### 3. 权限安全

- 基于 JWT 的身份认证
- 细粒度的权限控制
- 数据隔离和访问控制

### 4. 可扩展性

- 模块化的服务设计
- 支持自定义标签和字段
- 易于添加新的协作功能

## 🚀 下一步功能

### Phase 3: 高级协作功能

- [ ] 任务依赖关系
- [ ] 时间跟踪和工时统计
- [ ] 文件附件和版本控制
- [ ] 实时通知系统
- [ ] 任务模板和批量操作
- [ ] 高级搜索和筛选
- [ ] 数据导出和报告

## 📚 相关文档

- [任务管理指南](./TASK_MANAGEMENT_GUIDE.md) - 基础任务管理功能
- [认证指南](./AUTH_GUIDE.md) - JWT 认证使用
- [API 文档](http://localhost:3001/api-docs) - Swagger UI
- [响应格式](./RESPONSE_FORMAT.md) - 统一响应结构

## 🔧 技术实现

### 数据库设计

- 使用 Prisma ORM 管理数据库
- 支持多对多关系（任务-标签）
- 自引用关系（任务-子任务）
- 活动日志表记录所有操作

### 服务架构

- 模块化的服务层设计
- 统一的权限控制中间件
- 自动化的活动日志记录
- 类型安全的 API 接口

### 性能优化

- 分页查询支持
- 索引优化
- 关联查询优化
- 缓存策略（待实现）

---

**协作功能已成功实现！** 🎉

所有 Phase 2 协作功能都已测试通过，可以开始使用强大的团队协作功能了。
