import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { enhancedErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger-setup';

const app = express();
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
