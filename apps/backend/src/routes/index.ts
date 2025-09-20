import { Router } from 'express';
import healthRoutes from './health.routes';
import projectRoutes from './projects/project.routes';
import authRoutes from './auth/auth.routes';

const router: Router = Router();

// 基础路由
router.get('/', (req, res) => {
  res.json({ message: 'Task Flow Pro Backend API' });
});

// API 路由
router.use('/api/health', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/projects', projectRoutes);

export default router;
