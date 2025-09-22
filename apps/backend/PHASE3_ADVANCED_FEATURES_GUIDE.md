# Phase 3 高级功能使用指南

## 🎯 功能概述

Phase 3 为任务管理系统添加了强大的高级功能，包括任务依赖关系、时间跟踪、文件附件、通知系统、任务模板和高级搜索等企业级功能。

## 📋 高级功能

### 1. 任务依赖关系 🔗

- ✅ **创建依赖** - 设置任务之间的依赖关系
- ✅ **循环检测** - 自动检测并防止循环依赖
- ✅ **依赖链** - 查看完整的依赖链
- ✅ **阻塞检测** - 识别被阻塞的任务
- ✅ **前置/后置任务** - 管理任务的前置和后置依赖

### 2. 时间跟踪 ⏱️

- ✅ **时间记录** - 记录任务工作时间
- ✅ **自动计算** - 自动计算工作时长
- ✅ **时间统计** - 提供详细的时间统计
- ✅ **运行中记录** - 支持实时时间跟踪
- ✅ **用户统计** - 个人和团队时间分析

### 3. 文件附件 📎

- ✅ **文件上传** - 支持多种文件类型上传
- ✅ **文件管理** - 查看、下载、删除附件
- ✅ **文件验证** - 文件类型和大小验证
- ✅ **存储管理** - 安全的文件存储
- ✅ **附件统计** - 文件使用情况统计

### 4. 通知系统 🔔

- ✅ **实时通知** - 任务状态变更通知
- ✅ **多种类型** - 分配、更新、完成、评论等通知
- ✅ **批量通知** - 支持批量发送通知
- ✅ **通知管理** - 标记已读、删除通知
- ✅ **智能通知** - 基于用户行为的智能通知

### 5. 任务模板 📋

- ✅ **模板创建** - 创建可复用的任务模板
- ✅ **模板管理** - 编辑、删除、复制模板
- ✅ **公共模板** - 支持公共和私有模板
- ✅ **模板搜索** - 快速查找所需模板
- ✅ **从模板创建** - 基于模板快速创建任务

### 6. 高级搜索 🔍

- ✅ **多条件搜索** - 支持复杂的搜索条件
- ✅ **智能建议** - 搜索建议和自动完成
- ✅ **搜索历史** - 保存和查看搜索历史
- ✅ **全局搜索** - 跨所有实体的搜索
- ✅ **搜索统计** - 搜索使用情况分析

## 🔗 API 端点

### 任务依赖关系

```
POST   /api/tasks/{taskId}/dependencies          # 创建依赖关系
GET    /api/tasks/{taskId}/predecessors          # 获取前置任务
GET    /api/tasks/{taskId}/successors            # 获取后置任务
DELETE /api/tasks/dependencies/{dependencyId}    # 删除依赖关系
GET    /api/tasks/blocked                        # 获取被阻塞的任务
```

### 时间跟踪

```
POST   /api/tasks/{taskId}/time-entries          # 创建时间记录
GET    /api/tasks/{taskId}/time-entries          # 获取时间记录
PUT    /api/tasks/time-entries/{entryId}         # 更新时间记录
DELETE /api/tasks/time-entries/{entryId}         # 删除时间记录
GET    /api/tasks/{taskId}/time-stats            # 获取时间统计
POST   /api/tasks/time-entries/{entryId}/stop    # 停止时间记录
```

### 文件附件

```
POST   /api/tasks/{taskId}/attachments           # 上传附件
GET    /api/tasks/{taskId}/attachments           # 获取附件列表
GET    /api/tasks/attachments/{attachmentId}     # 下载附件
DELETE /api/tasks/attachments/{attachmentId}     # 删除附件
GET    /api/tasks/{taskId}/attachment-stats      # 获取附件统计
```

### 通知系统

```
GET    /api/notifications                        # 获取通知列表
GET    /api/notifications/unread-count           # 获取未读数量
PUT    /api/notifications/{notificationId}/read  # 标记已读
PUT    /api/notifications/read-all               # 标记所有已读
DELETE /api/notifications/{notificationId}       # 删除通知
GET    /api/notifications/stats                  # 获取通知统计
```

### 任务模板

```
POST   /api/task-templates                        # 创建模板
GET    /api/task-templates                        # 获取模板列表
GET    /api/task-templates/{templateId}           # 获取模板详情
PUT    /api/task-templates/{templateId}           # 更新模板
DELETE /api/task-templates/{templateId}           # 删除模板
POST   /api/task-templates/{templateId}/copy      # 复制模板
POST   /api/task-templates/{templateId}/create-task # 从模板创建任务
```

### 高级搜索

```
POST   /api/search/advanced                       # 高级搜索
GET    /api/search/suggestions                    # 获取搜索建议
GET    /api/search/history                        # 获取搜索历史
DELETE /api/search/history                        # 清除搜索历史
GET    /api/search/popular                        # 获取热门搜索
GET    /api/search/global                         # 全局搜索
```

## 📊 数据模型

### 任务依赖关系

```typescript
interface TaskDependency {
  id: string;
  createdAt: Date;
  predecessorId: string;
  successorId: string;
  predecessor?: Task;
  successor?: Task;
}
```

