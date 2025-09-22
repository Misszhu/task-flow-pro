import { PrismaClient } from '@prisma/client';
import {
  UploadAttachmentRequest,
  TaskAttachment,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const prisma = new PrismaClient();

export class FileAttachmentService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];

  /**
   * 上传文件附件
   */
  static async uploadAttachment(
    taskId: string,
    file: any,
    userId: string
  ): Promise<TaskAttachment> {
    // 验证文件
    this.validateFile(file);

    // 确保上传目录存在
    await this.ensureUploadDir();

    // 生成唯一文件名
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.UPLOAD_DIR, filename);

    // 保存文件
    await fs.promises.writeFile(filePath, file.buffer);

    // 保存到数据库
    const attachment = await prisma.taskAttachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        taskId,
        uploadedBy: userId
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return attachment as unknown as TaskAttachment;
  }

  /**
   * 获取任务附件列表
   */
  static async getTaskAttachments(
    taskId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskAttachment>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const total = await prisma.taskAttachment.count({
      where: { taskId }
    });

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return {
      data: attachments as unknown as TaskAttachment[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取单个附件
   */
  static async getAttachmentById(attachmentId: string): Promise<TaskAttachment | null> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return attachment as unknown as TaskAttachment | null;
  }

  /**
   * 删除附件
   */
  static async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      select: { uploadedBy: true, path: true }
    });

    if (!attachment) {
      throw new Error('附件不存在');
    }

    // 检查权限（只有上传者可以删除）
    if (attachment.uploadedBy !== userId) {
      throw new Error('无权删除此附件');
    }

    // 删除文件
    try {
      await fs.promises.unlink(attachment.path);
    } catch (error) {
      console.warn('删除文件失败:', error);
    }

    // 删除数据库记录
    await prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });
  }

  /**
   * 获取附件文件流
   */
  static async getAttachmentStream(attachmentId: string): Promise<{
    stream: fs.ReadStream;
    filename: string;
    mimeType: string;
    size: number;
  }> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      select: { filename: true, originalName: true, mimeType: true, size: true, path: true }
    });

    if (!attachment) {
      throw new Error('附件不存在');
    }

    // 检查文件是否存在
    try {
      await fs.promises.access(attachment.path);
    } catch (error) {
      throw new Error('文件不存在');
    }

    const stream = fs.createReadStream(attachment.path);

    return {
      stream,
      filename: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size
    };
  }

  /**
   * 验证文件
   */
  private static validateFile(file: any): void {
    if (!file) {
      throw new Error('没有上传文件');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`文件大小不能超过 ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('不支持的文件类型');
    }
  }

  /**
   * 确保上传目录存在
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await fs.promises.access(this.UPLOAD_DIR);
    } catch (error) {
      await fs.promises.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * 获取附件统计
   */
  static async getAttachmentStats(taskId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    totalSizeMB: number;
    byMimeType: Record<string, number>;
  }> {
    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      select: { mimeType: true, size: true }
    });

    const totalFiles = attachments.length;
    const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
    const totalSizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;

    const byMimeType: Record<string, number> = {};
    attachments.forEach(att => {
      byMimeType[att.mimeType] = (byMimeType[att.mimeType] || 0) + 1;
    });

    return {
      totalFiles,
      totalSize,
      totalSizeMB,
      byMimeType
    };
  }

  /**
   * 清理孤立的附件文件
   */
  static async cleanupOrphanedFiles(): Promise<number> {
    const attachments = await prisma.taskAttachment.findMany({
      select: { id: true, path: true }
    });

    let cleanedCount = 0;

    for (const attachment of attachments) {
      try {
        await fs.promises.access(attachment.path);
      } catch (error) {
        // 文件不存在，删除数据库记录
        await prisma.taskAttachment.delete({
          where: { id: attachment.id }
        });
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}
