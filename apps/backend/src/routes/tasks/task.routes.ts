import { Router } from 'express';
import { TaskController } from '../../controllers/tasks/taskController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED, CANCELLED]
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         projectId:
 *           type: string
 *         assigneeId:
 *           type: string
 *         creatorId:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         assignee:
 *           $ref: '#/components/schemas/User'
 *         creator:
 *           $ref: '#/components/schemas/User'
 *         project:
 *           $ref: '#/components/schemas/Project'
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         projectId:
 *           type: string
 *         assigneeId:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED, CANCELLED]
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         assigneeId:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *     AssignTaskRequest:
 *       type: object
 *       required:
 *         - assigneeId
 *       properties:
 *         assigneeId:
 *           type: string
 *     UpdateTaskStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED, CANCELLED]
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: 创建任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 */
router.post('/', authenticateToken, TaskController.createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: 获取任务列表
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: 项目ID
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: 分配者ID
 *       - in: query
 *         name: creatorId
 *         schema:
 *           type: string
 *         description: 创建者ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: 任务状态
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: 任务优先级
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 */
router.get('/', authenticateToken, TaskController.getTasks);

/**
 * @swagger
 * /api/tasks/my:
 *   get:
 *     summary: 获取我的任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/my', authenticateToken, TaskController.getMyTasks);

/**
 * @swagger
 * /api/tasks/created:
 *   get:
 *     summary: 获取我创建的任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/created', authenticateToken, TaskController.getCreatedTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: 获取单个任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权访问
 *       404:
 *         description: 任务不存在
 */
router.get('/:id', authenticateToken, TaskController.getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: 更新任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权编辑
 *       404:
 *         description: 任务不存在
 */
router.put('/:id', authenticateToken, TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: 删除任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权删除
 *       404:
 *         description: 任务不存在
 */
router.delete('/:id', authenticateToken, TaskController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   patch:
 *     summary: 分配任务
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTaskRequest'
 *     responses:
 *       200:
 *         description: 分配成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权分配
 *       404:
 *         description: 任务不存在
 */
router.patch('/:id/assign', authenticateToken, TaskController.assignTask);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: 更新任务状态
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskStatusRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权更新
 *       404:
 *         description: 任务不存在
 */
router.patch('/:id/status', authenticateToken, TaskController.updateTaskStatus);

export default router;
