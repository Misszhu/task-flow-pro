import { PrismaClient } from '@prisma/client';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  AssignTaskRequest,
  UpdateTaskStatusRequest,
  Task,
  TaskWithoutRelations,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';
import { TaskActivityService } from './taskActivityService';

const prisma = new PrismaClient();

export class TaskService {
  /**
   * 创建任务
   */
  static async createTask(data: CreateTaskRequest, creatorId: string): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        creatorId,
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
        project: true
      }
    });

    // 记录活动日志
    await TaskActivityService.logActivity(
      task.id,
      creatorId,
      'created',
      `创建了任务: ${data.title}`
    );

    return task as unknown as Task;
  }

  /**
   * 获取任务列表（支持筛选、分页、排序）
   */
  static async getTasks(
    filters: TaskFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Task>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // 获取总数
    const total = await prisma.task.count({ where });

    // 获取任务列表
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
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
        project: true
      }
    });

    return {
      data: tasks as unknown as Task[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取任务
   */
  static async getTaskById(id: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
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
        project: true
      }
    });

    return task as unknown as Task | null;
  }

  /**
   * 更新任务
   */
  static async updateTask(id: string, data: UpdateTaskRequest, userId?: string): Promise<Task> {
    const updateData: any = { ...data };

    // 如果状态更新为COMPLETED，设置完成时间
    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (data.status) {
      updateData.completedAt = null;
    }

    // 处理日期字段
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const task = await prisma.task.update({
      where: { id },
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
        project: true
      }
    });

    // 记录活动日志
    if (userId) {
      const changes = [];
      if (data.title) changes.push(`标题: ${data.title}`);
      if (data.description !== undefined) changes.push(`描述: ${data.description}`);
      if (data.status) changes.push(`状态: ${data.status}`);
      if (data.priority) changes.push(`优先级: ${data.priority}`);
      if (data.assigneeId) changes.push(`分配者: ${data.assigneeId}`);
      if (data.dueDate) changes.push(`截止日期: ${data.dueDate}`);

      if (changes.length > 0) {
        await TaskActivityService.logActivity(
          id,
          userId,
          'updated',
          `更新了任务: ${changes.join(', ')}`
        );
      }
    }

    return task as unknown as Task;
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id }
    });
  }

  /**
   * 分配任务
   */
  static async assignTask(id: string, assigneeId: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: { assigneeId },
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
        project: true
      }
    });

    return task as unknown as Task;
  }

  /**
   * 更新任务状态
   */
  static async updateTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<Task> {
    const updateData: any = { status };

    // 如果状态更新为COMPLETED，设置完成时间
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
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
        project: true
      }
    });

    return task as unknown as Task;
  }

  /**
   * 检查用户是否有权限访问任务
   */
  static async checkTaskPermission(userId: string, taskId: string): Promise<boolean> {
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

  /**
   * 检查用户是否可以编辑任务
   */
  static async checkTaskEditPermission(userId: string, taskId: string): Promise<boolean> {
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

    // 任务创建者可以编辑
    if (task.creatorId === userId) {
      return true;
    }

    // 分配者可以编辑状态和优先级
    if (task.assigneeId === userId) {
      return true;
    }

    // 如果是项目任务，检查用户是否是项目管理员
    if (task.projectId) {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: userId
          }
        },
        select: { role: true }
      });
      return membership?.role === 'MANAGER';
    }

    return false;
  }
}
