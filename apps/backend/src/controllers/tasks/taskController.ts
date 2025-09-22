import { Request, Response } from 'express';
import { TaskService } from '../../services/tasks/taskService';
import { ResponseUtil } from '../../utils/response';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  AssignTaskRequest,
  UpdateTaskStatusRequest,
  PaginationParams
} from '@task-flow-pro/shared-types';

export class TaskController {
  /**
   * 创建任务
   */
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const data: CreateTaskRequest = req.body;

      // 验证必填字段
      if (!data.title) {
        ResponseUtil.error(res, '任务标题是必填字段', 400);
        return;
      }

      // 如果指定了项目，验证用户是否有权限访问该项目
      if (data.projectId) {
        // 这里可以添加项目权限检查
        // 暂时跳过，后续可以完善
      }

      const task = await TaskService.createTask(data, req.user.userId);
      ResponseUtil.created(res, task, '创建任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '创建任务失败');
    }
  }

  /**
   * 获取任务列表
   */
  static async getTasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const filters: TaskFilters = {
        projectId: req.query.projectId as string,
        assigneeId: req.query.assigneeId as string,
        creatorId: req.query.creatorId as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
        dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
        search: req.query.search as string
      };

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await TaskService.getTasks(filters, pagination);
      ResponseUtil.success(res, result, '获取任务列表成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取任务列表失败');
    }
  }

  /**
   * 获取单个任务
   */
  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { id } = req.params;

      // 检查权限
      const hasPermission = await TaskService.checkTaskPermission(req.user.userId, id);
      if (!hasPermission) {
        ResponseUtil.forbidden(res, '无权访问此任务');
        return;
      }

      const task = await TaskService.getTaskById(id);
      if (!task) {
        ResponseUtil.notFound(res, '任务不存在');
        return;
      }

      ResponseUtil.success(res, task, '获取任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取任务失败');
    }
  }

  /**
   * 更新任务
   */
  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { id } = req.params;
      const data: UpdateTaskRequest = req.body;

      // 检查权限
      const hasPermission = await TaskService.checkTaskEditPermission(req.user.userId, id);
      if (!hasPermission) {
        ResponseUtil.forbidden(res, '无权编辑此任务');
        return;
      }

      const task = await TaskService.updateTask(id, data, req.user.userId);
      ResponseUtil.success(res, task, '更新任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '更新任务失败');
    }
  }

  /**
   * 删除任务
   */
  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { id } = req.params;

      // 检查权限（只有创建者可以删除）
      const task = await TaskService.getTaskById(id);
      if (!task) {
        ResponseUtil.notFound(res, '任务不存在');
        return;
      }

      if (task.creatorId !== req.user.userId) {
        ResponseUtil.forbidden(res, '只有任务创建者可以删除任务');
        return;
      }

      await TaskService.deleteTask(id);
      ResponseUtil.success(res, null, '删除任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '删除任务失败');
    }
  }

  /**
   * 分配任务
   */
  static async assignTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { id } = req.params;
      const { assigneeId }: AssignTaskRequest = req.body;

      if (!assigneeId) {
        ResponseUtil.error(res, '分配用户ID是必填字段', 400);
        return;
      }

      // 检查权限
      const hasPermission = await TaskService.checkTaskEditPermission(req.user.userId, id);
      if (!hasPermission) {
        ResponseUtil.forbidden(res, '无权分配此任务');
        return;
      }

      const task = await TaskService.assignTask(id, assigneeId);
      ResponseUtil.success(res, task, '分配任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '分配任务失败');
    }
  }

  /**
   * 更新任务状态
   */
  static async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const { id } = req.params;
      const { status }: UpdateTaskStatusRequest = req.body;

      if (!status) {
        ResponseUtil.error(res, '任务状态是必填字段', 400);
        return;
      }

      // 检查权限
      const hasPermission = await TaskService.checkTaskEditPermission(req.user.userId, id);
      if (!hasPermission) {
        ResponseUtil.forbidden(res, '无权更新此任务状态');
        return;
      }

      const task = await TaskService.updateTaskStatus(id, status);
      ResponseUtil.success(res, task, '更新任务状态成功');
    } catch (error) {
      ResponseUtil.serverError(res, '更新任务状态失败');
    }
  }

  /**
   * 获取我的任务
   */
  static async getMyTasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const filters: TaskFilters = {
        assigneeId: req.user.userId
      };

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await TaskService.getTasks(filters, pagination);
      ResponseUtil.success(res, result, '获取我的任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取我的任务失败');
    }
  }

  /**
   * 获取我创建的任务
   */
  static async getCreatedTasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, '未认证');
        return;
      }

      const filters: TaskFilters = {
        creatorId: req.user.userId
      };

      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await TaskService.getTasks(filters, pagination);
      ResponseUtil.success(res, result, '获取我创建的任务成功');
    } catch (error) {
      ResponseUtil.serverError(res, '获取我创建的任务失败');
    }
  }
}
