# API 响应格式规范

## 统一响应结构

所有 API 接口都使用统一的响应格式：

```typescript
interface StandardResponse<T = any> {
  data: T; // 响应数据
  message: string; // 响应消息
  success: boolean; // 请求是否成功
  statusCode: number; // HTTP状态码
  timestamp?: string; // 响应时间戳 (ISO 8601格式)
}
```

## 成功响应示例

### 1. 用户注册成功

```json
{
  "data": {
    "user": {
      "id": "user123",
      "email": "test@example.com",
      "name": "测试用户",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功",
  "success": true,
  "statusCode": 201,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 获取项目列表成功

```json
{
  "data": [
    {
      "id": "project123",
      "name": "测试项目",
      "description": "项目描述",
      "ownerId": "user123",
      "visibility": "PRIVATE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "获取项目列表成功",
  "success": true,
  "statusCode": 200,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. 删除成功

```json
{
  "data": null,
  "message": "删除项目成功",
  "success": true,
  "statusCode": 200,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 错误响应示例

### 1. 参数验证错误 (400)

```json
{
  "data": null,
  "message": "邮箱格式不正确",
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 未认证错误 (401)

```json
{
  "data": null,
  "message": "访问令牌缺失",
  "success": false,
  "statusCode": 401,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. 权限不足错误 (403)

```json
{
  "data": null,
  "message": "权限不足",
  "success": false,
  "statusCode": 403,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 4. 资源不存在错误 (404)

```json
{
  "data": null,
  "message": "项目不存在",
  "success": false,
  "statusCode": 404,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5. 服务器错误 (500)

```json
{
  "data": null,
  "message": "获取项目列表失败",
  "success": false,
  "statusCode": 500,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## HTTP 状态码说明

| 状态码 | 说明       | 使用场景             |
| ------ | ---------- | -------------------- |
| 200    | 成功       | 获取数据成功         |
| 201    | 创建成功   | 创建资源成功         |
| 400    | 请求错误   | 参数验证失败         |
| 401    | 未认证     | 缺少或无效的认证信息 |
| 403    | 权限不足   | 认证成功但权限不足   |
| 404    | 资源不存在 | 请求的资源不存在     |
| 500    | 服务器错误 | 服务器内部错误       |

## 字段说明

| 字段名     | 类型    | 必填 | 说明                                      |
| ---------- | ------- | ---- | ----------------------------------------- |
| data       | any     | 是   | 响应数据，成功时为实际数据，失败时为 null |
| message    | string  | 是   | 响应消息，描述操作结果                    |
| success    | boolean | 是   | 请求是否成功                              |
| statusCode | number  | 是   | HTTP 状态码，与响应头中的状态码一致       |
| timestamp  | string  | 否   | 响应时间戳，ISO 8601 格式                 |

## 使用 ResponseUtil 工具类

```typescript
import { ResponseUtil } from "../utils/response";

// 成功响应
ResponseUtil.success(res, data, "操作成功");

// 创建成功响应
ResponseUtil.created(res, data, "创建成功");

// 错误响应
ResponseUtil.error(res, "错误信息", 400);

// 未找到响应
ResponseUtil.notFound(res, "资源不存在");

// 未授权响应
ResponseUtil.unauthorized(res, "未认证");

// 权限不足响应
ResponseUtil.forbidden(res, "权限不足");

// 服务器错误响应
ResponseUtil.serverError(res, "服务器错误");
```

## 前端处理建议

```typescript
// 统一的响应处理函数
function handleApiResponse<T>(response: StandardResponse<T>) {
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
}

// 增强的响应处理函数（包含状态码和时间戳）
function handleApiResponseEnhanced<T>(response: StandardResponse<T>) {
  console.log(`API Response [${response.statusCode}] at ${response.timestamp}`);

  if (response.success) {
    return {
      data: response.data,
      statusCode: response.statusCode,
      timestamp: response.timestamp,
    };
  } else {
    const error = new Error(response.message);
    (error as any).statusCode = response.statusCode;
    (error as any).timestamp = response.timestamp;
    throw error;
  }
}

// 使用示例
try {
  const result = await handleApiResponseEnhanced(await fetch("/api/projects"));
  console.log("Data:", result.data);
  console.log("Status:", result.statusCode);
  console.log("Time:", result.timestamp);
} catch (error) {
  console.error("API Error:", error.message);
  console.error("Status Code:", (error as any).statusCode);
  console.error("Time:", (error as any).timestamp);
}
```
