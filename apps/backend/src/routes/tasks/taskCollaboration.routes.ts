import { Router } from 'express';
import { TaskCollaborationController } from '../../controllers/tasks/taskCollaborationController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskComment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         taskId:
 *           type: string
 *         authorId:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/User'
 *     TaskTag:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         color:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TaskActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         action:
 *           type: string
 *         details:
 *           type: string
 *         oldValue:
 *           type: string
 *         newValue:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         taskId:
 *           type: string
 *         userId:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     CreateTaskCommentRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *     UpdateTaskCommentRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *     CreateTaskTagRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         color:
 *           type: string
 *     AssignTaskTagRequest:
 *       type: object
 *       required:
 *         - tagIds
 *       properties:
 *         tagIds:
 *           type: array
 *           items:
 *             type: string
 *     CreateSubtaskRequest:
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
 *         assigneeId:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 */

// ==================== 任务评论路由 ====================

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: 创建任务评论
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskCommentRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权访问
 */
router.post('/:taskId/comments', authenticateToken, TaskCollaborationController.createComment);

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: 获取任务评论列表
 *     tags: [Task Collaboration]
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权访问
 */
router.get('/:taskId/comments', authenticateToken, TaskCollaborationController.getTaskComments);

/**
 * @swagger
 * /api/tasks/comments/{commentId}:
 *   put:
 *     summary: 更新评论
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskCommentRequest'
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
 *         description: 评论不存在
 */
router.put('/comments/:commentId', authenticateToken, TaskCollaborationController.updateComment);

/**
 * @swagger
 * /api/tasks/comments/{commentId}:
 *   delete:
 *     summary: 删除评论
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权删除
 *       404:
 *         description: 评论不存在
 */
router.delete('/comments/:commentId', authenticateToken, TaskCollaborationController.deleteComment);

// ==================== 任务标签路由 ====================

/**
 * @swagger
 * /api/tasks/tags:
 *   post:
 *     summary: 创建标签
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskTagRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 */
router.post('/tags', authenticateToken, TaskCollaborationController.createTag);

/**
 * @swagger
 * /api/tasks/tags:
 *   get:
 *     summary: 获取所有标签
 *     tags: [Task Collaboration]
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
 *           default: 50
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/tags', authenticateToken, TaskCollaborationController.getAllTags);

/**
 * @swagger
 * /api/tasks/tags/search:
 *   get:
 *     summary: 搜索标签
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
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
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 搜索成功
 *       400:
 *         description: 搜索关键词不能为空
 *       401:
 *         description: 未认证
 */
router.get('/tags/search', authenticateToken, TaskCollaborationController.searchTags);

/**
 * @swagger
 * /api/tasks/{taskId}/tags:
 *   patch:
 *     summary: 为任务分配标签
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTaskTagRequest'
 *     responses:
 *       200:
 *         description: 分配成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 */
router.patch('/:taskId/tags', authenticateToken, TaskCollaborationController.assignTagsToTask);

/**
 * @swagger
 * /api/tasks/{taskId}/tags:
 *   get:
 *     summary: 获取任务的标签
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/:taskId/tags', authenticateToken, TaskCollaborationController.getTaskTags);

// ==================== 子任务路由 ====================

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   post:
 *     summary: 创建子任务
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 父任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubtaskRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       404:
 *         description: 父任务不存在
 */
router.post('/:taskId/subtasks', authenticateToken, TaskCollaborationController.createSubtask);

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   get:
 *     summary: 获取子任务列表
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 父任务ID
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
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/:taskId/subtasks', authenticateToken, TaskCollaborationController.getSubtasks);

// ==================== 活动日志路由 ====================

/**
 * @swagger
 * /api/tasks/{taskId}/activities:
 *   get:
 *     summary: 获取任务活动日志
 *     tags: [Task Collaboration]
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/:taskId/activities', authenticateToken, TaskCollaborationController.getTaskActivities);

/**
 * @swagger
 * /api/tasks/activities/my:
 *   get:
 *     summary: 获取我的活动日志
 *     tags: [Task Collaboration]
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
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/activities/my', authenticateToken, TaskCollaborationController.getUserActivities);

/**
 * @swagger
 * /api/tasks/{taskId}/activities/stats:
 *   get:
 *     summary: 获取任务活动统计
 *     tags: [Task Collaboration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/:taskId/activities/stats', authenticateToken, TaskCollaborationController.getActivityStats);

export default router;
