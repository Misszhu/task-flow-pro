import { PrismaClient } from '@prisma/client';
import {
  CreateSubtaskRequest,
  Task,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class SubtaskService {
  /**
   * 创建子任务
   */
  static async createSubtask(
    parentId: string,
    data: CreateSubtaskRequest,
    creatorId: string
  ): Promise<Task> {
    // 检查父任务是否存在
    const parentTask = await prisma.task.findUnique({
      where: { id: parentId }
    });

    if (!parentTask) {
      throw new Error('父任务不存在');
    }

    const subtask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        assigneeId: data.assigneeId,
        creatorId,
        parentId,
        projectId: parentTask.projectId, // 继承父任务的项目
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        project: true,
        parent: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    return subtask as unknown as Task;
  }

  /**
   * 获取子任务列表
   */
  static async getSubtasks(
    parentId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Task>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 获取总数
    const total = await prisma.task.count({
      where: { parentId }
    });

    // 获取子任务列表
    const subtasks = await prisma.task.findMany({
      where: { parentId },
      skip,
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        project: true,
        parent: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    return {
      data: subtasks as unknown as Task[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 更新子任务
   */
  static async updateSubtask(
    subtaskId: string,
    data: Partial<CreateSubtaskRequest>,
    userId: string
  ): Promise<Task> {
    // 检查权限
    const subtask = await prisma.task.findUnique({
      where: { id: subtaskId },
      select: { creatorId: true, assigneeId: true, projectId: true }
    });

    if (!subtask) {
      throw new Error('子任务不存在');
    }

    // 检查编辑权限
    const hasPermission = await this.checkSubtaskEditPermission(userId, subtaskId);
    if (!hasPermission) {
      throw new Error('无权编辑此子任务');
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority) updateData.priority = data.priority;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    const updatedSubtask = await prisma.task.update({
      where: { id: subtaskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        project: true,
        parent: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    return updatedSubtask as unknown as Task;
  }

  /**
   * 删除子任务
   */
  static async deleteSubtask(subtaskId: string, userId: string): Promise<void> {
    // 检查权限
    const subtask = await prisma.task.findUnique({
      where: { id: subtaskId },
      select: { creatorId: true }
    });

    if (!subtask) {
      throw new Error('子任务不存在');
    }

    if (subtask.creatorId !== userId) {
      throw new Error('只有创建者可以删除子任务');
    }

    await prisma.task.delete({
      where: { id: subtaskId }
    });
  }

  /**
   * 检查子任务编辑权限
   */
  static async checkSubtaskEditPermission(userId: string, subtaskId: string): Promise<boolean> {
    const subtask = await prisma.task.findUnique({
      where: { id: subtaskId },
      select: {
        creatorId: true,
        assigneeId: true,
        projectId: true
      }
    });

    if (!subtask) {
      return false;
    }

    // 创建者可以编辑
    if (subtask.creatorId === userId) {
      return true;
    }

    // 分配者可以编辑
    if (subtask.assigneeId === userId) {
      return true;
    }

    // 如果是项目任务，检查用户是否是项目管理员
    if (subtask.projectId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: subtask.projectId,
            userId: userId
          }
        },
        select: { role: true }
      });
      return membership?.role === 'MANAGER';
    }

    return false;
  }

  /**
   * 检查子任务访问权限
   */
  static async checkSubtaskAccessPermission(userId: string, subtaskId: string): Promise<boolean> {
    const subtask = await prisma.task.findUnique({
      where: { id: subtaskId },
      select: {
        creatorId: true,
        assigneeId: true,
        projectId: true
      }
    });

    if (!subtask) {
      return false;
    }

    // 创建者或分配者可以访问
    if (subtask.creatorId === userId || subtask.assigneeId === userId) {
      return true;
    }

    // 如果是项目任务，检查用户是否是项目成员
    if (subtask.projectId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: subtask.projectId,
            userId: userId
          }
        }
      });
      return !!membership;
    }

    return false;
  }
}
