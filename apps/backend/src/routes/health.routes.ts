import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router: Router = Router();
const healthController = new HealthController();

// 健康检查路由
router.get('/', healthController.healthCheck.bind(healthController));
router.get('/test-db', healthController.testDatabase.bind(healthController));

export default router;
