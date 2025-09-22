import { Router } from 'express';
import { TaskTemplateController } from '../../controllers/taskTemplates/taskTemplateController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         isPublic:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *         creator:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *     CreateTaskTemplateRequest:
 *       type: object
 *       required:
 *         - name
 *         - title
 *       properties:
 *         name:
 *           type: string
 *           description: 模板名称
 *         description:
 *           type: string
 *           description: 模板描述
 *         title:
 *           type: string
 *           description: 任务标题模板
 *         content:
 *           type: string
 *           description: 模板内容（JSON格式）
 *         isPublic:
 *           type: boolean
 *           description: 是否公开
 *     CreateTaskFromTemplateRequest:
 *       type: object
 *       required:
 *         - templateId
 *       properties:
 *         templateId:
 *           type: string
 *           description: 模板ID
 *         projectId:
 *           type: string
 *           description: 项目ID
 *         assigneeId:
 *           type: string
 *           description: 分配者ID
 *         customizations:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             priority:
 *               type: string
 *               enum: [LOW, MEDIUM, HIGH, URGENT]
 *             dueDate:
 *               type: string
 *               format: date-time
 *     TemplateStats:
 *       type: object
 *       properties:
 *         totalTemplates:
 *           type: integer
 *         publicTemplates:
 *           type: integer
 *         privateTemplates:
 *           type: integer
 *         userTemplates:
 *           type: integer
 *         byCategory:
 *           type: object
 *           additionalProperties:
 *             type: integer
 */

/**
 * @swagger
 * /api/task-templates:
 *   post:
 *     summary: 创建任务模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskTemplateRequest'
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
 *                   $ref: '#/components/schemas/TaskTemplate'
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
router.post('/', authenticateToken, TaskTemplateController.createTemplate);

/**
 * @swagger
 * /api/task-templates:
 *   get:
 *     summary: 获取任务模板列表
 *     tags: [Task Templates]
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
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: 是否公开
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: 创建者ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskTemplate'
 *                     total:
 *                       type: integer
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
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/', authenticateToken, TaskTemplateController.getTemplates);

/**
 * @swagger
 * /api/task-templates/my:
 *   get:
 *     summary: 获取用户的模板
 *     tags: [Task Templates]
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
 *           maximum: 100
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/my', authenticateToken, TaskTemplateController.getUserTemplates);

/**
 * @swagger
 * /api/task-templates/public:
 *   get:
 *     summary: 获取公共模板
 *     tags: [Task Templates]
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
 *           maximum: 100
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/public', authenticateToken, TaskTemplateController.getPublicTemplates);

/**
 * @swagger
 * /api/task-templates/search:
 *   get:
 *     summary: 搜索模板
 *     tags: [Task Templates]
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
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: 是否公开
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: 创建者ID
 *     responses:
 *       200:
 *         description: 搜索成功
 *       400:
 *         description: 缺少搜索关键词
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
router.get('/search', authenticateToken, TaskTemplateController.searchTemplates);

/**
 * @swagger
 * /api/task-templates/stats:
 *   get:
 *     summary: 获取模板统计
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID过滤
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
 *                   $ref: '#/components/schemas/TemplateStats'
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
router.get('/stats', authenticateToken, TaskTemplateController.getTemplateStats);

/**
 * @swagger
 * /api/task-templates/bulk:
 *   post:
 *     summary: 批量创建模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templates:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateTaskTemplateRequest'
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
 *                     templates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskTemplate'
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
router.post('/bulk', authenticateToken, TaskTemplateController.createBulkTemplates);

/**
 * @swagger
 * /api/task-templates/{templateId}:
 *   get:
 *     summary: 获取单个任务模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: 模板ID
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
 *                   $ref: '#/components/schemas/TaskTemplate'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       404:
 *         description: 模板不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:templateId', authenticateToken, TaskTemplateController.getTemplateById);

/**
 * @swagger
 * /api/task-templates/{templateId}:
 *   put:
 *     summary: 更新任务模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: 模板ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskTemplate'
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
 *       403:
 *         description: 无权修改
 *       404:
 *         description: 模板不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:templateId', authenticateToken, TaskTemplateController.updateTemplate);

/**
 * @swagger
 * /api/task-templates/{templateId}:
 *   delete:
 *     summary: 删除任务模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: 模板ID
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
 *       403:
 *         description: 无权删除
 *       404:
 *         description: 模板不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:templateId', authenticateToken, TaskTemplateController.deleteTemplate);

/**
 * @swagger
 * /api/task-templates/{templateId}/copy:
 *   post:
 *     summary: 复制任务模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: 模板ID
 *     responses:
 *       201:
 *         description: 复制成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskTemplate'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权复制
 *       404:
 *         description: 模板不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/:templateId/copy', authenticateToken, TaskTemplateController.copyTemplate);

/**
 * @swagger
 * /api/task-templates/create-task:
 *   post:
 *     summary: 从模板创建任务
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskFromTemplateRequest'
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
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     projectId:
 *                       type: string
 *                     assigneeId:
 *                       type: string
 *                     creatorId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     assignee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     creator:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
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
 *       403:
 *         description: 无权使用此模板
 *       404:
 *         description: 模板不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/create-task', authenticateToken, TaskTemplateController.createTaskFromTemplate);

/**
 * @swagger
 * /api/task-templates/cleanup:
 *   post:
 *     summary: 清理未使用的模板
 *     tags: [Task Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysThreshold:
 *                 type: integer
 *                 default: 30
 *                 description: 天数阈值
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
router.post('/cleanup', authenticateToken, TaskTemplateController.cleanupUnusedTemplates);

export default router;