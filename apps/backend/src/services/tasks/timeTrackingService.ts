import { PrismaClient } from '@prisma/client';
import {
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TimeEntry,
  TimeEntryFilters,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class TimeTrackingService {
  /**
   * 创建时间记录
   */
  static async createTimeEntry(
    taskId: string,
    data: CreateTimeEntryRequest,
    userId: string
  ): Promise<TimeEntry> {
    // 计算持续时间
    let duration: number | undefined;
    if (data.endTime) {
      duration = Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60));
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        duration,
        taskId,
        userId
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

    return timeEntry as unknown as TimeEntry;
  }

  /**
   * 获取时间记录列表
   */
  static async getTimeEntries(
    filters: TimeEntryFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<TimeEntry>> {
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

    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {};
      if (filters.dateFrom) {
        where.startTime.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.startTime.lte = new Date(filters.dateTo);
      }
    }

    // 获取总数
    const total = await prisma.timeEntry.count({ where });

    // 获取时间记录列表
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
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
      data: timeEntries as unknown as TimeEntry[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取单个时间记录
   */
  static async getTimeEntryById(timeEntryId: string): Promise<TimeEntry | null> {
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
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

    return timeEntry as unknown as TimeEntry | null;
  }

  /**
   * 更新时间记录
   */
  static async updateTimeEntry(
    timeEntryId: string,
    data: UpdateTimeEntryRequest,
    userId: string
  ): Promise<TimeEntry> {
    // 检查权限
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      select: { userId: true }
    });

    if (!timeEntry) {
      throw new Error('时间记录不存在');
    }

    if (timeEntry.userId !== userId) {
      throw new Error('无权编辑此时间记录');
    }

    // 计算持续时间
    let duration: number | undefined;
    if (data.endTime) {
      const startTime = data.startTime ? new Date(data.startTime) :
        (await prisma.timeEntry.findUnique({ where: { id: timeEntryId }, select: { startTime: true } }))?.startTime;

      if (startTime) {
        duration = Math.round((new Date(data.endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60));
      }
    }

    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (duration !== undefined) updateData.duration = duration;

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: updateData,
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

    return updatedTimeEntry as unknown as TimeEntry;
  }

  /**
   * 删除时间记录
   */
  static async deleteTimeEntry(timeEntryId: string, userId: string): Promise<void> {
    // 检查权限
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      select: { userId: true }
    });

    if (!timeEntry) {
      throw new Error('时间记录不存在');
    }

    if (timeEntry.userId !== userId) {
      throw new Error('无权删除此时间记录');
    }

    await prisma.timeEntry.delete({
      where: { id: timeEntryId }
    });
  }

  /**
   * 获取任务的总时间
   */
  static async getTaskTotalTime(taskId: string): Promise<{
    totalMinutes: number;
    totalHours: number;
    entryCount: number;
  }> {
    const result = await prisma.timeEntry.aggregate({
      where: { taskId },
      _sum: { duration: true },
      _count: { id: true }
    });

    const totalMinutes = result._sum.duration || 0;
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    const entryCount = result._count.id || 0;

    return {
      totalMinutes,
      totalHours,
      entryCount
    };
  }

  /**
   * 获取用户的时间统计
   */
  static async getUserTimeStats(
    userId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalMinutes: number;
    totalHours: number;
    entryCount: number;
    averagePerDay: number;
  }> {
    const where: any = { userId };

    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = new Date(dateFrom);
      if (dateTo) where.startTime.lte = new Date(dateTo);
    }

    const result = await prisma.timeEntry.aggregate({
      where,
      _sum: { duration: true },
      _count: { id: true }
    });

    const totalMinutes = result._sum.duration || 0;
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    const entryCount = result._count.id || 0;

    // 计算平均每天时间
    let averagePerDay = 0;
    if (dateFrom && dateTo) {
      const days = Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24));
      averagePerDay = days > 0 ? Math.round((totalHours / days) * 100) / 100 : 0;
    }

    return {
      totalMinutes,
      totalHours,
      entryCount,
      averagePerDay
    };
  }

  /**
   * 获取正在运行的时间记录
   */
  static async getRunningTimeEntry(userId: string, taskId?: string): Promise<TimeEntry | null> {
    const where: any = {
      userId,
      endTime: null
    };

    if (taskId) {
      where.taskId = taskId;
    }

    const timeEntry = await prisma.timeEntry.findFirst({
      where,
      orderBy: { startTime: 'desc' },
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

    return timeEntry as unknown as TimeEntry | null;
  }

  /**
   * 停止时间记录
   */
  static async stopTimeEntry(timeEntryId: string, userId: string): Promise<TimeEntry> {
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      select: { userId: true, startTime: true }
    });

    if (!timeEntry) {
      throw new Error('时间记录不存在');
    }

    if (timeEntry.userId !== userId) {
      throw new Error('无权停止此时间记录');
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - new Date(timeEntry.startTime).getTime()) / (1000 * 60));

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: {
        endTime,
        duration
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

    return updatedTimeEntry as unknown as TimeEntry;
  }
}
