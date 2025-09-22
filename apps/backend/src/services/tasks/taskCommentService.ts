import { PrismaClient } from '@prisma/client';
import {
  CreateTaskCommentRequest,
  UpdateTaskCommentRequest,
  TaskComment,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class TaskCommentService {
  /**
   * 创建任务评论
   */
  static async createComment(
    taskId: string,
    data: CreateTaskCommentRequest,
    authorId: string
  ): Promise<TaskComment> {
    const comment = await prisma.taskComment.create({
      data: {
        content: data.content,
        taskId,
        authorId
      },
      include: {
        author: {
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

    return comment as unknown as TaskComment;
  }

  /**
   * 获取任务评论列表
   */
  static async getTaskComments(
    taskId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskComment>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 获取总数
    const total = await prisma.taskComment.count({
      where: { taskId }
    });

    // 获取评论列表
    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
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
      data: comments as unknown as TaskComment[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取单个评论
   */
  static async getCommentById(commentId: string): Promise<TaskComment | null> {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        author: {
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

    return comment as unknown as TaskComment | null;
  }

  /**
   * 更新评论
   */
  static async updateComment(
    commentId: string,
    data: UpdateTaskCommentRequest,
    userId: string
  ): Promise<TaskComment> {
    // 检查权限
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      select: { authorId: true }
    });

    if (!comment) {
      throw new Error('评论不存在');
    }

    if (comment.authorId !== userId) {
      throw new Error('无权编辑此评论');
    }

    const updatedComment = await prisma.taskComment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: {
        author: {
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

    return updatedComment as unknown as TaskComment;
  }

  /**
   * 删除评论
   */
  static async deleteComment(commentId: string, userId: string): Promise<void> {
    // 检查权限
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
      select: { authorId: true }
    });

    if (!comment) {
      throw new Error('评论不存在');
    }

    if (comment.authorId !== userId) {
      throw new Error('无权删除此评论');
    }

    await prisma.taskComment.delete({
      where: { id: commentId }
    });
  }

  /**
   * 检查用户是否有权限访问任务评论
   */
  static async checkCommentPermission(userId: string, taskId: string): Promise<boolean> {
    // 检查用户是否有权限访问任务
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        creatorId: true,
        assigneeId: true,
        projectId: true
      }
    });

    if (!task) {
      return false;
    }

    // 任务创建者或分配者可以访问
    if (task.creatorId === userId || task.assigneeId === userId) {
      return true;
    }

    // 如果是项目任务，检查用户是否是项目成员
    if (task.projectId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: userId
          }
        }
      });
      return !!membership;
    }

    return false;
  }
}
