import { Router } from 'express';
import healthRoutes from './health.routes';
import projectRoutes from './projects/project.routes';
import authRoutes from './auth/auth.routes';
import taskRoutes from './tasks/task.routes';
import taskCollaborationRoutes from './tasks/taskCollaboration.routes';
import cacheRoutes from './cache/cache.routes';
import notificationRoutes from './notifications/notification.routes';
import fileUploadRoutes from './files/fileUpload.routes';
import timeTrackingRoutes from './timeTracking/timeTracking.routes';
import taskDependencyRoutes from './taskDependencies/taskDependency.routes';
import taskTemplateRoutes from './taskTemplates/taskTemplate.routes';
import websocketRoutes from './websocket/websocket.routes';
import v1Routes from './v1/index';
import { apiVersioning, addVersionInfo } from '../middleware/versioning';
import { globalRateLimit } from '../middleware/rateLimiting';

const router: Router = Router();

// 基础路由
router.get('/', (req, res) => {
  res.json({ message: 'Task Flow Pro Backend API' });
});

// 应用全局中间件
router.use(apiVersioning);
router.use(addVersionInfo);
router.use(globalRateLimit);

// API 路由
router.use('/api/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/projects', projectRoutes);
router.use('/api/tasks', taskRoutes);
router.use('/api/tasks', taskCollaborationRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/files', fileUploadRoutes);
router.use('/api/time-tracking', timeTrackingRoutes);
router.use('/api/task-dependencies', taskDependencyRoutes);
router.use('/api/task-templates', taskTemplateRoutes);
router.use('/api/websocket', websocketRoutes);
router.use('/api/cache', cacheRoutes);

// 版本化 API 路由
router.use('/api/v1', v1Routes);

export default router;
