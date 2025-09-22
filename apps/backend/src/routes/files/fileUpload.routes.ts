import { Router } from 'express';
import { FileUploadController } from '../../controllers/files/fileUploadController';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskAttachment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         path:
 *           type: string
 *         taskId:
 *           type: string
 *         uploadedBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         uploader:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *     AttachmentStats:
 *       type: object
 *       properties:
 *         totalFiles:
 *           type: integer
 *         totalSize:
 *           type: integer
 *         byMimeType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 */

/**
 * @swagger
 * /api/files/tasks/{taskId}/upload:
 *   post:
 *     summary: 上传文件到任务
 *     tags: [File Upload]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskAttachment'
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
router.post('/tasks/:taskId/upload',
  authenticateToken,
  FileUploadController.getUploadMiddleware(),
  FileUploadController.uploadFileToTask
);

/**
 * @swagger
 * /api/files/tasks/{taskId}/upload-multiple:
 *   post:
 *     summary: 批量上传文件到任务
 *     tags: [File Upload]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 要上传的文件列表（最多5个）
 *     responses:
 *       200:
 *         description: 上传成功
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
 *                     uploaded:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskAttachment'
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
router.post('/tasks/:taskId/upload-multiple',
  authenticateToken,
  FileUploadController.getMultipleUploadMiddleware(),
  FileUploadController.uploadMultipleFilesToTask
);

/**
 * @swagger
 * /api/files/tasks/{taskId}/attachments:
 *   get:
 *     summary: 获取任务的附件列表
 *     tags: [File Upload]
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskAttachment'
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
router.get('/tasks/:taskId/attachments', authenticateToken, FileUploadController.getTaskAttachments);

/**
 * @swagger
 * /api/files/attachments/{attachmentId}:
 *   get:
 *     summary: 获取附件详情
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 附件ID
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
 *                   $ref: '#/components/schemas/TaskAttachment'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: 未认证
 *       404:
 *         description: 附件不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/attachments/:attachmentId', authenticateToken, FileUploadController.getAttachmentDetails);

/**
 * @swagger
 * /api/files/attachments/{attachmentId}/download:
 *   get:
 *     summary: 下载附件
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 附件ID
 *     responses:
 *       200:
 *         description: 下载成功
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未认证
 *       404:
 *         description: 附件不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/attachments/:attachmentId/download', authenticateToken, FileUploadController.downloadAttachment);

/**
 * @swagger
 * /api/files/attachments/{attachmentId}:
 *   delete:
 *     summary: 删除附件
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 附件ID
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
 *         description: 附件不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/attachments/:attachmentId', authenticateToken, FileUploadController.deleteAttachment);

/**
 * @swagger
 * /api/files/stats:
 *   get:
 *     summary: 获取附件统计信息
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *         description: 任务ID（可选）
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID（可选）
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
 *                   $ref: '#/components/schemas/AttachmentStats'
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
router.get('/stats', authenticateToken, FileUploadController.getAttachmentStats);

export default router;
