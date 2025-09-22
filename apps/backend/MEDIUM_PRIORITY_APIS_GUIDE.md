# 中优先级 API 功能指南

本文档介绍了新实现的三个中优先级后端 API 功能：

- **任务依赖关系 API** - 高级功能
- **任务模板 API** - 提高效率
- **实时通信功能** - 协作体验

## 🔗 任务依赖关系 API

### 基础信息

- **Base URL**: `/api/task-dependencies`
- **认证**: 需要 Bearer Token
- **功能**: 管理任务之间的依赖关系，支持循环依赖检测、关键路径分析等高级功能

### API 端点

| 方法     | 路径                                    | 描述               | 认证 |
| -------- | --------------------------------------- | ------------------ | ---- |
| `POST`   | `/api/task-dependencies`                | 创建依赖关系       | 是   |
| `GET`    | `/api/task-dependencies`                | 获取所有依赖关系   | 是   |
| `POST`   | `/api/task-dependencies/bulk`           | 批量创建依赖关系   | 是   |
| `GET`    | `/api/task-dependencies/tasks/{taskId}` | 获取任务的依赖关系 | 是   |
| `DELETE` | `/api/task-dependencies/{dependencyId}` | 删除依赖关系       | 是   |
| `GET`    | `/api/task-dependencies/blocked`        | 获取被阻塞的任务   | 是   |
| `GET`    | `/api/task-dependencies/critical-path`  | 获取关键路径       | 是   |
| `GET`    | `/api/task-dependencies/stats`          | 获取依赖关系统计   | 是   |
| `GET`    | `/api/task-dependencies/circular`       | 检查循环依赖       | 是   |
| `POST`   | `/api/task-dependencies/cleanup`        | 清理无效依赖关系   | 是   |

### 使用示例

#### 创建依赖关系

```bash
curl -X POST "http://localhost:3001/api/task-dependencies" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "predecessorId": "task_123",
    "successorId": "task_456"
  }'
```

#### 获取关键路径

```bash
curl -X GET "http://localhost:3001/api/task-dependencies/critical-path?projectId=project_789" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### 核心功能

- **循环依赖检测**: 自动检测并防止创建循环依赖
- **关键路径分析**: 识别项目中的关键路径
- **阻塞任务管理**: 跟踪被依赖关系阻塞的任务
- **批量操作**: 支持批量创建和管理依赖关系
- **统计分析**: 提供详细的依赖关系统计信息

## 📋 任务模板 API

### 基础信息

- **Base URL**: `/api/task-templates`
- **认证**: 需要 Bearer Token
- **功能**: 创建、管理和使用任务模板，提高任务创建效率

### API 端点

| 方法     | 路径                                    | 描述           | 认证 |
| -------- | --------------------------------------- | -------------- | ---- |
| `POST`   | `/api/task-templates`                   | 创建任务模板   | 是   |
| `GET`    | `/api/task-templates`                   | 获取模板列表   | 是   |
| `GET`    | `/api/task-templates/my`                | 获取用户模板   | 是   |
| `GET`    | `/api/task-templates/public`            | 获取公共模板   | 是   |
| `GET`    | `/api/task-templates/search`            | 搜索模板       | 是   |
| `GET`    | `/api/task-templates/stats`             | 获取模板统计   | 是   |
| `POST`   | `/api/task-templates/bulk`              | 批量创建模板   | 是   |
| `GET`    | `/api/task-templates/{templateId}`      | 获取单个模板   | 是   |
| `PUT`    | `/api/task-templates/{templateId}`      | 更新模板       | 是   |
| `DELETE` | `/api/task-templates/{templateId}`      | 删除模板       | 是   |
| `POST`   | `/api/task-templates/{templateId}/copy` | 复制模板       | 是   |
| `POST`   | `/api/task-templates/create-task`       | 从模板创建任务 | 是   |
| `POST`   | `/api/task-templates/cleanup`           | 清理未使用模板 | 是   |

### 使用示例

#### 创建任务模板

```bash
curl -X POST "http://localhost:3001/api/task-templates" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bug Fix Template",
    "description": "Template for bug fixing tasks",
    "title": "Fix: {issue_description}",
    "content": "{\"priority\": \"HIGH\", \"tags\": [\"bug\", \"fix\"]}",
    "isPublic": false
  }'
```

#### 从模板创建任务

```bash
curl -X POST "http://localhost:3001/api/task-templates/create-task" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template_123",
    "projectId": "project_456",
    "customizations": {
      "title": "Fix: Login button not working",
      "priority": "URGENT"
    }
  }'
```

### 核心功能

- **模板管理**: 创建、编辑、删除和复制模板
- **权限控制**: 支持私有和公共模板
- **搜索功能**: 按名称、描述等搜索模板
- **批量操作**: 支持批量创建模板
- **任务生成**: 从模板快速创建任务
- **统计分析**: 提供模板使用统计

## 🔌 实时通信功能

### 基础信息

- **Base URL**: `/api/websocket`
- **WebSocket URL**: `ws://localhost:3001`
- **认证**: 需要 Bearer Token
- **功能**: 提供实时通信、通知推送、协作更新等功能

### API 端点

