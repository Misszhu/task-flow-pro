# API接口列表

## 基础信息
- **Base URL**: `http://localhost:3001`
- **Content-Type**: `application/json`

## 接口列表

### src/routes/health.routes.ts

- **GET** `/`
- **GET** `/test-db`

### src/routes/index.ts

- **GET** `/`

### src/routes/projects/project.routes.ts

- **GET** `/`
- **POST** `/`
- **GET** `/:id`
- **POST** `/:projectId/members`
- **GET** `/:projectId/members`
- **PUT** `/:projectId/members/:userId`
- **DELETE** `/:projectId/members/:userId`

