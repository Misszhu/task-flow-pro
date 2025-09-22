import { Router } from 'express';
import { ProjectController } from '../../../controllers/projects/projectController';
import { authenticateToken, requireRole } from '../../../middleware/auth';
import {
  requireProjectAccess,
  requireMemberManagement,
  requireProjectEdit,
  requireProjectDelete
} from '../../../middleware/projectAuth';
import { projectRateLimit } from '../../../middleware/rateLimiting';
import { versionRouter } from '../../../middleware/versioning';

const router: Router = Router();
const projectController = new ProjectController();

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: 获取项目列表
 *     description: 获取用户有权限访问的项目列表，支持分页、搜索和过滤
 *     tags: [Projects v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（项目名称或描述）
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         description: 项目可见性过滤
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name]
 *           default: createdAt
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序顺序
 *     responses:
 *       200:
 *         description: 成功获取项目列表
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
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 version:
 *                   type: string
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/',
  versionRouter('v1'),
  authenticateToken,
  projectRateLimit,
  projectController.getAllProjects.bind(projectController)
);

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: 创建新项目
 *     description: 创建新项目
 *     tags: [Projects v1]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       500:
 *         description: 创建失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  versionRouter('v1'),
  authenticateToken,
  projectRateLimit,
  projectController.createProject.bind(projectController)
);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: 获取单个项目
 *     description: 根据ID获取项目详情
 *     tags: [Projects v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *     responses:
 *       200:
 *         description: 成功获取项目详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectDetail'
 *       404:
 *         description: 项目不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  versionRouter('v1'),
  authenticateToken,
  requireProjectAccess(),
  projectRateLimit,
  projectController.getProjectById.bind(projectController)
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/members:
 *   post:
 *     summary: 添加项目成员
 *     description: 向项目添加新成员
 *     tags: [Project Members v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMemberRequest'
 *     responses:
 *       201:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectMember'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 项目或用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/members',
  versionRouter('v1'),
  authenticateToken,
  requireMemberManagement,
  projectRateLimit,
  projectController.addProjectMember.bind(projectController)
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/members:
 *   get:
 *     summary: 获取项目成员列表
 *     description: 获取项目的所有成员
 *     tags: [Project Members v1]
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
 *         description: 成功获取成员列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectMember'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:projectId/members',
  versionRouter('v1'),
  authenticateToken,
  requireMemberManagement,
  projectRateLimit,
  projectController.getProjectMembers.bind(projectController)
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/members/{userId}:
 *   put:
 *     summary: 更新项目成员角色
 *     description: 更新项目成员的角色
 *     tags: [Project Members v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMemberRoleRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectMember'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:projectId/members/:userId',
  versionRouter('v1'),
  authenticateToken,
  requireMemberManagement,
  projectRateLimit,
  projectController.updateProjectMemberRole.bind(projectController)
);

/**
 * @swagger
 * /api/v1/projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: 移除项目成员
 *     description: 从项目中移除成员
 *     tags: [Project Members v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: 项目ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 移除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 version:
 *                   type: string
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:projectId/members/:userId',
  versionRouter('v1'),
  authenticateToken,
  requireMemberManagement,
  projectRateLimit,
  projectController.removeProjectMember.bind(projectController)
);

export default router;
