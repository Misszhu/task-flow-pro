import { PrismaClient } from '@prisma/client';
import {
  CreateNotificationRequest,
  Notification,
  NotificationFilters,
  PaginatedResponse,
  PaginationParams
} from '@task-flow-pro/shared-types';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * 创建通知
   */
  static async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        userId: data.userId,
        taskId: data.taskId
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
      }
    });

    return notification as unknown as Notification;
  }

  /**
   * 获取用户通知列表
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Notification>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
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
    const total = await prisma.notification.count({ where });

    // 获取通知列表
    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        task: {
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
      data: notifications as unknown as Notification[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取未读通知数量
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  /**
   * 标记通知为已读
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true }
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new Error('无权操作此通知');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  /**
   * 标记所有通知为已读
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  /**
   * 删除通知
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true }
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new Error('无权删除此通知');
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  /**
   * 批量创建通知
   */
  static async createBulkNotifications(notifications: CreateNotificationRequest[]): Promise<void> {
    await prisma.notification.createMany({
      data: notifications.map(notif => ({
        title: notif.title,
        content: notif.content,
        type: notif.type,
        userId: notif.userId,
        taskId: notif.taskId
      }))
    });
  }

  /**
   * 发送任务分配通知
   */
  static async sendTaskAssignedNotification(
    taskId: string,
    assigneeId: string,
    taskTitle: string
  ): Promise<void> {
    await this.createNotification({
      title: '任务分配',
      content: `您被分配了新任务: ${taskTitle}`,
      type: 'TASK_ASSIGNED',
      userId: assigneeId,
      taskId
    });
  }

  /**
   * 发送任务更新通知
   */
  static async sendTaskUpdatedNotification(
    taskId: string,
    userId: string,
    taskTitle: string,
    changes: string[]
  ): Promise<void> {
    await this.createNotification({
      title: '任务更新',
      content: `任务 "${taskTitle}" 已更新: ${changes.join(', ')}`,
      type: 'TASK_UPDATED',
      userId,
      taskId
    });
  }

  /**
   * 发送任务完成通知
   */
  static async sendTaskCompletedNotification(
    taskId: string,
    creatorId: string,
    taskTitle: string
  ): Promise<void> {
    await this.createNotification({
      title: '任务完成',
      content: `任务 "${taskTitle}" 已完成`,
      type: 'TASK_COMPLETED',
      userId: creatorId,
      taskId
    });
  }

  /**
   * 发送任务评论通知
   */
  static async sendTaskCommentedNotification(
    taskId: string,
    taskTitle: string,
    commenterName: string,
    commentContent: string,
    notifyUserIds: string[]
  ): Promise<void> {
    const notifications = notifyUserIds.map(userId => ({
      title: '任务评论',
      content: `${commenterName} 在任务 "${taskTitle}" 中评论: ${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}`,
      type: 'TASK_COMMENTED' as const,
      userId,
      taskId
    }));

    await this.createBulkNotifications(notifications);
  }

  /**
   * 发送任务即将到期通知
   */
  static async sendTaskDueSoonNotification(
    taskId: string,
    assigneeId: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<void> {
    await this.createNotification({
      title: '任务即将到期',
      content: `任务 "${taskTitle}" 将在 ${dueDate.toLocaleDateString()} 到期`,
      type: 'TASK_DUE_SOON',
      userId: assigneeId,
      taskId
    });
  }

  /**
   * 发送任务逾期通知
   */
  static async sendTaskOverdueNotification(
    taskId: string,
    assigneeId: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<void> {
    await this.createNotification({
      title: '任务逾期',
      content: `任务 "${taskTitle}" 已逾期 (原定于 ${dueDate.toLocaleDateString()})`,
      type: 'TASK_OVERDUE',
      userId: assigneeId,
      taskId
    });
  }

  /**
   * 发送依赖阻塞通知
   */
  static async sendDependencyBlockedNotification(
    taskId: string,
    assigneeId: string,
    taskTitle: string,
    blockedByTaskTitle: string
  ): Promise<void> {
    await this.createNotification({
      title: '任务被阻塞',
      content: `任务 "${taskTitle}" 被 "${blockedByTaskTitle}" 阻塞`,
      type: 'DEPENDENCY_BLOCKED',
      userId: assigneeId,
      taskId
    });
  }

  /**
   * 发送依赖解除通知
   */
  static async sendDependencyUnblockedNotification(
    taskId: string,
    assigneeId: string,
    taskTitle: string,
    unblockedByTaskTitle: string
  ): Promise<void> {
    await this.createNotification({
      title: '任务解除阻塞',
      content: `任务 "${taskTitle}" 已解除阻塞 (依赖任务 "${unblockedByTaskTitle}" 已完成)`,
      type: 'DEPENDENCY_UNBLOCKED',
      userId: assigneeId,
      taskId
    });
  }

  /**
   * 清理旧通知
   */
  static async cleanupOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        isRead: true
      }
    });

    return result.count;
  }

  /**
   * 获取通知统计
   */
  static async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { id: true }
      })
    ]);

    const byTypeMap: Record<string, number> = {};
    byType.forEach(item => {
      byTypeMap[item.type] = item._count.id;
    });

    return {
      total,
      unread,
      byType: byTypeMap
    };
  }
}
