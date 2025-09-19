# 后端架构说明

## 项目结构

```
src/
├── controllers/          # 控制器层 - 处理 HTTP 请求和响应
│   ├── projects/        # 项目相关控制器
│   │   └── projectController.ts
│   └── healthController.ts
├── services/            # 服务层 - 处理业务逻辑
│   └── projects/        # 项目相关服务
│       └── projectService.ts
├── routes/              # 路由层 - 定义 API 端点
│   ├── projects/        # 项目相关路由
│   │   └── project.routes.ts
│   ├── health.routes.ts
│   └── index.ts         # 路由入口
├── middleware/          # 中间件
│   ├── errorHandler.ts  # 错误处理中间件
│   └── index.ts
├── lib/                 # 工具库
│   └── prisma.ts        # Prisma 客户端
└── index.ts             # 应用入口
```

## 架构模式

### MVC 模式

- **Model**: Prisma 数据模型（在 `prisma/schema.prisma` 中定义）
- **View**: JSON API 响应
- **Controller**: 处理 HTTP 请求，调用 Service 层

### 分层架构

1. **Controller 层**: 处理 HTTP 请求和响应，参数验证
2. **Service 层**: 处理业务逻辑，数据库操作
3. **Repository 层**: 数据访问抽象（未来可扩展）
4. **Middleware 层**: 跨切面关注点（错误处理、认证等）

## 代码组织原则

### 1. 单一职责原则

- 每个文件只负责一个特定的功能
- Controller 只处理 HTTP 相关逻辑
- Service 只处理业务逻辑

### 2. 依赖注入

- Controller 依赖 Service
- Service 依赖 Prisma 客户端
- 便于测试和扩展

### 3. 错误处理

- 统一的错误处理中间件
- Service 层抛出业务异常
- Controller 层捕获并转换为 HTTP 响应

## 扩展指南

### 添加新的 API 模块

1. 在 `controllers/` 下创建控制器
2. 在 `services/` 下创建服务
3. 在 `routes/` 下创建路由
4. 在 `routes/index.ts` 中注册路由

### 示例：添加用户模块

```typescript
// controllers/users/userController.ts
export class UserController {
  // 用户相关方法
}

// services/users/userService.ts
export class UserService {
  // 用户业务逻辑
}

// routes/users/user.routes.ts
const router: Router = Router();
const userController = new UserController();
router.get("/", userController.getAllUsers.bind(userController));
export default router;

// routes/index.ts
import userRoutes from "./users/user.routes";
router.use("/api/users", userRoutes);
```

## 优势

1. **可维护性**: 代码结构清晰，职责分离
2. **可扩展性**: 易于添加新功能模块
3. **可测试性**: 各层独立，便于单元测试
4. **可读性**: 代码组织符合直觉
5. **复用性**: Service 层可在不同 Controller 中复用