### 时间记录

```typescript
interface TimeEntry {
  id: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // 分钟
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
  user?: UserWithoutPassword;
}
```

### 文件附件

```typescript
interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  uploadedBy: string;
  uploader?: UserWithoutPassword;
}
```

### 通知

```typescript
interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  userId: string;
  taskId?: string;
  task?: Task;
}
```

### 任务模板

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  title: string;
  content?: string; // JSON格式
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creator?: UserWithoutPassword;
}
```

## 🔐 权限控制

### 依赖关系权限

- **任务创建者** - 可以管理任务依赖
- **项目管理员** - 可以管理项目内所有依赖
- **任务分配者** - 可以查看依赖关系

### 时间跟踪权限

- **记录创建者** - 可以编辑和删除自己的记录
- **任务相关人员** - 可以查看任务时间记录
- **项目管理员** - 可以管理项目内所有时间记录

### 文件附件权限

- **上传者** - 可以删除自己上传的文件
- **任务相关人员** - 可以查看和下载附件
- **项目管理员** - 可以管理项目内所有附件

### 通知权限

- **用户本人** - 只能查看和管理自己的通知
- **系统** - 可以创建通知

### 模板权限

- **模板创建者** - 可以编辑和删除自己的模板
- **所有用户** - 可以查看公共模板
- **项目管理员** - 可以管理项目内模板

## 📝 使用示例

### 创建任务依赖

```json
POST /api/tasks/{taskId}/dependencies
{
  "predecessorId": "task_id_1",
  "successorId": "task_id_2"
}
```

### 记录工作时间

```json
POST /api/tasks/{taskId}/time-entries
{
  "description": "实现用户认证功能",
  "startTime": "2024-01-20T09:00:00.000Z",
  "endTime": "2024-01-20T11:30:00.000Z"
}
```

### 上传文件附件

```json
POST /api/tasks/{taskId}/attachments
Content-Type: multipart/form-data

file: [binary data]
```

### 创建任务模板

```json
POST /api/task-templates
{
  "name": "Bug修复模板",
  "description": "用于修复bug的标准模板",
  "title": "修复: {bug_description}",
  "content": "{\"priority\":\"HIGH\",\"tags\":[\"bug\",\"fix\"]}",
  "isPublic": true
}
```

### 高级搜索

```json
POST /api/search/advanced
{
  "query": "用户认证",
  "filters": {
    "status": ["TODO", "IN_PROGRESS"],
    "priority": ["HIGH", "URGENT"],
    "hasAttachments": true,
    "dateFrom": "2024-01-01T00:00:00.000Z"
  },
  "sortBy": "priority",
  "sortOrder": "desc"
}
```

## 🧪 测试

使用 `test-phase3.http` 文件进行 API 测试：

1. 首先注册/登录获取 JWT token
2. 创建测试任务
3. 测试各种高级功能
4. 验证权限控制

### 测试用例包括：

- ✅ 任务依赖关系的创建和管理
- ✅ 时间跟踪的完整流程
- ✅ 文件附件的上传和下载
- ✅ 通知系统的各种场景
- ✅ 任务模板的创建和使用
- ✅ 高级搜索的各种条件
- ✅ 权限控制测试
- ✅ 错误情况测试

## 📈 功能特点

### 1. 企业级功能

- 完整的任务依赖管理
- 精确的时间跟踪和统计
- 安全的文件管理
- 智能的通知系统

### 2. 高度可配置

- 灵活的任务模板系统
- 强大的搜索和筛选
- 可自定义的通知类型
- 支持多种文件类型

### 3. 性能优化

- 高效的数据库查询
- 智能的缓存策略
- 分页和限制支持
- 异步处理支持

### 4. 安全性

- 文件类型验证
- 大小限制控制
- 权限细粒度控制
- 数据隔离保护

## 🚀 扩展功能

### 未来可添加的功能

- [ ] 实时协作编辑
- [ ] 工作流自动化
- [ ] 数据分析和报告
- [ ] 移动端支持
- [ ] 第三方集成
- [ ] 高级权限管理
- [ ] 自定义字段
- [ ] 数据导入导出

## 📚 相关文档

- [任务管理指南](./TASK_MANAGEMENT_GUIDE.md) - 基础任务管理功能
- [协作功能指南](./COLLABORATION_FEATURES_GUIDE.md) - Phase 2 协作功能
- [认证指南](./AUTH_GUIDE.md) - JWT 认证使用
- [API 文档](http://localhost:3001/api-docs) - Swagger UI
- [响应格式](./RESPONSE_FORMAT.md) - 统一响应结构

## 🔧 技术实现

### 数据库设计

- 使用 Prisma ORM 管理复杂关系
- 支持多对多关系（任务-标签）
- 自引用关系（任务-依赖）
- 文件存储和元数据管理

### 服务架构

- 模块化的服务层设计
- 统一的权限控制中间件
- 自动化的通知系统
- 高效的文件处理

### 性能优化

- 数据库索引优化
- 查询性能优化
- 文件存储优化
- 缓存策略实现

---

**Phase 3 高级功能已成功实现！** 🎉

所有企业级功能都已测试通过，可以开始使用强大的高级功能了。
