# Task Flow Pro API 概览

## 基础信息

- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

## API 端点列表

### 基础接口

| 方法 | 路径 | 描述          |
| ---- | ---- | ------------- |
| GET  | `/`  | 获取 API 信息 |

### 健康检查

| 方法 | 路径                  | 描述           |
| ---- | --------------------- | -------------- |
| GET  | `/api/health`         | 健康检查       |
| GET  | `/api/health/test-db` | 数据库连接测试 |

### 项目管理

| 方法 | 路径                | 描述         |
| ---- | ------------------- | ------------ |
| GET  | `/api/projects`     | 获取所有项目 |
| POST | `/api/projects`     | 创建新项目   |
| GET  | `/api/projects/:id` | 获取单个项目 |

### 项目成员管理

| 方法   | 路径                                       | 描述             |
| ------ | ------------------------------------------ | ---------------- |
| POST   | `/api/projects/:projectId/members`         | 添加项目成员     |
| GET    | `/api/projects/:projectId/members`         | 获取项目成员列表 |
| PUT    | `/api/projects/:projectId/members/:userId` | 更新成员角色     |
| DELETE | `/api/projects/:projectId/members/:userId` | 移除项目成员     |

## 快速测试

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取所有项目
curl http://localhost:3001/api/projects

# 创建项目
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"测试项目","ownerId":"user123"}'
```

## 数据模型

### 项目角色

- `VIEWER`: 查看者
- `COLLABORATOR`: 协作者
- `MANAGER`: 管理者

### 项目可见性

- `PUBLIC`: 公开
- `PRIVATE`: 私有

详细文档请参考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
