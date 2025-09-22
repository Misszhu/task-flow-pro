import { Router } from 'express';
import { WebSocketController } from '../../controllers/websocket/websocketController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WebSocketConnectionInfo:
 *       type: object
 *       properties:
 *         onlineUsers:
 *           type: integer
 *         rooms:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *         totalConnections:
 *           type: integer
 *         isConnected:
 *           type: boolean
 *     NotificationData:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         taskId:
 *           type: string
 *         projectId:
 *           type: string
 *         userId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TaskUpdateData:
 *       type: object
 *       properties:
 *         taskId:
 *           type: string
 *         projectId:
 *           type: string
 *         updates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               oldValue:
 *                 type: any
 *               newValue:
 *                 type: any
 *         updatedBy:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *     ProjectUpdateData:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *         updates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               oldValue:
 *                 type: any
 *               newValue:
 *                 type: any
 *         updatedBy:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/websocket/connection-info:
 *   get:
 *     summary: 获取 WebSocket 连接信息
 *     tags: [WebSocket]
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
 *                   $ref: '#/components/schemas/WebSocketConnectionInfo'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.get('/connection-info', authenticateToken, WebSocketController.getConnectionInfo);

/**
 * @swagger
 * /api/websocket/test-message:
 *   post:
 *     summary: 发送测试消息
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: 消息内容
 *               targetRoom:
 *                 type: string
 *                 description: 目标房间（可选）
 *     responses:
 *       200:
 *         description: 发送成功
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
 *                     message:
 *                       type: string
 *                     targetRoom:
 *                       type: string
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/test-message', authenticateToken, WebSocketController.sendTestMessage);

/**
 * @swagger
 * /api/websocket/send-notification:
 *   post:
 *     summary: 发送通知给用户
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - type
 *               - title
 *               - content
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: 目标用户ID
 *               type:
 *                 type: string
 *                 description: 通知类型
 *               title:
 *                 type: string
 *                 description: 通知标题
 *               content:
 *                 type: string
 *                 description: 通知内容
 *               taskId:
 *                 type: string
 *                 description: 任务ID（可选）
 *               projectId:
 *                 type: string
 *                 description: 项目ID（可选）
 *     responses:
 *       200:
 *         description: 发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NotificationData'
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/send-notification', authenticateToken, WebSocketController.sendNotificationToUser);

/**
 * @swagger
 * /api/websocket/send-project-notification:
 *   post:
 *     summary: 发送项目通知
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - type
 *               - title
 *               - content
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: 项目ID
 *               type:
 *                 type: string
 *                 description: 通知类型
 *               title:
 *                 type: string
 *                 description: 通知标题
 *               content:
 *                 type: string
 *                 description: 通知内容
 *               taskId:
 *                 type: string
 *                 description: 任务ID（可选）
 *     responses:
 *       200:
 *         description: 发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/NotificationData'
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/send-project-notification', authenticateToken, WebSocketController.sendProjectNotification);

/**
 * @swagger
 * /api/websocket/send-task-update:
 *   post:
 *     summary: 发送任务更新通知
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - updates
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: 任务ID
 *               projectId:
 *                 type: string
 *                 description: 项目ID（可选）
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     oldValue:
 *                       type: any
 *                     newValue:
 *                       type: any
 *                 description: 更新字段列表
 *     responses:
 *       200:
 *         description: 发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskUpdateData'
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/send-task-update', authenticateToken, WebSocketController.sendTaskUpdate);

/**
 * @swagger
 * /api/websocket/send-project-update:
 *   post:
 *     summary: 发送项目更新通知
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - updates
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: 项目ID
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     oldValue:
 *                       type: any
 *                     newValue:
 *                       type: any
 *                 description: 更新字段列表
 *     responses:
 *       200:
 *         description: 发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProjectUpdateData'
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/send-project-update', authenticateToken, WebSocketController.sendProjectUpdate);

/**
 * @swagger
 * /api/websocket/broadcast:
 *   post:
 *     summary: 广播消息
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 消息内容
 *               data:
 *                 type: any
 *                 description: 附加数据（可选）
 *     responses:
 *       200:
 *         description: 广播成功
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
 *                     message:
 *                       type: string
 *                     data:
 *                       type: any
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/broadcast', authenticateToken, WebSocketController.broadcastMessage);

/**
 * @swagger
 * /api/websocket/disconnect-user/{targetUserId}:
 *   post:
 *     summary: 断开用户连接
 *     tags: [WebSocket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: 目标用户ID
 *     responses:
 *       200:
 *         description: 断开成功
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
 *                     targetUserId:
 *                       type: string
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
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.post('/disconnect-user/:targetUserId', authenticateToken, WebSocketController.disconnectUser);

/**
 * @swagger
 * /api/websocket/online-stats:
 *   get:
 *     summary: 获取在线用户统计
 *     tags: [WebSocket]
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
 *                     onlineUsers:
 *                       type: integer
 *                     totalConnections:
 *                       type: integer
 *                     activeRooms:
 *                       type: integer
 *                     roomDetails:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       503:
 *         description: WebSocket 服务不可用
 *       500:
 *         description: 服务器错误
 */
router.get('/online-stats', authenticateToken, WebSocketController.getOnlineStats);

export default router;
