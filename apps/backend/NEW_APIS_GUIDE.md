# 新 API 功能使用指南

## 🎯 概述

本文档介绍了新实现的三个高优先级 API 功能：

- **通知系统 API** - 用户体验关键
- **文件上传功能** - 基础功能需求
- **时间跟踪 API** - 核心业务功能

## 🔔 通知系统 API

### 基础信息

- **Base URL**: `/api/notifications`
- **认证**: 需要 Bearer Token

### 主要端点

#### 1. 获取用户通知列表

```http
GET /api/notifications
```

**查询参数**:

- `page` (integer): 页码，默认 1
- `limit` (integer): 每页数量，默认 20，最大 100
- `type` (string): 通知类型过滤
- `isRead` (boolean): 是否已读过滤
- `dateFrom` (string): 开始日期 (ISO 8601)
- `dateTo` (string): 结束日期 (ISO 8601)

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/notifications?page=1&limit=10&isRead=false"
```

#### 2. 获取未读通知数量

```http
GET /api/notifications/unread-count
```

#### 3. 标记通知为已读

```http
PATCH /api/notifications/{notificationId}/read
```

#### 4. 标记所有通知为已读

```http
PATCH /api/notifications/mark-all-read
```

#### 5. 删除通知

```http
DELETE /api/notifications/{notificationId}
```

#### 6. 获取通知统计

```http
GET /api/notifications/stats
```

### 通知类型

- `TASK_ASSIGNED` - 任务分配
- `TASK_UPDATED` - 任务更新
- `TASK_COMPLETED` - 任务完成
- `TASK_COMMENTED` - 任务评论
- `TASK_DUE_SOON` - 任务即将到期
- `TASK_OVERDUE` - 任务逾期
- `DEPENDENCY_BLOCKED` - 依赖阻塞
- `DEPENDENCY_UNBLOCKED` - 依赖解除
- `SYSTEM` - 系统通知

## 📎 文件上传 API

### 基础信息

- **Base URL**: `/api/files`
- **认证**: 需要 Bearer Token
- **文件大小限制**: 10MB
- **支持格式**: 图片、文档、压缩包等

### 主要端点

#### 1. 上传文件到任务

```http
POST /api/files/tasks/{taskId}/upload
```

**请求类型**: `multipart/form-data`
**参数**:

- `file` (file): 要上传的文件

**示例**:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  "http://localhost:3001/api/files/tasks/TASK_ID/upload"
```

#### 2. 批量上传文件

```http
POST /api/files/tasks/{taskId}/upload-multiple
```

**参数**:

- `files` (file[]): 文件数组，最多 5 个

#### 3. 获取任务附件列表

```http
GET /api/files/tasks/{taskId}/attachments
```

#### 4. 获取附件详情

```http
GET /api/files/attachments/{attachmentId}
```

#### 5. 下载附件

```http
GET /api/files/attachments/{attachmentId}/download
```

#### 6. 删除附件

```http
DELETE /api/files/attachments/{attachmentId}
```

#### 7. 获取附件统计

```http
GET /api/files/stats
```

**查询参数**:

- `taskId` (string): 任务 ID 过滤
- `userId` (string): 用户 ID 过滤

### 支持的文件类型

- **图片**: JPEG, PNG, GIF, WebP
- **文档**: PDF, DOC, DOCX, XLS, XLSX
- **文本**: TXT, CSV
- **压缩包**: ZIP, RAR

## ⏱️ 时间跟踪 API

### 基础信息

- **Base URL**: `/api/time-tracking`
- **认证**: 需要 Bearer Token

### 主要端点

#### 1. 创建时间记录

```http
POST /api/time-tracking
```

**请求体**:

```json
{
  "taskId": "string",
  "description": "string (可选)",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T11:00:00.000Z (可选)"
}
```

#### 2. 开始时间跟踪

```http
POST /api/time-tracking/start
```

**请求体**:

```json
{
  "taskId": "string",
  "description": "string (可选)"
}
```

#### 3. 停止时间跟踪

```http
PATCH /api/time-tracking/{timeEntryId}/stop
```

#### 4. 获取时间记录列表

```http
GET /api/time-tracking
```

**查询参数**:

- `page` (integer): 页码
- `limit` (integer): 每页数量
- `taskId` (string): 任务 ID 过滤
- `userId` (string): 用户 ID 过滤
- `dateFrom` (string): 开始日期
- `dateTo` (string): 结束日期
- `isRunning` (boolean): 是否运行中

#### 5. 获取当前运行中的时间记录

```http
GET /api/time-tracking/running
```

#### 6. 获取时间跟踪统计

```http
GET /api/time-tracking/stats
```

**查询参数**:

- `taskId` (string): 任务 ID 过滤
- `dateFrom` (string): 开始日期
- `dateTo` (string): 结束日期

#### 7. 获取任务时间统计

```http
GET /api/time-tracking/tasks/{taskId}/stats
```

#### 8. 更新时间记录

```http
PUT /api/time-tracking/{timeEntryId}
```

#### 9. 删除时间记录

```http
DELETE /api/time-tracking/{timeEntryId}
```

### 时间跟踪功能特点

- **实时跟踪**: 支持开始/停止时间跟踪
- **手动记录**: 支持手动创建时间记录
- **自动计算**: 自动计算持续时间
- **统计分析**: 提供详细的时间统计
- **权限控制**: 只能操作自己的时间记录

## 🧪 测试

### 运行测试脚本

```bash
# 确保服务器运行在 localhost:3001
npm run dev

# 在另一个终端运行测试
node test-new-apis.js
```

### 测试覆盖

- ✅ 通知系统所有端点
- ✅ 文件上传和下载
- ✅ 时间跟踪完整流程
- ✅ 权限验证
- ✅ 错误处理

## 📝 使用示例

### 完整的任务协作流程

```javascript
// 1. 创建任务
const task = await createTask({
  title: "开发新功能",
  projectId: "project123",
});

// 2. 开始时间跟踪
const timeEntry = await startTimeTracking({
  taskId: task.id,
  description: "开始开发",
});

// 3. 上传相关文件
const file = await uploadFile(task.id, "design.pdf");

// 4. 添加评论（会触发通知）
await addComment(task.id, "设计文件已上传");

// 5. 停止时间跟踪
await stopTimeTracking(timeEntry.id);

// 6. 查看统计
const stats = await getTimeStats(task.id);
```

## 🔧 配置说明

### 文件上传配置

- 上传目录: `uploads/`
- 最大文件大小: 10MB
- 最大文件数量: 5 个（批量上传）
- 支持的文件类型: 在 `FileUploadService` 中配置

### 时间跟踪配置

- 时间精度: 分钟
- 最大会话时间: 无限制
- 统计周期: 按天/按任务/按用户

### 通知配置

- 通知保留时间: 30 天（可配置）
- 批量通知: 支持
- 实时推送: 需要 WebSocket 实现

## 🚀 下一步计划

1. **实时通信**: 实现 WebSocket 支持
2. **文件预览**: 添加文件预览功能
3. **时间报告**: 生成时间跟踪报告
4. **通知模板**: 自定义通知模板
5. **批量操作**: 支持批量处理

## 📞 支持

如有问题或建议，请查看：

- API 文档: `/api-docs`
- 错误日志: 服务器控制台
- 测试脚本: `test-new-apis.js`
