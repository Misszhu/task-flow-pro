# API 文档生成指南

## 快速生成接口文档的方法

### 1. 基于代码注释自动生成（推荐）

这是最快速和准确的方法，只需要在代码中添加 JSDoc 注释即可。

#### 步骤：

1. **在路由文件中添加 Swagger 注释**

   ```typescript
   /**
    * @swagger
    * /api/projects:
    *   get:
    *     summary: 获取所有项目
    *     description: 获取所有项目列表
    *     tags: [Projects]
    *     responses:
    *       200:
    *         description: 成功获取项目列表
    *         content:
    *           application/json:
    *             schema:
    *               type: array
    *               items:
    *                 $ref: '#/components/schemas/Project'
    */
   router.get("/", projectController.getAllProjects);
   ```

2. **启动服务查看文档**

   ```bash
   npm run dev
   # 访问 http://localhost:3001/api-docs
   ```

3. **生成静态文档**
   ```bash
   npm run docs:generate
   ```

### 2. 使用现有工具快速生成

#### 方法一：Swagger Editor

1. 访问 [Swagger Editor](https://editor.swagger.io/)
2. 复制你的 API 定义
3. 自动生成交互式文档

#### 方法二：Postman

1. 导入现有的 Postman Collection
2. 使用 Postman 的文档生成功能
3. 自动生成美观的 API 文档

#### 方法三：Insomnia

1. 导入 API 定义
2. 使用 Insomnia 的文档功能
3. 生成可分享的文档

### 3. 使用 AI 工具快速生成

#### 使用 ChatGPT/Claude 等 AI 工具：

1. 提供你的 API 路由代码
2. 要求生成 Swagger 注释
3. 复制生成的注释到代码中

#### 使用 GitHub Copilot：

1. 在代码上方输入注释提示
2. 让 Copilot 自动生成 Swagger 注释
3. 检查并调整生成的注释

### 4. 使用专业工具

#### Swagger Codegen

```bash
# 安装
npm install -g @openapitools/openapi-generator-cli

# 生成客户端代码和文档
openapi-generator-cli generate -i swagger.json -g html2 -o ./docs
```

#### Redoc

```bash
# 安装
npm install -g redoc-cli

# 生成文档
redoc-cli build swagger.json --output docs.html
```

## 最佳实践

### 1. 注释规范

- 使用标准的 Swagger/OpenAPI 3.0 格式
- 包含完整的请求/响应示例
- 添加详细的参数说明
- 使用 tags 对接口进行分组

### 2. 文档维护

- 代码变更时同步更新注释
- 定期检查文档的准确性
- 使用版本控制管理文档

### 3. 团队协作

- 建立文档编写规范
- 使用代码审查确保文档质量
- 定期进行文档培训

## 快速命令

```bash
# 启动开发服务器（包含Swagger UI）
npm run dev

# 生成静态文档
npm run docs:generate

# 打开Swagger UI
npm run docs:open

# 构建项目
npm run build
```

## 文档访问地址

- **Swagger UI**: http://localhost:3001/api-docs
- **API 文档**: ./API_DOCUMENTATION.md
- **Postman Collection**: ./postman-collection.json

## 常见问题

### Q: 访问 /api-docs 提示"路径不存在"？

A: 这个问题通常是因为：

1. 缺少 swagger 相关依赖包
2. 没有在 index.ts 中调用 setupSwagger 函数
3. 服务器没有重启

**解决方案**：

```bash
# 1. 安装依赖
pnpm add swagger-jsdoc swagger-ui-express --filter @task-flow-pro/backend
pnpm add -D @types/swagger-jsdoc @types/swagger-ui-express --filter @task-flow-pro/backend

# 2. 确保 index.ts 中已调用 setupSwagger
# 3. 重启服务器
npm run dev
```

### Q: 如何添加新的接口文档？

A: 在对应的路由文件中添加 Swagger 注释，重启服务即可看到更新。

### Q: 如何自定义文档样式？

A: 可以修改 swagger-setup.ts 中的配置，或使用 Redoc 等工具生成自定义样式的文档。

### Q: 如何导出文档？

A: 使用`npm run docs:generate`生成静态文档，或直接访问 Swagger UI 进行导出。

## 更多资源

- [OpenAPI 规范](https://swagger.io/specification/)
- [Swagger UI 文档](https://swagger.io/tools/swagger-ui/)
- [Redoc 文档](https://redocly.com/docs/)
- [Postman 文档](https://learning.postman.com/docs/publishing-your-api/documenting-your-api/)
