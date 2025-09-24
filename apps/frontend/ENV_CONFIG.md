# 环境配置说明

## 环境配置文件

### 1. `.env.development` - 开发环境

```bash
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

### 2. `.env.production` - 生产环境

```bash
REACT_APP_API_BASE_URL=https://api.taskflowpro.com
REACT_APP_ENV=production
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
```

### 3. `.env.local` - 本地开发配置

```bash
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ENV=development
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

## 环境变量说明

| 变量名                   | 说明             | 默认值                  |
| ------------------------ | ---------------- | ----------------------- |
| `REACT_APP_API_BASE_URL` | API 服务器地址   | `http://localhost:3001` |
| `REACT_APP_ENV`          | 环境标识         | `development`           |
| `REACT_APP_DEBUG`        | 是否开启调试模式 | `true`                  |
| `REACT_APP_LOG_LEVEL`    | 日志级别         | `debug`                 |

## 使用方法

### 开发环境

```bash
npm run dev
# 或
npm start
```

### 生产环境

```bash
npm run build
```

## 注意事项

1. **环境变量命名**：React 环境变量必须以 `REACT_APP_` 开头
2. **敏感信息**：不要在前端环境变量中存储敏感信息
3. **版本控制**：`.env.local` 文件不会被提交到 git
4. **优先级**：`.env.local` > `.env.development` > `.env.production`

## 配置验证

可以通过以下方式验证环境配置：

```javascript
// 在组件中检查环境变量
console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);
console.log("Environment:", process.env.REACT_APP_ENV);
console.log("Debug Mode:", process.env.REACT_APP_DEBUG);
```
