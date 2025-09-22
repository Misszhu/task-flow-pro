import { PrismaClient } from '@prisma/client';
import {
  TaskActivity,
  TaskActivityFilters,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class TaskActivityService {
  /**
   * 记录任务活动
   */
  static async logActivity(
    taskId: string,
    userId: string,
    action: string,
    details?: string,
    oldValue?: string,
    newValue?: string
  ): Promise<TaskActivity> {
    const activity = await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action,
        details,
        oldValue,
        newValue
      },
      include: {
        user: {
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

    return activity as unknown as TaskActivity;
  }

  /**
   * 获取任务活动日志
   */
  static async getTaskActivities(
    taskId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskActivity>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 获取总数
    const total = await prisma.taskActivity.count({
      where: { taskId }
    });

    // 获取活动列表
    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
      data: activities as unknown as TaskActivity[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取用户活动日志
   */
  static async getUserActivities(
    userId: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskActivity>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 获取总数
    const total = await prisma.taskActivity.count({
      where: { userId }
    });

    // 获取活动列表
    const activities = await prisma.taskActivity.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
      data: activities as unknown as TaskActivity[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取活动日志（支持筛选）
   */
  static async getActivities(
    filters: TaskActivityFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TaskActivity>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    // 获取总数
    const total = await prisma.taskActivity.count({ where });

    // 获取活动列表
    const activities = await prisma.taskActivity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
      data: activities as unknown as TaskActivity[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取单个活动
   */
  static async getActivityById(activityId: string): Promise<TaskActivity | null> {
    const activity = await prisma.taskActivity.findUnique({
      where: { id: activityId },
      include: {
        user: {
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

    return activity as unknown as TaskActivity | null;
  }

  /**
   * 删除活动日志（仅管理员）
   */
  static async deleteActivity(activityId: string): Promise<void> {
    await prisma.taskActivity.delete({
      where: { id: activityId }
    });
  }

  /**
   * 清理旧的活动日志（保留最近N天的记录）
   */
  static async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.taskActivity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  /**
   * 获取活动统计
   */
  static async getActivityStats(taskId: string): Promise<{
    total: number;
    byAction: Record<string, number>;
    byUser: Record<string, number>;
  }> {
    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      select: {
        action: true,
        userId: true
      }
    });

    const total = activities.length;
    const byAction: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    activities.forEach(activity => {
      byAction[activity.action] = (byAction[activity.action] || 0) + 1;
      byUser[activity.userId] = (byUser[activity.userId] || 0) + 1;
    });

    return { total, byAction, byUser };
  }
}
