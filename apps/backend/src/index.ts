import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import routes from './routes';
import { enhancedErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger-setup';
import { WebSocketService } from './services/websocket/websocketService';
import { WebSocketController } from './controllers/websocket/websocketController';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger文档
setupSwagger(app);

// 路由
app.use('/', routes);

// 错误处理中间件
app.use(notFoundHandler);
app.use(enhancedErrorHandler);

// 初始化 WebSocket 服务
const webSocketService = new WebSocketService(server);
WebSocketController.setWebSocketService(webSocketService);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket service initialized`);
});
