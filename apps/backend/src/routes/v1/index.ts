import { Router } from 'express';
import healthRoutes from '../health.routes';
import projectRoutes from './projects/project.routes';
import authRoutes from '../auth/auth.routes';
import taskRoutes from '../tasks/task.routes';
import taskCollaborationRoutes from '../tasks/taskCollaboration.routes';
import cacheRoutes from '../cache/cache.routes';

const router: Router = Router();

// v1 API 路由
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/tasks', taskCollaborationRoutes);
router.use('/cache', cacheRoutes);

export default router;
