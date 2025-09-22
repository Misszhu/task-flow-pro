import { Request, Response } from 'express';
import { ApiResponseUtil } from '../../utils/apiResponse';
import { TaskDependencyService } from '../../services/taskDependencies/taskDependencyService';
import { RequestContext } from '../../types/api';

export class TaskDependencyController {
  /**
   * 创建任务依赖关系
   */
  static async createDependency(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { predecessorId, successorId } = req.body;

      if (!predecessorId || !successorId) {
        ApiResponseUtil.badRequest(res, '缺少前置任务ID或后置任务ID参数', req.context);
        return;
      }

      if (predecessorId === successorId) {
        ApiResponseUtil.badRequest(res, '任务不能依赖自己', req.context);
        return;
      }

      const dependency = await TaskDependencyService.createDependency({
        predecessorId,
        successorId
      });

      ApiResponseUtil.success(
        res,
        dependency,
        '创建依赖关系成功',
        201,
        req.context
      );
    } catch (error) {
      console.error('创建依赖关系失败:', error);
      if (error instanceof Error) {
        if (error.message === '前置任务不存在' || error.message === '后置任务不存在') {
          ApiResponseUtil.notFound(res, error.message, req.context);
          return;
        }
        if (error.message === '依赖关系已存在') {
          ApiResponseUtil.conflict(res, error.message, req.context);
          return;
        }
        if (error.message === '创建此依赖关系会导致循环依赖') {
          ApiResponseUtil.badRequest(res, error.message, req.context);
          return;
        }
      }
      ApiResponseUtil.serverError(
        res,
        '创建依赖关系失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取任务的依赖关系
   */
  static async getTaskDependencies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.params;
      const { type = 'predecessors' } = req.query;

      if (!taskId) {
        ApiResponseUtil.badRequest(res, '缺少任务ID参数', req.context);
        return;
      }

      if (type !== 'predecessors' && type !== 'successors') {
        ApiResponseUtil.badRequest(res, '类型参数必须是 predecessors 或 successors', req.context);
        return;
      }

      const dependencies = await TaskDependencyService.getTaskDependencies(
        taskId,
        type as 'predecessors' | 'successors'
      );

      ApiResponseUtil.success(
        res,
        dependencies,
        '获取依赖关系成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取依赖关系失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取依赖关系失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取所有依赖关系
   */
  static async getAllDependencies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId, type } = req.query;

      const filters = {
        taskId: taskId as string,
        type: type as 'predecessors' | 'successors'
      };

      const dependencies = await TaskDependencyService.getAllDependencies(filters);

      ApiResponseUtil.success(
        res,
        dependencies,
        '获取所有依赖关系成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取所有依赖关系失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取所有依赖关系失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 删除依赖关系
   */
  static async deleteDependency(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { dependencyId } = req.params;

      if (!dependencyId) {
        ApiResponseUtil.badRequest(res, '缺少依赖关系ID参数', req.context);
        return;
      }

      await TaskDependencyService.deleteDependency(dependencyId);

      ApiResponseUtil.success(
        res,
        null,
        '删除依赖关系成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('删除依赖关系失败:', error);
      if (error instanceof Error && error.message === '依赖关系不存在') {
        ApiResponseUtil.notFound(res, '依赖关系不存在', req.context);
        return;
      }
      ApiResponseUtil.serverError(
        res,
        '删除依赖关系失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取被阻塞的任务
   */
  static async getBlockedTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { taskId } = req.query;

      const blockedTasks = await TaskDependencyService.getBlockedTasks(taskId as string);

      ApiResponseUtil.success(
        res,
        blockedTasks,
        '获取被阻塞的任务成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取被阻塞的任务失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取被阻塞的任务失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取关键路径
   */
  static async getCriticalPath(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { projectId } = req.query;

      const criticalPath = await TaskDependencyService.getCriticalPath(projectId as string);

      ApiResponseUtil.success(
        res,
        { criticalPath },
        '获取关键路径成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取关键路径失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取关键路径失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 获取依赖关系统计
   */
  static async getDependencyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { projectId } = req.query;

      const stats = await TaskDependencyService.getDependencyStats(projectId as string);

      ApiResponseUtil.success(
        res,
        stats,
        '获取依赖关系统计成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('获取依赖关系统计失败:', error);
      ApiResponseUtil.serverError(
        res,
        '获取依赖关系统计失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 批量创建依赖关系
   */
  static async createBulkDependencies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const { dependencies } = req.body;

      if (!Array.isArray(dependencies) || dependencies.length === 0) {
        ApiResponseUtil.badRequest(res, '依赖关系数组不能为空', req.context);
        return;
      }

      const results = await TaskDependencyService.createBulkDependencies(dependencies);

      ApiResponseUtil.success(
        res,
        {
          created: results.length,
          total: dependencies.length,
          dependencies: results
        },
        `成功创建 ${results.length}/${dependencies.length} 个依赖关系`,
        201,
        req.context
      );
    } catch (error) {
      console.error('批量创建依赖关系失败:', error);
      ApiResponseUtil.serverError(
        res,
        '批量创建依赖关系失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 检查循环依赖
   */
  static async checkCircularDependencies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const circularDependencies = await TaskDependencyService.findCircularDependencies();

      ApiResponseUtil.success(
        res,
        { circularDependencies },
        '检查循环依赖成功',
        200,
        req.context
      );
    } catch (error) {
      console.error('检查循环依赖失败:', error);
      ApiResponseUtil.serverError(
        res,
        '检查循环依赖失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }

  /**
   * 清理无效的依赖关系
   */
  static async cleanupInvalidDependencies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ApiResponseUtil.unauthorized(res, '未认证', req.context);
        return;
      }

      const deletedCount = await TaskDependencyService.cleanupInvalidDependencies();

      ApiResponseUtil.success(
        res,
        { deletedCount },
        `清理了 ${deletedCount} 个无效的依赖关系`,
        200,
        req.context
      );
    } catch (error) {
      console.error('清理无效依赖关系失败:', error);
      ApiResponseUtil.serverError(
        res,
        '清理无效依赖关系失败',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        req.context
      );
    }
  }
}