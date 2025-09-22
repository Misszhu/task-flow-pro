import { Request, Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { WebSocketService } from '../../services/websocket/websocketService';
import { RequestContext } from '../../types/api';

export class WebSocketController {
  private static webSocketService: WebSocketService;

  /**
   * 设置 WebSocket 服务实例
   */
  static setWebSocketService(service: WebSocketService): void {
    this.webSocketService = service;
  }

  /**
   * 获取 WebSocket 连接信息
   */
  static async getConnectionInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const roomInfo = this.webSocketService.getRoomInfo();
      const onlineCount = this.webSocketService.getOnlineUserCount();

      ApiResponseUtil.success(
        res,
        {
          onlineUsers: onlineCount,
          rooms: roomInfo.rooms,
          totalConnections: roomInfo.totalConnections,
          isConnected: true
        },
        '获取连接信息成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取连接信息失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取连接信息失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 发送测试消息
   */
  static async sendTestMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { message, targetRoom } = req.body;

      if (!message) {
        ApiResponseUtil.badRequest(res, '缺少消息内容', req.context);
        return;
      }

      if (targetRoom) {
        this.webSocketService.sendSystemMessage(message, targetRoom);
      } else {
        this.webSocketService.sendSystemMessage(message);
      }

      ApiResponseUtil.success(
        res,
        { message, targetRoom },
        '发送测试消息成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('发送测试消息失败:', error);
      ApiResponseUtil.serverError(
        res,
        '发送测试消息失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 发送通知给用户
   */
  static async sendNotificationToUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { targetUserId, type, title, content, taskId, projectId } = req.body;

      if (!targetUserId || !type || !title || !content) {
        ApiResponseUtil.badRequest(res, '缺少必要参数', req.context);
        return;
      }

      const notification = {
        type,
        title,
        content,
        taskId,
        projectId,
        userId: targetUserId,
        timestamp: new Date()
      };

      this.webSocketService.sendNotificationToUser(targetUserId, notification);

      ApiResponseUtil.success(
        res,
        notification,
        '发送通知成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('发送通知失败:', error);
      ApiResponseUtil.serverError(
        res,
        '发送通知失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 发送项目通知
   */
  static async sendProjectNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { projectId, type, title, content, taskId } = req.body;

      if (!projectId || !type || !title || !content) {
        ApiResponseUtil.badRequest(res, '缺少必要参数', req.context);
        return;
      }

      const notification = {
        type,
        title,
        content,
        taskId,
        projectId,
        userId,
        timestamp: new Date()
      };

      this.webSocketService.sendNotificationToProject(projectId, notification);

      ApiResponseUtil.success(
        res,
        notification,
        '发送项目通知成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('发送项目通知失败:', error);
      ApiResponseUtil.serverError(
        res,
        '发送项目通知失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 发送任务更新通知
   */
  static async sendTaskUpdate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { taskId, projectId, updates } = req.body;

      if (!taskId || !updates || !Array.isArray(updates)) {
        ApiResponseUtil.badRequest(res, '缺少必要参数', req.context);
        return;
      }

      const taskUpdate = {
        taskId,
        projectId,
        updates,
        updatedBy: userId,
        timestamp: new Date()
      };

      this.webSocketService.sendTaskUpdate(taskId, taskUpdate);

      ApiResponseUtil.success(
        res,
        taskUpdate,
        '发送任务更新成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('发送任务更新失败:', error);
      ApiResponseUtil.serverError(
        res,
        '发送任务更新失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 发送项目更新通知
   */
  static async sendProjectUpdate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { projectId, updates } = req.body;

      if (!projectId || !updates || !Array.isArray(updates)) {
        ApiResponseUtil.badRequest(res, '缺少必要参数', req.context);
        return;
      }

      const projectUpdate = {
        projectId,
        updates,
        updatedBy: userId,
        timestamp: new Date()
      };

      this.webSocketService.sendProjectUpdate(projectId, projectUpdate);

      ApiResponseUtil.success(
        res,
        projectUpdate,
        '发送项目更新成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('发送项目更新失败:', error);
      ApiResponseUtil.serverError(
        res,
        '发送项目更新失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 广播消息
   */
  static async broadcastMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { message, data } = req.body;

      if (!message) {
        ApiResponseUtil.badRequest(res, '缺少消息内容', req.context);
        return;
      }

      this.webSocketService.broadcast(message, data);

      ApiResponseUtil.success(
        res,
        { message, data },
        '广播消息成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('广播消息失败:', error);
      ApiResponseUtil.serverError(
        res,
        '广播消息失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 断开用户连接
   */
  static async disconnectUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const { targetUserId } = req.params;

      if (!targetUserId) {
        ApiResponseUtil.badRequest(res, '缺少目标用户ID', req.context);
        return;
      }

      this.webSocketService.disconnectUser(targetUserId);

      ApiResponseUtil.success(
        res,
        { targetUserId },
        '断开用户连接成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('断开用户连接失败:', error);
      ApiResponseUtil.serverError(
        res,
        '断开用户连接失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取在线用户统计
   */
  static async getOnlineStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      if (!this.webSocketService) {
        ApiResponseUtil.serverError(res, 'WebSocket 服务未初始化', req.context);
        return;
      }

      const onlineCount = this.webSocketService.getOnlineUserCount();
      const roomInfo = this.webSocketService.getRoomInfo();

      ApiResponseUtil.success(
        res,
        {
          onlineUsers: onlineCount,
          totalConnections: roomInfo.totalConnections,
          activeRooms: Object.keys(roomInfo.rooms).length,
          roomDetails: roomInfo.rooms
        },
        '获取在线统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取在线统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取在线统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }
}
