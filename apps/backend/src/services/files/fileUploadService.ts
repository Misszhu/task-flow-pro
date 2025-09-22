import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface FileUploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  taskId: string;
  createdAt: Date;
}

export class FileUploadService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed'
  ];

  /**
   * 确保上传目录存在
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * 验证文件类型和大小
   */
  private static validateFile(file: Express.Multer.File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`文件大小超过限制 (最大 ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(`不支持的文件类型: ${file.mimetype}`);
    }
  }

  /**
   * 生成唯一文件名
   */
  private static generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const uuid = uuidv4();
    return `${name}_${uuid}${ext}`;
  }

  /**
   * 上传文件到任务
   */
  static async uploadFileToTask(
    file: Express.Multer.File,
    taskId: string,
    uploadedBy: string
  ): Promise<FileUploadResult> {
    // 验证任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true }
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    // 验证文件
    this.validateFile(file);

    // 确保上传目录存在
    await this.ensureUploadDir();

    // 生成唯一文件名
    const filename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.UPLOAD_DIR, filename);

    // 保存文件
    await fs.writeFile(filePath, file.buffer);

    // 保存文件记录到数据库
    const attachment = await prisma.taskAttachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        taskId,
        uploadedBy
      }
    });

    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      uploadedBy: attachment.uploadedBy,
      taskId: attachment.taskId,
      createdAt: attachment.createdAt
    };
  }

  /**
   * 获取任务的附件列表
   */
  static async getTaskAttachments(taskId: string): Promise<any[]> {
    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return attachments;
  }

  /**
   * 获取附件详情
   */
  static async getAttachmentById(attachmentId: string): Promise<any> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    if (!attachment) {
      throw new Error('附件不存在');
    }

    return attachment;
  }

  /**
   * 删除附件
   */
  static async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        uploadedBy: true,
        path: true,
        task: {
          select: {
            creatorId: true,
            assigneeId: true,
            project: {
              select: {
                ownerId: true,
                members: {
                  select: {
                    userId: true,
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!attachment) {
      throw new Error('附件不存在');
    }

    // 检查删除权限
    const canDelete =
      attachment.uploadedBy === userId || // 上传者
      attachment.task.creatorId === userId || // 任务创建者
      attachment.task.assigneeId === userId || // 任务分配者
      (attachment.task.project && attachment.task.project.ownerId === userId) || // 项目所有者
      (attachment.task.project && attachment.task.project.members.some(member =>
        member.userId === userId &&
        ['MANAGER', 'COLLABORATOR'].includes(member.role)
      )); // 项目管理者

    if (!canDelete) {
      throw new Error('无权删除此附件');
    }

    // 删除物理文件
    try {
      await fs.unlink(attachment.path);
    } catch (error) {
      console.warn('删除物理文件失败:', error);
    }

    // 删除数据库记录
    await prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });
  }

  /**
   * 获取文件内容用于下载
   */
  static async getFileContent(attachmentId: string): Promise<{ content: Buffer; filename: string; mimeType: string }> {
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
      select: { path: true, originalName: true, mimeType: true }
    });

    if (!attachment) {
      throw new Error('附件不存在');
    }

    const content = await fs.readFile(attachment.path);

    return {
      content,
      filename: attachment.originalName,
      mimeType: attachment.mimeType
    };
  }

  /**
   * 获取附件统计信息
   */
  static async getAttachmentStats(taskId?: string, userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byMimeType: Record<string, number>;
  }> {
    const where: any = {};
    if (taskId) where.taskId = taskId;
    if (userId) where.uploadedBy = userId;

    const attachments = await prisma.taskAttachment.findMany({
      where,
      select: {
        size: true,
        mimeType: true
      }
    });

    const totalFiles = attachments.length;
    const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
    const byMimeType: Record<string, number> = {};

    attachments.forEach(att => {
      byMimeType[att.mimeType] = (byMimeType[att.mimeType] || 0) + 1;
    });

    return {
      totalFiles,
      totalSize,
      byMimeType
    };
  }

  /**
   * 清理孤立文件
   */
  static async cleanupOrphanedFiles(): Promise<number> {
    // 获取数据库中所有文件路径
    const dbFiles = await prisma.taskAttachment.findMany({
      select: { path: true }
    });

    const dbPaths = new Set(dbFiles.map(f => f.path));

    // 获取文件系统中的所有文件
    const fsFiles = await fs.readdir(this.UPLOAD_DIR);
    let deletedCount = 0;

    for (const file of fsFiles) {
      const filePath = path.join(this.UPLOAD_DIR, file);
      if (!dbPaths.has(filePath)) {
        try {
          await fs.unlink(filePath);
          deletedCount++;
        } catch (error) {
          console.warn(`删除孤立文件失败: ${filePath}`, error);
        }
      }
    }

    return deletedCount;
  }
}