| 方法   | 路径                                       | 描述         | 认证 |
| ------ | ------------------------------------------ | ------------ | ---- |
| `GET`  | `/api/websocket/connection-info`           | 获取连接信息 | 是   |
| `POST` | `/api/websocket/test-message`              | 发送测试消息 | 是   |
| `POST` | `/api/websocket/send-notification`         | 发送用户通知 | 是   |
| `POST` | `/api/websocket/send-project-notification` | 发送项目通知 | 是   |
| `POST` | `/api/websocket/send-task-update`          | 发送任务更新 | 是   |
| `POST` | `/api/websocket/send-project-update`       | 发送项目更新 | 是   |
| `POST` | `/api/websocket/broadcast`                 | 广播消息     | 是   |
| `POST` | `/api/websocket/disconnect-user/{userId}`  | 断开用户连接 | 是   |
| `GET`  | `/api/websocket/online-stats`              | 获取在线统计 | 是   |

### WebSocket 事件

#### 客户端发送事件

- `join-project` - 加入项目房间
- `leave-project` - 离开项目房间
- `join-task` - 加入任务房间
- `leave-task` - 离开任务房间

#### 服务端推送事件

- `notification` - 用户通知
- `project-notification` - 项目通知
- `task-update` - 任务更新
- `project-update` - 项目更新
- `system-message` - 系统消息
- `broadcast` - 广播消息
- `collaboration-update` - 协作更新

### 使用示例

#### 发送通知给用户

```bash
curl -X POST "http://localhost:3001/api/websocket/send-notification" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "user_123",
    "type": "TASK_ASSIGNED",
    "title": "New Task Assigned",
    "content": "You have been assigned a new task",
    "taskId": "task_456"
  }'
```

#### WebSocket 连接示例

```javascript
const io = require("socket.io-client");

const socket = io("http://localhost:3001", {
  auth: {
    token: "YOUR_AUTH_TOKEN",
  },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket");

  // 加入项目房间
  socket.emit("join-project", "project_123");

  // 监听通知
  socket.on("notification", (data) => {
    console.log("Received notification:", data);
  });
});
```

### 核心功能

- **实时通知**: 即时推送任务、项目相关通知
- **房间管理**: 支持项目、任务级别的房间管理
- **协作更新**: 实时同步任务和项目的更新
- **在线统计**: 监控在线用户和连接状态
- **消息广播**: 支持系统级别的消息广播
- **权限控制**: 基于 JWT 的身份验证

## 🧪 测试

### 运行测试脚本

```bash
# 确保服务器运行在 localhost:3001
npm run dev

# 在另一个终端运行测试
node test-medium-priority-apis.js
```

### 测试覆盖

- ✅ 任务依赖关系所有端点
- ✅ 任务模板所有端点
- ✅ WebSocket 实时通信
- ✅ 权限验证
- ✅ 错误处理

## 📊 性能特点

### 任务依赖关系

- **循环检测**: O(V + E) 时间复杂度
- **关键路径**: 基于拓扑排序的算法
- **批量操作**: 支持事务性批量创建

### 任务模板

- **搜索优化**: 支持模糊搜索和分页
- **权限控制**: 基于用户和模板可见性
- **模板解析**: JSON 格式的模板内容解析

### 实时通信

- **连接管理**: 基于 Socket.IO 的高性能连接
- **房间管理**: 支持多级房间嵌套
- **消息路由**: 智能消息路由和过滤

## 🔧 配置

### 环境变量

```bash
# WebSocket 配置
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key

# 数据库配置
DATABASE_URL=your-database-url
```

### 依赖项

```json
{
  "socket.io": "^4.6.1",
  "@types/socket.io": "^4.6.1"
}
```

## 📈 监控和统计

### 依赖关系统计

- 总依赖关系数量
- 被阻塞的任务数量
- 关键路径长度
- 循环依赖检测

### 模板使用统计

- 模板总数
- 公共/私有模板分布
- 用户模板数量
- 按类别统计

### 实时通信统计

- 在线用户数量
- 活跃房间数量
- 消息发送频率
- 连接稳定性

## 🚀 最佳实践

### 任务依赖关系

1. **避免循环依赖**: 使用 API 的循环检测功能
2. **合理规划**: 基于关键路径进行项目规划
3. **定期清理**: 使用清理 API 移除无效依赖

### 任务模板

1. **模板标准化**: 创建标准化的模板格式
2. **权限管理**: 合理设置模板的可见性
3. **版本控制**: 定期更新和维护模板

### 实时通信

1. **房间管理**: 合理使用房间进行消息分组
2. **消息频率**: 控制消息发送频率避免过载
3. **错误处理**: 实现客户端重连机制

## 🔍 故障排除

### 常见问题

1. **WebSocket 连接失败**: 检查 JWT Token 和 CORS 配置
2. **依赖关系创建失败**: 检查任务是否存在和循环依赖
3. **模板权限错误**: 确认用户是否有权限访问模板

### 调试工具

- Swagger UI: `http://localhost:3001/api-docs`
- WebSocket 测试工具
- 服务器日志监控

---

**注意**: 所有 API 都需要有效的 JWT `Authorization` 头。详细的请求和响应结构请参考 Swagger UI (`http://localhost:3001/api-docs`)。

如有问题或建议，请查看：

- API 文档: `/api-docs`
- 错误日志: 服务器控制台
- 测试脚本: `test-medium-priority-apis.js`
