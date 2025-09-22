# API 改进文档

## 改进内容

### 1. 统一响应格式

**问题**: API 响应格式不统一，缺乏一致性
**解决方案**: 实现统一的 API 响应格式

#### 响应格式结构

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  pagination?: PaginationInfo;
  meta?: ApiMeta;
  timestamp: string;
  version: ApiVersion;
}
```

#### 成功响应示例

```json
{
  "success": true,
  "data": [...],
  "message": "获取项目列表成功",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "requestId": "req_1234567890_abc123",
    "processingTime": 45,
    "cacheHit": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "v1"
}
```

#### 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "项目不存在",
    "details": {
      "projectId": "proj_123"
    },
    "field": "id"
  },
  "meta": {
    "requestId": "req_1234567890_abc123",
    "processingTime": 12
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "v1"
}
```

### 2. API 版本控制

**问题**: 缺乏 API 版本管理，难以维护向后兼容性
**解决方案**: 实现多版本 API 支持

#### 版本控制策略

- **URL 路径版本**: `/api/v1/projects`
- **查询参数版本**: `/api/projects?version=v1`
- **请求头版本**: `API-Version: v1`

#### 版本支持

- **v1**: 当前稳定版本
- **v2**: 未来版本（预留）

#### 版本兼容性处理

```typescript
// 版本兼容性中间件
export const versionCompatibility = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (req.version) {
    case "v1":
      handleV1Compatibility(req);
      break;
    case "v2":
      handleV2Compatibility(req);
      break;
  }
  next();
};
```

### 3. 增强错误处理

**问题**: 错误信息不够详细，难以调试
**解决方案**: 实现详细的错误分类和处理

#### 错误代码体系

```typescript
enum ErrorCode {
  // 认证错误
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  // 验证错误
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_FIELD = "MISSING_FIELD",

  // 资源错误
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",

  // 业务错误
  BUSINESS_ERROR = "BUSINESS_ERROR",
  OPERATION_FAILED = "OPERATION_FAILED",

  // 系统错误
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",

  // 限流错误
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}
```

#### 错误处理中间件

- **Prisma 错误处理**: 数据库操作错误
- **验证错误处理**: 输入验证错误
- **JWT 错误处理**: 认证令牌错误
- **文件上传错误处理**: Multer 错误
- **网络错误处理**: 外部服务错误

### 4. 请求限流

**问题**: 缺乏 API 滥用防护机制
**解决方案**: 实现多层级限流策略

#### 限流策略

```typescript
const rateLimiters = {
  // 全局限流：每分钟100次请求
  global: new RateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req) => `global:${req.ip}`,
  }),

  // 认证限流：每分钟10次登录尝试
  auth: new RateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => `auth:${req.ip}`,
  }),

  // 项目操作限流：每分钟50次请求
  projects: new RateLimiter({
    windowMs: 60 * 1000,
    max: 50,
    keyGenerator: (req) => `projects:${req.user?.userId || req.ip}`,
  }),
};
```

#### 限流响应头

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-15T10:31:00.000Z
Retry-After: 60
```

## 新增文件

### 1. `src/types/api.ts`

API 相关类型定义:

- `ApiResponse<T>`: 统一响应格式
- `ErrorCode`: 错误代码枚举
- `RequestContext`: 请求上下文
- `PaginationInfo`: 分页信息

### 2. `src/utils/apiResponse.ts`

统一响应工具类:

- `ApiResponseUtil`: 响应格式化工具
- 支持成功、错误、分页等响应类型
- 自动添加元数据和时间戳

### 3. `src/middleware/versioning.ts`

版本控制中间件:

- `apiVersioning`: API 版本检测
- `versionRouter`: 版本路由处理
- `versionCompatibility`: 版本兼容性处理

### 4. `src/middleware/rateLimiting.ts`

限流中间件:

- `RateLimiter`: 限流器类
- `globalRateLimit`: 全局限流
- `projectRateLimit`: 项目操作限流
- `dynamicRateLimit`: 动态限流

### 5. `src/middleware/errorHandler.ts`

增强错误处理:

- `enhancedErrorHandler`: 统一错误处理
- `notFoundHandler`: 404 错误处理
- `asyncHandler`: 异步错误包装器

### 6. `src/routes/v1/`

v1 版本 API 路由:

- 版本化路由结构
- 向后兼容性支持
- 统一的中间件应用

## API 使用示例

### 1. 基础请求

```bash
# 获取项目列表
GET /api/v1/projects?page=1&limit=20

# 请求头
Authorization: Bearer <token>
API-Version: v1
X-Request-ID: req_1234567890_abc123
```

### 2. 分页请求

```bash
# 分页参数
GET /api/v1/projects?page=2&limit=10&search=测试&sortBy=name&sortOrder=asc

# 响应
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 3. 错误处理

```bash
# 404错误
GET /api/v1/projects/nonexistent-id

# 响应
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "项目不存在",
    "details": { "projectId": "nonexistent-id" }
  }
}
```

### 4. 限流处理

```bash
# 限流响应
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-15T10:31:00.000Z
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "details": { "retryAfter": 60 }
  }
}
```

## 性能优化

### 1. 响应时间优化

- **统一格式**: 减少客户端解析时间
- **元数据**: 提供调试和监控信息
- **缓存信息**: 显示缓存命中状态

### 2. 错误处理优化

- **错误分类**: 快速定位问题类型
- **详细信息**: 提供调试所需信息
- **堆栈跟踪**: 开发环境显示完整堆栈

### 3. 限流优化

- **多层级**: 不同操作不同限制
- **动态调整**: 根据用户角色调整
- **优雅降级**: 限流时提供重试信息

## 监控和调试

### 1. 请求跟踪

```typescript
// 请求上下文
interface RequestContext {
  requestId: string; // 请求唯一ID
  userId?: string; // 用户ID
  version: ApiVersion; // API版本
  startTime: number; // 开始时间
  userAgent?: string; // 用户代理
  ip?: string; // IP地址
}
```

### 2. 性能监控

```typescript
// 响应元数据
interface ApiMeta {
  requestId?: string; // 请求ID
  processingTime?: number; // 处理时间
  cacheHit?: boolean; // 缓存命中
  rateLimit?: RateLimitInfo; // 限流信息
}
```

### 3. 错误监控

- **错误分类**: 按错误代码统计
- **错误频率**: 监控错误发生频率
- **错误详情**: 记录详细错误信息

## 测试

运行 API 改进测试:

```bash
node test-api-improvements.js
```

测试内容包括:

- 统一响应格式测试
- API 版本控制测试
- 错误处理测试
- 请求限流测试
- 分页功能测试
- 搜索功能测试
- 缓存功能测试

## 迁移指南

### 1. 现有 API 迁移

- 逐步迁移到 v1 版本
- 保持向后兼容性
- 提供迁移文档

### 2. 客户端适配

- 更新 API 调用路径
- 适配新的响应格式
- 处理新的错误格式

### 3. 监控和告警

- 设置响应时间监控
- 配置错误率告警
- 监控限流触发情况

## 最佳实践

### 1. 版本管理

- 使用语义化版本号
- 保持向后兼容性
- 及时废弃旧版本

### 2. 错误处理

- 提供有意义的错误信息
- 包含调试所需信息
- 避免泄露敏感信息

### 3. 限流策略

- 根据业务需求设置限制
- 提供重试机制
- 监控限流效果

### 4. 性能优化

- 使用缓存减少响应时间
- 优化数据库查询
- 监控 API 性能指标
