import { Router } from 'express';
import healthRoutes from './health.routes';
import projectRoutes from './projects/project.routes';
import authRoutes from './auth/auth.routes';
import taskRoutes from './tasks/task.routes';
import taskCollaborationRoutes from './tasks/taskCollaboration.routes';
import cacheRoutes from './cache/cache.routes';

const router: Router = Router();

// 基础路由
router.get('/', (req, res) => {
  res.json({ message: 'Task Flow Pro Backend API' });
});

// API 路由
router.use('/api/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/projects', projectRoutes);
router.use('/api/tasks', taskRoutes);
router.use('/api/tasks', taskCollaborationRoutes);
router.use('/api/cache', cacheRoutes);

export default router;
