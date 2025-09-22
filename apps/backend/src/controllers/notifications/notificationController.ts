import { Request, Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { NotificationService } from '../../services/tasks/notificationService';
import { RequestContext } from '../../types/api';

export class NotificationController {
  /**
   * 获取用户通知列表
   */
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const {
        page = 1,
        limit = 20,
        type,
        isRead,
        dateFrom,
        dateTo
      } = req.query;

      const filters = {
        type: type as string,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };

      const pagination = {
        page: parseInt(page as string) || 1,
        limit: Math.min(parseInt(limit as string) || 20, 100)
      };

      const result = await NotificationService.getUserNotifications(
        userId,
        filters,
        pagination
      );

      ApiResponseUtil.success(
        res,
        result,
        '获取通知列表成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取通知列表失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取通知列表失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取未读通知数量
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const count = await NotificationService.getUnreadCount(userId);

      ApiResponseUtil.success(
        res,
        { unreadCount: count },
        '获取未读通知数量成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取未读通知数量失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 标记通知为已读
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        ApiResponseUtil.badRequest(res, '缺少通知ID参数', req.context);
        return;
      }

      await NotificationService.markAsRead(notificationId, userId);

      ApiResponseUtil.success(
        res,
        null,
        '标记通知为已读成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      if (error instanceof Error && error.message === '通知不存在') {
        ApiResponseUtil.notFound(res, '通知不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权操作此通知') {
        ApiResponseUtil.forbidden(res, '无权操作此通知', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '标记通知为已读失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 标记所有通知为已读
   */
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      await NotificationService.markAllAsRead(userId);

      ApiResponseUtil.success(
        res,
        null,
        '标记所有通知为已读成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      ApiResponseUtil.serverError(
        res,
        '标记所有通知为已读失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 删除通知
   */
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        ApiResponseUtil.badRequest(res, '缺少通知ID参数', req.context);
        return;
      }

      await NotificationService.deleteNotification(notificationId, userId);

      ApiResponseUtil.success(
        res,
        null,
        '删除通知成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('删除通知失败:', error);
      if (error instanceof Error && error.message === '通知不存在') {
        ApiResponseUtil.notFound(res, '通知不存在', req.context);
        return;
      }
      if (error instanceof Error && error.message === '无权删除此通知') {
        ApiResponseUtil.forbidden(res, '无权删除此通知', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '删除通知失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取通知统计
   */
  static async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const stats = await NotificationService.getNotificationStats(userId);

      ApiResponseUtil.success(
        res,
        stats,
        '获取通知统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取通知统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取通知统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }
}
