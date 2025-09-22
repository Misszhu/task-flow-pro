import { Router } from 'express';
import { NotificationController } from '../../controllers/notifications/notificationController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [TASK_ASSIGNED, TASK_UPDATED, TASK_COMPLETED, TASK_COMMENTED, TASK_DUE_SOON, TASK_OVERDUE, DEPENDENCY_BLOCKED, DEPENDENCY_UNBLOCKED, SYSTEM]
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         readAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *         taskId:
 *           type: string
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
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         unread:
 *           type: integer
 *         byType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取用户通知列表
 *     tags: [Notifications]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [TASK_ASSIGNED, TASK_UPDATED, TASK_COMPLETED, TASK_COMMENTED, TASK_DUE_SOON, TASK_OVERDUE, DEPENDENCY_BLOCKED, DEPENDENCY_UNBLOCKED, SYSTEM]
 *         description: 通知类型
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: 是否已读
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
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
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
router.get('/', authenticateToken, NotificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: 获取未读通知数量
 *     tags: [Notifications]
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
 *                   type: object
 *                   properties:
 *                     unreadCount:
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
router.get('/unread-count', authenticateToken, NotificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: 标记通知为已读
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 通知ID
 *     responses:
 *       200:
 *         description: 标记成功
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
 *         description: 无权操作
 *       404:
 *         description: 通知不存在
 *       500:
 *         description: 服务器错误
 */
router.patch('/:notificationId/read', authenticateToken, NotificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: 标记所有通知为已读
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 标记成功
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
 *       500:
 *         description: 服务器错误
 */
router.patch('/mark-all-read', authenticateToken, NotificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: 删除通知
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 通知ID
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
 *         description: 通知不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:notificationId', authenticateToken, NotificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: 获取通知统计
 *     tags: [Notifications]
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
 *                   $ref: '#/components/schemas/NotificationStats'
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
router.get('/stats', authenticateToken, NotificationController.getNotificationStats);

export default router;
