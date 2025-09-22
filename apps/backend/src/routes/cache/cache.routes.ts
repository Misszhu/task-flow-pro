import { Router } from 'express';
import { CacheController } from '../../controllers/cache/cacheController';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router: Router = Router();
const cacheController = new CacheController();

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     summary: 获取缓存统计信息
 *     description: 获取缓存使用统计信息
 *     tags: [Cache Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取缓存统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: 总缓存项数
 *                 valid:
 *                   type: integer
 *                   description: 有效缓存项数
 *                 expired:
 *                   type: integer
 *                   description: 过期缓存项数
 *       500:
 *         description: 服务器错误
 */
router.get('/stats', authenticateToken, requireRole(['ADMIN']), cacheController.getCacheStats.bind(cacheController));

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     summary: 清空所有缓存
 *     description: 清空所有缓存数据
 *     tags: [Cache Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功清空所有缓存
 *       500:
 *         description: 服务器错误
 */
router.post('/clear', authenticateToken, requireRole(['ADMIN']), cacheController.clearAllCache.bind(cacheController));

/**
 * @swagger
 * /api/cache/projects/{projectId}:
 *   delete:
 *     summary: 清空项目相关缓存
 *     description: 清空指定项目相关的所有缓存
 *     tags: [Cache Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 成功清空项目缓存
 *       500:
 *         description: 服务器错误
 */
router.delete('/projects/:projectId', authenticateToken, requireRole(['ADMIN', 'PROJECT_MANAGER']), cacheController.clearProjectCache.bind(cacheController));

/**
 * @swagger
 * /api/cache/users/{userId}:
 *   delete:
 *     summary: 清空用户相关缓存
 *     description: 清空指定用户相关的所有缓存
 *     tags: [Cache Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功清空用户缓存
 *       500:
 *         description: 服务器错误
 */
router.delete('/users/:userId', authenticateToken, requireRole(['ADMIN']), cacheController.clearUserCache.bind(cacheController));

/**
 * @swagger
 * /api/cache/warmup:
 *   post:
 *     summary: 预热缓存
 *     description: 预热当前用户的缓存数据
 *     tags: [Cache Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 缓存预热成功
 *       500:
 *         description: 服务器错误
 */
router.post('/warmup', authenticateToken, cacheController.warmupCache.bind(cacheController));

export default router;
