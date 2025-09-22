import { Router } from 'express';
import { TaskDependencyController } from '../../controllers/taskDependencies/taskDependencyController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskDependency:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         predecessorId:
 *           type: string
 *         successorId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         predecessor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *             status:
 *               type: string
 *             priority:
 *               type: string
 *         successor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *             status:
 *               type: string
 *             priority:
 *               type: string
 *     CreateDependencyRequest:
 *       type: object
 *       required:
 *         - predecessorId
 *         - successorId
 *       properties:
 *         predecessorId:
 *           type: string
 *           description: 前置任务ID
 *         successorId:
 *           type: string
 *           description: 后置任务ID
 *     DependencyStats:
 *       type: object
 *       properties:
 *         totalDependencies:
 *           type: integer
 *         blockedTasks:
 *           type: integer
 *         criticalPath:
 *           type: array
 *           items:
 *             type: string
 *         circularDependencies:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/task-dependencies:
 *   post:
 *     summary: 创建任务依赖关系
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDependencyRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskDependency'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       404:
 *         description: 任务不存在
 *       409:
 *         description: 依赖关系已存在
 *       500:
 *         description: 服务器错误
 */
router.post('/', authenticateToken, TaskDependencyController.createDependency);

/**
 * @swagger
 * /api/task-dependencies:
 *   get:
 *     summary: 获取所有依赖关系
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: 任务ID过滤
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [predecessors, successors]
 *         description: 依赖类型
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskDependency'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/', authenticateToken, TaskDependencyController.getAllDependencies);

/**
 * @swagger
 * /api/task-dependencies/bulk:
 *   post:
 *     summary: 批量创建依赖关系
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dependencies:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateDependencyRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     dependencies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskDependency'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.post('/bulk', authenticateToken, TaskDependencyController.createBulkDependencies);

/**
 * @swagger
 * /api/task-dependencies/tasks/{taskId}:
 *   get:
 *     summary: 获取任务的依赖关系
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [predecessors, successors]
 *           default: predecessors
 *         description: 依赖类型
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskDependency'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/tasks/:taskId', authenticateToken, TaskDependencyController.getTaskDependencies);

/**
 * @swagger
 * /api/task-dependencies/{dependencyId}:
 *   delete:
 *     summary: 删除依赖关系
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dependencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 依赖关系ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       404:
 *         description: 依赖关系不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:dependencyId', authenticateToken, TaskDependencyController.deleteDependency);

/**
 * @swagger
 * /api/task-dependencies/blocked:
 *   get:
 *     summary: 获取被阻塞的任务
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: 任务ID过滤
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       blockedTask:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           status:
 *                             type: string
 *                           priority:
 *                             type: string
 *                       blockingTask:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           status:
 *                             type: string
 *                           priority:
 *                             type: string
 *                       dependencyId:
 *                         type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/blocked', authenticateToken, TaskDependencyController.getBlockedTasks);

/**
 * @swagger
 * /api/task-dependencies/critical-path:
 *   get:
 *     summary: 获取关键路径
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: 项目ID过滤
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     criticalPath:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/critical-path', authenticateToken, TaskDependencyController.getCriticalPath);

/**
 * @swagger
 * /api/task-dependencies/stats:
 *   get:
 *     summary: 获取依赖关系统计
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: 项目ID过滤
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DependencyStats'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/stats', authenticateToken, TaskDependencyController.getDependencyStats);

/**
 * @swagger
 * /api/task-dependencies/circular:
 *   get:
 *     summary: 检查循环依赖
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 检查成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     circularDependencies:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/circular', authenticateToken, TaskDependencyController.checkCircularDependencies);

/**
 * @swagger
 * /api/task-dependencies/cleanup:
 *   post:
 *     summary: 清理无效的依赖关系
 *     tags: [Task Dependencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.post('/cleanup', authenticateToken, TaskDependencyController.cleanupInvalidDependencies);

export default router;