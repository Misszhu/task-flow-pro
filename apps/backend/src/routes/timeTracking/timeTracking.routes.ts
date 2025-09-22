import { Router } from 'express';
import { TimeTrackingController } from '../../controllers/timeTracking/timeTrackingController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         taskId:
 *           type: string
 *         userId:
 *           type: string
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: 持续时间（分钟）
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         task:
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
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *     TimeTrackingStats:
 *       type: object
 *       properties:
 *         totalTime:
 *           type: integer
 *           description: 总时间（分钟）
 *         totalEntries:
 *           type: integer
 *         averageSessionTime:
 *           type: integer
 *         longestSession:
 *           type: integer
 *         shortestSession:
 *           type: integer
 *         byDay:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               totalTime:
 *                 type: integer
 *               entries:
 *                 type: integer
 *         byTask:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               taskTitle:
 *                 type: string
 *               totalTime:
 *                 type: integer
 *               entries:
 *                 type: integer
 *     CreateTimeEntryRequest:
 *       type: object
 *       required:
 *         - taskId
 *         - startTime
 *       properties:
 *         taskId:
 *           type: string
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *     UpdateTimeEntryRequest:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *     StartTimeTrackingRequest:
 *       type: object
 *       required:
 *         - taskId
 *       properties:
 *         taskId:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/time-tracking:
 *   post:
 *     summary: 创建时间记录
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTimeEntryRequest'
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
 *                   $ref: '#/components/schemas/TimeEntry'
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
 *       500:
 *         description: 服务器错误
 */
router.post('/', authenticateToken, TimeTrackingController.createTimeEntry);

/**
 * @swagger
 * /api/time-tracking:
 *   get:
 *     summary: 获取时间记录列表
 *     tags: [Time Tracking]
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
 *         name: taskId
 *         schema:
 *           type: string
 *         description: 任务ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期
 *       - in: query
 *         name: isRunning
 *         schema:
 *           type: boolean
 *         description: 是否运行中
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
 *                         $ref: '#/components/schemas/TimeEntry'
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
router.get('/', authenticateToken, TimeTrackingController.getTimeEntries);

/**
 * @swagger
 * /api/time-tracking/running:
 *   get:
 *     summary: 获取当前运行中的时间记录
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
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
 *                   $ref: '#/components/schemas/TimeEntry'
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
router.get('/running', authenticateToken, TimeTrackingController.getRunningTimeEntry);

/**
 * @swagger
 * /api/time-tracking/stats:
 *   get:
 *     summary: 获取时间跟踪统计
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: 任务ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期
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
 *                   $ref: '#/components/schemas/TimeTrackingStats'
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
router.get('/stats', authenticateToken, TimeTrackingController.getTimeTrackingStats);

/**
 * @swagger
 * /api/time-tracking/start:
 *   post:
 *     summary: 开始时间跟踪
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartTimeTrackingRequest'
 *     responses:
 *       201:
 *         description: 开始成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TimeEntry'
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
 *       500:
 *         description: 服务器错误
 */
router.post('/start', authenticateToken, TimeTrackingController.startTimeTracking);

/**
 * @swagger
 * /api/time-tracking/{timeEntryId}:
 *   get:
 *     summary: 获取单个时间记录
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *         description: 时间记录ID
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
 *                   $ref: '#/components/schemas/TimeEntry'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       404:
 *         description: 时间记录不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:timeEntryId', authenticateToken, TimeTrackingController.getTimeEntryById);

/**
 * @swagger
 * /api/time-tracking/{timeEntryId}:
 *   put:
 *     summary: 更新时间记录
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *         description: 时间记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTimeEntryRequest'
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
 *                   $ref: '#/components/schemas/TimeEntry'
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
 *         description: 时间记录不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:timeEntryId', authenticateToken, TimeTrackingController.updateTimeEntry);

/**
 * @swagger
 * /api/time-tracking/{timeEntryId}:
 *   delete:
 *     summary: 删除时间记录
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *         description: 时间记录ID
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
 *         description: 时间记录不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:timeEntryId', authenticateToken, TimeTrackingController.deleteTimeEntry);

/**
 * @swagger
 * /api/time-tracking/{timeEntryId}/stop:
 *   patch:
 *     summary: 停止时间跟踪
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: timeEntryId
 *         required: true
 *         schema:
 *           type: string
 *         description: 时间记录ID
 *     responses:
 *       200:
 *         description: 停止成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TimeEntry'
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
 *         description: 无权操作
 *       404:
 *         description: 时间记录不存在
 *       500:
 *         description: 服务器错误
 */
router.patch('/:timeEntryId/stop', authenticateToken, TimeTrackingController.stopTimeTracking);

/**
 * @swagger
 * /api/time-tracking/tasks/{taskId}/stats:
 *   get:
 *     summary: 获取任务时间统计
 *     tags: [Time Tracking]
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
 *                     totalTime:
 *                       type: integer
 *                     totalEntries:
 *                       type: integer
 *                     averageSessionTime:
 *                       type: integer
 *                     byUser:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           totalTime:
 *                             type: integer
 *                           entries:
 *                             type: integer
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
router.get('/tasks/:taskId/stats', authenticateToken, TimeTrackingController.getTaskTimeStats);

export default router;
