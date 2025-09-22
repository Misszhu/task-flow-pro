import { Request, Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { FileUploadService } from '../../services/files/fileUploadService';
import { RequestContext } from '../../types/api';
import multer from 'multer';

// 配置 multer 用于内存存储
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5个文件
  }
});

export class FileUploadController {
  /**
   * 上传文件到任务
   */
  static async uploadFileToTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.params;
      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      const file = req.file;
      if (!file) {
        ApiResponseUtil.badRequest(res, '请选择要上传的文件', req.context);
        return;
      }

      const result = await FileUploadService.uploadFileToTask(file, taskId, userId);

      ApiResponseUtil.success(
        res,
        result,
        '文件上传成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('文件上传失败:', error);
      if (error instanceof Error) {
        if (error.message === '任务不存在') {
          ApiResponseUtil.notFound(res, '任务不存在', req.context);
          return;
        }
        if (error.message.includes('文件大小超过限制') || error.message.includes('不支持的文件类型')) {
          ApiResponseUtil.badRequest(res, error.message, req.context);
          return;
        }
      }
      ApiResponseUtil.serverError(
        res,
        '文件上传失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 批量上传文件到任务
   */
  static async uploadMultipleFilesToTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.params;
      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        ApiResponseUtil.badRequest(res, '请选择要上传的文件', req.context);
        return;
      }

      const results = [];
      for (const file of files) {
        try {
          const result = await FileUploadService.uploadFileToTask(file, taskId, userId);
          results.push(result);
        } catch (error) {
          console.error(`上传文件 ${file.originalname} 失败:`, error);
          // 继续上传其他文件
        }
      }

      ApiResponseUtil.success(
        res,
        {
          uploaded: results.length,
          total: files.length,
          files: results
        },
        `成功上传 ${results.length}/${files.length} 个文件`,
        200,
        req.context
      );
    } catch (error) {
      console.error('批量文件上传失败:', error);
      ApiResponseUtil.serverError(
        res,
        '批量文件上传失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取任务的附件列表
   */
  static async getTaskAttachments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.params;
      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      const attachments = await FileUploadService.getTaskAttachments(taskId);

      ApiResponseUtil.success(
        res,
        attachments,
        '获取附件列表成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取附件列表失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取附件列表失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取附件详情
   */
  static async getAttachmentDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { attachmentId } = req.params;
      if (!attachmentId) {
        ApiResponseUtil.badRequest(res, '缺少附件ID参数', req.context);
        return;
      }

      const attachment = await FileUploadService.getAttachmentById(attachmentId);

      ApiResponseUtil.success(
        res,
        attachment,
        '获取附件详情成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取附件详情失败:', error);
      if (error instanceof Error && error.message === '附件不存在') {
        ApiResponseUtil.notFound(res, '附件不存在', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '获取附件详情失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 下载附件
   */
  static async downloadAttachment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { attachmentId } = req.params;
      if (!attachmentId) {
        ApiResponseUtil.badRequest(res, '缺少附件ID参数', req.context);
        return;
      }

      const { content, filename, mimeType } = await FileUploadService.getFileContent(attachmentId);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', content.length);

      res.send(content);
    } catch (error) {
      console.error('下载附件失败:', error);
      if (error instanceof Error && error.message === '附件不存在') {
        ApiResponseUtil.notFound(res, '附件不存在', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '下载附件失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 删除附件
   */
  static async deleteAttachment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { attachmentId } = req.params;
      if (!attachmentId) {
        ApiResponseUtil.badRequest(res, '缺少附件ID参数', req.context);
        return;
      }

      await FileUploadService.deleteAttachment(attachmentId, userId);

      ApiResponseUtil.success(
        res,
        null,
        '删除附件成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('删除附件失败:', error);
      if (error instanceof Error && error.message === '附件不存在') {
        ApiResponseUtil.notFound(res, '附件不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权删除此附件') {
        ApiResponseUtil.forbidden(res, '无权删除此附件', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '删除附件失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取附件统计信息
   */
  static async getAttachmentStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.query;

      const stats = await FileUploadService.getAttachmentStats(
        taskId as string,
        req.query.userId ? req.query.userId as string : undefined
      );

      ApiResponseUtil.success(
        res,
        stats,
        '获取附件统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取附件统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取附件统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取 multer 中间件
   */
  static getUploadMiddleware(): any {
    return upload.single('file');
  }

  /**
   * 获取批量上传中间件
   */
  static getMultipleUploadMiddleware(): any {
    return upload.array('files', 5);
  }
}
