import { Request, Response } from 'express';
import { TaskCommentService } from '../../services/tasks/taskCommentService';
import { TaskTagService } from '../../services/tasks/taskTagService';
import { SubtaskService } from '../../services/tasks/subtaskService';
import { TaskActivityService } from '../../services/tasks/taskActivityService';
import { ResponseUtil } from '../../utils/response';
import {
  CreateTaskCommentRequest,
  UpdateTaskCommentRequest,
  CreateTaskTagRequest,
  UpdateTaskTagRequest,
  AssignTaskTagRequest,
  CreateSubtaskRequest,
  TaskActivityFilters,
  PaginationParams
} from '@task-flow-pro/shared-types';

export class TaskCollaborationController {
  // ==================== 任务评论相关 ====================

  /**
   * 创建任务评论
   */
  static async createComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;
      const data: CreateTaskCommentRequest = req.body;

      if (!data.content) {
        ResponseUtil.error(res, '评论内容不能为空', 400);
        return;
      }

      // 检查权限
      const hasPermission = await TaskCommentService.checkCommentPermission(req.user.userId, taskId);
      if (!hasPermission) {
        ResponseUtil.forbidden(res, '无权访问此任务');
        return;
      }

      const comment = await TaskCommentService.createComment(taskId, data, req.user.userId);

      // 记录活动日志
      await TaskActivityService.logActivity(
        taskId,
        req.user.userId,
        'commented',
        `添加了评论: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`
      );

      ResponseUtil.created(res, comment, '添加评论成功');
    } catch (error) {
      ResponseUtil.serverError(res, '添加评论失败');
    }
  }

  /**
   * 获取任务评论列表
   */
  static async getTaskComments(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;

      // 检查权限
      const hasPermission = await TaskCommentService.checkCommentPermission(req.user.userId, taskId);
      if (!hasPermission) {
        ResponseUtil.forbidden(res, '无权访问此任务');
        return;
      }

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await TaskCommentService.getTaskComments(taskId, pagination);
      ResponseUtil.success(res, result, '获取评论列表成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取评论列表失败');
    }
  }

  /**
   * 更新评论
   */
  static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { commentId } = req.params;
      const data: UpdateTaskCommentRequest = req.body;

      if (!data.content) {
        ResponseUtil.error(res, '评论内容不能为空', 400);
        return;
      }

      const comment = await TaskCommentService.updateComment(commentId, data, req.user.userId);
      ResponseUtil.success(res, comment, '更新评论成功');
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新评论失败';
      const statusCode = message.includes('无权') ? 403 : message.includes('不存在') ? 404 : 500;
      ResponseUtil.error(res, message, statusCode);
    }
  }

  /**
   * 删除评论
   */
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { commentId } = req.params;

      await TaskCommentService.deleteComment(commentId, req.user.userId);
      ResponseUtil.success(res, null, '删除评论成功');
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除评论失败';
      const statusCode = message.includes('无权') ? 403 : message.includes('不存在') ? 404 : 500;
      ResponseUtil.error(res, message, statusCode);
    }
  }

  // ==================== 任务标签相关 ====================

  /**
   * 创建标签
   */
  static async createTag(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const data: CreateTaskTagRequest = req.body;

      if (!data.name) {
        ResponseUtil.error(res, '标签名称不能为空', 400);
        return;
      }

      const tag = await TaskTagService.createTag(data);
      ResponseUtil.created(res, tag, '创建标签成功');
    } catch (error) {
      ResponseUtil.serverError(res, '创建标签失败');
    }
  }

  /**
   * 获取所有标签
   */
  static async getAllTags(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50
      };

      const result = await TaskTagService.getAllTags(pagination);
      ResponseUtil.success(res, result, '获取标签列表成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取标签列表失败');
    }
  }

  /**
   * 搜索标签
   */
  static async searchTags(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        ResponseUtil.error(res, '搜索关键词不能为空', 400);
        return;
      }

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await TaskTagService.searchTags(searchTerm, pagination);
      ResponseUtil.success(res, result, '搜索标签成功');
    } catch (error) {
      ResponseUtil.serverError(res, '搜索标签失败');
    }
  }

  /**
   * 为任务分配标签
   */
  static async assignTagsToTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;
      const { tagIds }: AssignTaskTagRequest = req.body;

      if (!Array.isArray(tagIds)) {
        ResponseUtil.error(res, '标签ID列表格式错误', 400);
        return;
      }

      await TaskTagService.assignTagsToTask(taskId, tagIds);

      // 记录活动日志
      await TaskActivityService.logActivity(
        taskId,
        req.user.userId,
        'tags_updated',
        `更新了任务标签，共${tagIds.length}个标签`
      );

      ResponseUtil.success(res, null, '分配标签成功');
    } catch (error) {
      ResponseUtil.serverError(res, '分配标签失败');
    }
  }

  /**
   * 获取任务的标签
   */
  static async getTaskTags(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;

      const tags = await TaskTagService.getTaskTags(taskId);
      ResponseUtil.success(res, tags, '获取任务标签成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取任务标签失败');
    }
  }

  // ==================== 子任务相关 ====================

  /**
   * 创建子任务
   */
  static async createSubtask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;
      const data: CreateSubtaskRequest = req.body;

      if (!data.title) {
        ResponseUtil.error(res, '子任务标题不能为空', 400);
        return;
      }

      const subtask = await SubtaskService.createSubtask(taskId, data, req.user.userId);

      // 记录活动日志
      await TaskActivityService.logActivity(
        taskId,
        req.user.userId,
        'subtask_created',
        `创建了子任务: ${data.title}`
      );

      ResponseUtil.created(res, subtask, '创建子任务成功');
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建子任务失败';
      const statusCode = message.includes('不存在') ? 404 : 500;
      ResponseUtil.error(res, message, statusCode);
    }
  }

  /**
   * 获取子任务列表
   */
  static async getSubtasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await SubtaskService.getSubtasks(taskId, pagination);
      ResponseUtil.success(res, result, '获取子任务列表成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取子任务列表失败');
    }
  }

  // ==================== 活动日志相关 ====================

  /**
   * 获取任务活动日志
   */
  static async getTaskActivities(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await TaskActivityService.getTaskActivities(taskId, pagination);
      ResponseUtil.success(res, result, '获取活动日志成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取活动日志失败');
    }
  }

  /**
   * 获取用户活动日志
   */
  static async getUserActivities(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await TaskActivityService.getUserActivities(req.user.userId, pagination);
      ResponseUtil.success(res, result, '获取用户活动日志成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取用户活动日志失败');
    }
  }

  /**
   * 获取活动统计
   */
  static async getActivityStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { taskId } = req.params;

      const stats = await TaskActivityService.getActivityStats(taskId);
      ResponseUtil.success(res, stats, '获取活动统计成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取活动统计失败');
    }
  }
}
