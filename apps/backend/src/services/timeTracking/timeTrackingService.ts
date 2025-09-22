import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTimeEntryData {
  taskId: string;
  userId: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
}

export interface UpdateTimeEntryData {
  description?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface TimeEntryFilters {
  taskId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isRunning?: boolean;
}

export interface TimeTrackingStats {
  totalTime: number; // 总时间（分钟）
  totalEntries: number;
  averageSessionTime: number;
  longestSession: number;
  shortestSession: number;
  byDay: Array<{
    date: string;
    totalTime: number;
    entries: number;
  }>;
  byTask: Array<{
    taskId: string;
    taskTitle: string;
    totalTime: number;
    entries: number;
  }>;
}

export class TimeTrackingService {
  /**
   * 创建时间记录
   */
  static async createTimeEntry(data: CreateTimeEntryData): Promise<any> {
    // 验证任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      select: { id: true, title: true }
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    // 如果提供了结束时间，计算持续时间
    let duration: number | undefined;
    if (data.endTime) {
      duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)); // 分钟
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        duration
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return timeEntry;
  }

  /**
   * 获取时间记录列表
   */
  static async getTimeEntries(
    filters: TimeEntryFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ data: any[]; total: number; pagination: any }> {
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
        where.startTime.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.startTime.lte = filters.dateTo;
      }
    }

    if (filters.isRunning !== undefined) {
      if (filters.isRunning) {
        where.endTime = null;
      } else {
        where.endTime = { not: null };
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
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      data: timeEntries,
      total,
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
  static async getTimeEntryById(timeEntryId: string): Promise<any> {
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!timeEntry) {
      throw new Error('时间记录不存在');
    }

    return timeEntry;
  }

  /**
   * 更新时间记录
   */
  static async updateTimeEntry(
    timeEntryId: string,
    data: UpdateTimeEntryData,
    userId: string
  ): Promise<any> {
    // 检查时间记录是否存在和权限
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      select: { userId: true, startTime: true, endTime: true }
    });

    if (!existingEntry) {
      throw new Error('时间记录不存在');
    }

    if (existingEntry.userId !== userId) {
      throw new Error('无权修改此时间记录');
    }

    // 计算新的持续时间
    let duration = existingEntry.endTime ?
      Math.round((existingEntry.endTime.getTime() - existingEntry.startTime.getTime()) / (1000 * 60)) :
      undefined;

    if (data.startTime || data.endTime) {
      const startTime = data.startTime || existingEntry.startTime;
      const endTime = data.endTime || existingEntry.endTime;

      if (endTime) {
        duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: {
        ...data,
        duration
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updatedEntry;
  }

  /**
   * 删除时间记录
   */
  static async deleteTimeEntry(timeEntryId: string, userId: string): Promise<void> {
    // 检查时间记录是否存在和权限
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      select: { userId: true }
    });

    if (!existingEntry) {
      throw new Error('时间记录不存在');
    }

    if (existingEntry.userId !== userId) {
      throw new Error('无权删除此时间记录');
    }

    await prisma.timeEntry.delete({
      where: { id: timeEntryId }
    });
  }

  /**
   * 开始时间跟踪
   */
  static async startTimeTracking(
    taskId: string,
    userId: string,
    description?: string
  ): Promise<any> {
    // 检查是否已有运行中的时间记录
    const runningEntry = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null
      }
    });

    if (runningEntry) {
      throw new Error('已有运行中的时间记录，请先停止当前记录');
    }

    return await this.createTimeEntry({
      taskId,
      userId,
      description,
      startTime: new Date()
    });
  }

  /**
   * 停止时间跟踪
   */
  static async stopTimeTracking(timeEntryId: string, userId: string): Promise<any> {
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId },
      select: { userId: true, startTime: true, endTime: true }
    });

    if (!timeEntry) {
      throw new Error('时间记录不存在');
    }

    if (timeEntry.userId !== userId) {
      throw new Error('无权操作此时间记录');
    }

    if (timeEntry.endTime) {
      throw new Error('时间记录已经停止');
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));

    return await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: {
        endTime,
        duration
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * 获取用户当前运行中的时间记录
   */
  static async getRunningTimeEntry(userId: string): Promise<any | null> {
    const runningEntry = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    return runningEntry;
  }

  /**
   * 获取时间跟踪统计
   */
  static async getTimeTrackingStats(
    userId?: string,
    taskId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<TimeTrackingStats> {
    const where: any = {};

    if (userId) where.userId = userId;
    if (taskId) where.taskId = taskId;
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = dateFrom;
      if (dateTo) where.startTime.lte = dateTo;
    }

    // 只统计已完成的时间记录
    where.endTime = { not: null };

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalEntries = timeEntries.length;
    const durations = timeEntries.map(entry => entry.duration || 0).filter(d => d > 0);

    const averageSessionTime = durations.length > 0 ?
      Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
    const longestSession = durations.length > 0 ? Math.max(...durations) : 0;
    const shortestSession = durations.length > 0 ? Math.min(...durations) : 0;

    // 按天统计
    const byDayMap = new Map<string, { totalTime: number; entries: number }>();
    timeEntries.forEach(entry => {
      const date = entry.startTime.toISOString().split('T')[0];
      const existing = byDayMap.get(date) || { totalTime: 0, entries: 0 };
      byDayMap.set(date, {
        totalTime: existing.totalTime + (entry.duration || 0),
        entries: existing.entries + 1
      });
    });

    const byDay = Array.from(byDayMap.entries()).map(([date, stats]) => ({
      date,
      ...stats
    }));

    // 按任务统计
    const byTaskMap = new Map<string, { taskTitle: string; totalTime: number; entries: number }>();
    timeEntries.forEach(entry => {
      const taskKey = entry.taskId;
      const existing = byTaskMap.get(taskKey) || {
        taskTitle: entry.task.title,
        totalTime: 0,
        entries: 0
      };
      byTaskMap.set(taskKey, {
        taskTitle: entry.task.title,
        totalTime: existing.totalTime + (entry.duration || 0),
        entries: existing.entries + 1
      });
    });

    const byTask = Array.from(byTaskMap.entries()).map(([taskId, stats]) => ({
      taskId,
      ...stats
    }));

    return {
      totalTime,
      totalEntries,
      averageSessionTime,
      longestSession,
      shortestSession,
      byDay,
      byTask
    };
  }

  /**
   * 获取任务的时间跟踪统计
   */
  static async getTaskTimeStats(taskId: string): Promise<{
    totalTime: number;
    totalEntries: number;
    averageSessionTime: number;
    byUser: Array<{
      userId: string;
      userName: string;
      totalTime: number;
      entries: number;
    }>;
  }> {
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        taskId,
        endTime: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalEntries = timeEntries.length;
    const durations = timeEntries.map(entry => entry.duration || 0).filter(d => d > 0);
    const averageSessionTime = durations.length > 0 ?
      Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;

    // 按用户统计
    const byUserMap = new Map<string, { userName: string; totalTime: number; entries: number }>();
    timeEntries.forEach(entry => {
      const userId = entry.userId;
      const existing = byUserMap.get(userId) || {
        userName: entry.user.name || 'Unknown',
        totalTime: 0,
        entries: 0
      };
      byUserMap.set(userId, {
        userName: entry.user.name || 'Unknown',
        totalTime: existing.totalTime + (entry.duration || 0),
        entries: existing.entries + 1
      });
    });

    const byUser = Array.from(byUserMap.entries()).map(([userId, stats]) => ({
      userId,
      ...stats
    }));

    return {
      totalTime,
      totalEntries,
      averageSessionTime,
      byUser
    };
  }
}
